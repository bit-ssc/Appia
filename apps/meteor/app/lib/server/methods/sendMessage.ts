import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import moment from 'moment';
import { api } from '@rocket.chat/core-services';
import { Messages, Users, Rooms } from '@rocket.chat/models';
import type { AtLeast, IMessage, IUser } from '@rocket.chat/core-typings';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { Random } from 'meteor/random';

import { canSendMessageAsync } from '../../../authorization/server/functions/canSendMessage';
import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { metrics } from '../../../metrics/server';
import { settings } from '../../../settings/server';
import { sendMessage } from '../functions';
import { RateLimiter } from '../lib';
import { SystemLogger } from '../../../../server/lib/logger/system';
import { reformatMessageAttachments } from '../../../../server/lib/appia/MessageFormatUtil';
import { createDirectMessage } from '../../../../server/methods/createDirectMessage';

export async function executeSendMessage(uid: IUser['_id'], message: AtLeast<IMessage, 'rid'>) {
	if (message.tshow && !message.tmid) {
		throw new Meteor.Error('invalid-params', 'tshow provided but missing tmid', {
			method: 'sendMessage',
		});
	}

	if (message.tmid && !settings.get('Threads_enabled')) {
		throw new Meteor.Error('error-not-allowed', 'not-allowed', {
			method: 'sendMessage',
		});
	}

	if (message.ts) {
		const tsDiff = Math.abs(moment(message.ts).diff(Date.now()));
		if (tsDiff > 60000) {
			throw new Meteor.Error('error-message-ts-out-of-sync', 'Message timestamp is out of sync', {
				method: 'sendMessage',
				message_ts: message.ts,
				server_ts: new Date().getTime(),
			});
		} else if (tsDiff > 10000) {
			message.ts = new Date();
		}
	} else {
		message.ts = new Date();
	}

	if (message.msg) {
		if (message.msg.length > (settings.get<number>('Message_MaxAllowedSize') ?? 0)) {
			throw new Meteor.Error('error-message-size-exceeded', 'Message size exceeds Message_MaxAllowedSize', {
				method: 'sendMessage',
			});
		}
	}

	const user = await Users.findOneById(uid, {
		projection: {
			username: 1,
			type: 1,
			name: 1,
		},
	});
	if (!user?.username) {
		throw new Meteor.Error('error-invalid-user', 'Invalid user');
	}

	let { rid } = message;

	// do not allow nested threads
	if (message.tmid) {
		const parentMessage = await Messages.findOneById(message.tmid, { projection: { rid: 1, tmid: 1 } });
		message.tmid = parentMessage?.tmid || message.tmid;

		if (parentMessage?.rid) {
			rid = parentMessage?.rid;
		}
	}

	if (!rid) {
		throw new Error("The 'rid' property on the message object is missing.");
	}

	try {
		const room = await canSendMessageAsync(rid, { uid, username: user.username, type: user.type });

		metrics.messagesSent.inc(); // TODO This line needs to be moved to it's proper place. See the comments on: https://github.com/RocketChat/Rocket.Chat/pull/5736
		return sendMessage(user, message, room, false);
	} catch (err: any) {
		SystemLogger.error({ msg: 'Error sending message:', err });

		const errorMessage = typeof err === 'string' ? err : err.error || err.message;
		void api.broadcast('notify.ephemeralMessage', uid, message.rid, {
			msg: TAPi18n.__(errorMessage, {}, user.language),
		});

		if (typeof err === 'string') {
			throw new Error(err);
		}

		throw err;
	}
}

function buildNewMessage({ username, _id: uid, name }, rid, message, isForwardMerged = false) {
	const { msg, attachments, file, files, mentions, md, channels, urls, msgType, msgData } = message;

	// 引用类的消息需要重新格式化，去掉链接前缀
	const replyMsgPrefixReg = /^\[\s]\(http[^)]+\)\s/;
	const formatMsg = msg.replace(replyMsgPrefixReg, '');
	const isReplyMessage = msg !== formatMsg;

	const tmpNewMessage = {
		_id: Random.id(),
		rid,
		msg: formatMsg,
		file,
		files,
		u: {
			_id: uid,
			username,
			name,
		},
	};

	if (!isReplyMessage) {
		tmpNewMessage.attachments = attachments;
	}

	if (msgType === 'forwardMergeMessage') {
		tmpNewMessage.msgType = 'forwardMergeMessage';
		tmpNewMessage.msgData = msgData;
	}

	if (isForwardMerged === true) {
		tmpNewMessage._id = message._id;
		tmpNewMessage.mentions = mentions;
		tmpNewMessage.md = md;
		tmpNewMessage.channels = channels;
		tmpNewMessage.urls = urls;
		tmpNewMessage.rid = message.rid;
		tmpNewMessage.ts = message.ts?.getTime();
		tmpNewMessage.u = message.u;
		tmpNewMessage._updateAt = message._updateAt?.getTime();
	}
	const newMessage = JSON.parse(JSON.stringify(tmpNewMessage));
	if (isForwardMerged !== true) {
		newMessage.ts = new Date(Date.now());
	}
	return newMessage;
}

async function _sendMessage(user, rid, message, isForwardMerged = false) {
	try {
		// 多次发送消息，重新拷贝
		const _message = isForwardMerged ? message : buildNewMessage(user, rid, message);
		SystemLogger.info(`转发的消息内容：${JSON.stringify(_message)}`);
		const { _id: uid } = user;
		await executeSendMessage(uid, _message);
		// reformatMessageAttachments(sendMessage);
	} catch (error) {
		SystemLogger.error(`转发消息出错了：${error}`);
		if ((error.error || error.message) === 'error-not-allowed') {
			throw new Meteor.Error(error.error || error.message, error.reason, {
				method: 'sendMessage',
			});
		}
	}
}

async function forwardMessageToRooms({ isForwardMerged, forwardRooms, forwardMessageIds }) {
	const uid = Meteor.userId();
	SystemLogger.info(`forwardMessage message uid:${uid},forwardRooms:${forwardRooms},messageIds:${forwardMessageIds}`);
	if (!forwardRooms) {
		SystemLogger.error(`不存在rid列表：${forwardRooms}`);
		return null;
	}
	const uniqueForwardRooms = [];
	forwardRooms.forEach((r) => {
		if (uniqueForwardRooms.includes(r)) {
			return;
		}
		uniqueForwardRooms.push(r);
	});
	const user = await Users.findOneById(uid);
	if (!user) {
		SystemLogger.error(`转发消息时用户不存在：${forwardRooms}`);
		return null;
	}
	const uniqueForwardMessageIds = [];
	const forwardMessages = [];

	await Promise.all(
		forwardMessageIds.map(async (id) => {
			if (uniqueForwardMessageIds.includes(id)) {
				return;
			}
			uniqueForwardMessageIds.push(id);

			const m = await Messages.findOneById(id);
			if (!m) {
				return;
			}

			forwardMessages.push(m);
		}),
	);

	const originRoomId = forwardMessages[0].rid;
	const originRoom = await Rooms.findOneById(originRoomId);
	if (!originRoom) {
		SystemLogger.error(`转发消息时源房间不存在：${originRoomId}`);
		return null;
	}
	const originRoomUserNames = [];
	if (originRoom.t === 'd') {
		await Promise.all(
			originRoom.uids.map(async (uid) => {
				const user = await Users.findOneById(uid);
				if (user) {
					originRoomUserNames.push(user.name);
				}
			}),
		);
	}

	await Promise.all(
		uniqueForwardRooms.map(async (rid) => {
			if (isForwardMerged === true) {
				const messages = [];
				await forwardMessages.forEach((message) => {
					messages.push(buildNewMessage(user, rid, message, true));
				});
				const msgData = {
					originRoom: {
						rid: originRoomId,
						name: originRoom.fname,
						names: originRoomUserNames,
					},
					messages,
				};
				const newMessage = {
					_id: Random.id(),
					msg: '[聊天记录]',
					msgType: 'forwardMergeMessage',
					msgData: JSON.stringify(msgData),
					rid,
					ts: new Date(Date.now()),
					u: {
						_id: user._id,
						username: user.username,
						name: user.name,
					},
				};
				SystemLogger.info(`转发的合并消息内容：${JSON.stringify(newMessage)}`);
				await _sendMessage(user, rid, newMessage, isForwardMerged);
			} else {
				await Promise.all(
					forwardMessages.map(async (message) => {
						await _sendMessage(user, rid, message);
					}),
				);
			}
		}),
	);
}

async function forwardMessageToUsers(message) {
	const ridList = [];
	await Promise.all(
		message.forwardUsers.map(async (forwardUserId) => {
			if (!forwardUserId) {
				return;
			}
			const user = await Users.findOneByIdOrUsername(forwardUserId);
			if (!user || !user?.username) {
				return;
			}
			const { rid } = await createDirectMessage([user.username], Meteor.userId());

			if (rid) {
				ridList.push(rid);
			}
		}),
	);

	if (!message.forwardRooms?.length) {
		message.forwardRooms = ridList;
	} else {
		await ridList.forEach((rid) => {
			message.forwardRooms.push(rid);
		});
	}
	delete message.forwardUsers;
	return forwardMessageToRooms(message);
}

export async function handleForwardMessage(message) {
	if (message.isForwardMessage) {
		if (!message.forwardMessageIds) {
			throw new Meteor.Error('error-forward-message', 'forward message is empty', {
				method: 'sendMessage',
			});
		}
		if (message.forwardUsers) {
			return forwardMessageToUsers(message);
		}
		if (message.forwardRooms) {
			return forwardMessageToRooms(message);
		}
		throw new Meteor.Error('error-forward-message', 'forward receivers is empty', {
			method: 'sendMessage',
		});
	}
}

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		sendMessage(message: AtLeast<IMessage, '_id' | 'rid' | 'msg'>): any;
	}
}

Meteor.methods<ServerMethods>({
	async sendMessage(message) {
		check(message, Object);
		console.log('sendMessage api message:', message);
		const uid = Meteor.userId();
		if (!uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'sendMessage',
			});
		}

		try {
			if (message.isForwardMessage) {
				return handleForwardMessage(message);
			}
			const sendMessage = await executeSendMessage(uid, message);
			await reformatMessageAttachments(sendMessage);
			return sendMessage;
		} catch (error: any) {
			if ((error.error || error.message) === 'error-not-allowed') {
				throw new Meteor.Error(error.error || error.message, error.reason, {
					method: 'sendMessage',
				});
			}
		}
	},
});
// Limit a user, who does not have the "bot" role, to sending 5 msgs/second
RateLimiter.limitMethod('sendMessage', 5, 1000, {
	async userId(userId: IUser['_id']) {
		return !(await hasPermissionAsync(userId, 'send-many-messages'));
	},
});
