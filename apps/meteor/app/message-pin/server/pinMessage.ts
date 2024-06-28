import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import type { IMessage, IUser, MessageAttachment, MessageQuoteAttachment } from '@rocket.chat/core-typings';
import { isQuoteAttachment } from '@rocket.chat/core-typings';
import { Message } from '@rocket.chat/core-services';
import { Messages, Rooms, Subscriptions, Users } from '@rocket.chat/models';

import { settings } from '../../settings/server';
import { callbacks } from '../../../lib/callbacks';
import { isTheLastMessage } from '../../lib/server';
import { getUserAvatarURL } from '../../utils/lib/getUserAvatarURL';
import { canAccessRoomAsync, roomAccessAttributes } from '../../authorization/server';
import { hasPermissionAsync } from '../../authorization/server/functions/hasPermission';
import { Apps, AppEvents } from '../../../ee/server/apps/orchestrator';
import { isTruthy } from '../../../lib/isTruthy';

const recursiveRemove = (msg: MessageAttachment, deep = 1) => {
	if (!msg || !isQuoteAttachment(msg)) {
		return;
	}

	if (deep > (settings.get<number>('Message_QuoteChainLimit') ?? 0)) {
		delete msg.attachments;
		return msg;
	}

	msg.attachments = Array.isArray(msg.attachments)
		? msg.attachments.map((nestedMsg) => recursiveRemove(nestedMsg, deep + 1)).filter(isTruthy)
		: undefined;

	return msg;
};

const shouldAdd = (attachments: MessageAttachment[], attachment: MessageQuoteAttachment) =>
	!attachments.some((_attachment) => isQuoteAttachment(_attachment) && _attachment.message_link === attachment.message_link);

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		pinMessage(message: IMessage, pinnedAt?: Date): IMessage | null;
		unpinMessage(message: IMessage): boolean;
	}
}

Meteor.methods<ServerMethods>({
	async pinMessage(message, pinnedAt) {
		check(message._id, String);

		const userId = Meteor.userId();
		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'pinMessage',
			});
		}

		if (!settings.get('Message_AllowPinning')) {
			throw new Meteor.Error('error-action-not-allowed', 'Message pinning not allowed', {
				method: 'pinMessage',
				action: 'Message_pinning',
			});
		}

		let originalMessage = await Messages.findOneById(message._id);
		if (originalMessage == null || originalMessage._id == null) {
			throw new Meteor.Error('error-invalid-message', 'Message you are pinning was not found', {
				method: 'pinMessage',
				action: 'Message_pinning',
			});
		}

		const subscription = await Subscriptions.findOneByRoomIdAndUserId(originalMessage.rid, userId, { projection: { _id: 1 } });
		if (!subscription) {
			// If it's a valid message but on a room that the user is not subscribed to, report that the message was not found.
			throw new Meteor.Error('error-invalid-message', 'Message you are pinning was not found', {
				method: 'pinMessage',
				action: 'Message_pinning',
			});
		}

		if (!(await hasPermissionAsync(userId, 'pin-message', originalMessage.rid))) {
			throw new Meteor.Error('not-authorized', 'Not Authorized', { method: 'pinMessage' });
		}

		const me = await Users.findOneById<Required<Pick<IUser, '_id' | 'username' | 'name'>>>(userId, {
			projection: { username: 1, name: 1 },
		});
		if (!me) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'pinMessage' });
		}

		// If we keep history of edits, insert a new message to store history information
		if (settings.get('Message_KeepHistory') && me.username) {
			await Messages.cloneAndSaveAsHistoryById(message._id, me);
		}

		const room = await Rooms.findOneById(originalMessage.rid);
		if (!room) {
			throw new Meteor.Error('not-authorized', 'Not Authorized', { method: 'pinMessage' });
		}

		if (!(await canAccessRoomAsync(room, { _id: userId }))) {
			throw new Meteor.Error('not-authorized', 'Not Authorized', { method: 'pinMessage' });
		}

		originalMessage.pinned = true;
		originalMessage.pinnedAt = pinnedAt || new Date();
		originalMessage.pinnedBy = {
			_id: userId,
			username: me.username,
		};

		originalMessage = callbacks.run('beforeSaveMessage', originalMessage);

		await Messages.setPinnedByIdAndUserId(originalMessage._id, originalMessage.pinnedBy, originalMessage.pinned);
		if (isTheLastMessage(room, message)) {
			await Rooms.setLastMessagePinned(room._id, originalMessage.pinnedBy, originalMessage.pinned);
		}

		const attachments: MessageAttachment[] = [];

		if (Array.isArray(originalMessage.attachments)) {
			originalMessage.attachments.forEach((attachment) => {
				if (!isQuoteAttachment(attachment) || shouldAdd(attachments, attachment)) {
					attachments.push(attachment);
				}
			});
		}

		// App IPostMessagePinned event hook
		await Apps.triggerEvent(AppEvents.IPostMessagePinned, originalMessage, await Meteor.userAsync(), originalMessage.pinned);

		const msgId = await Message.saveSystemMessage('message_pinned', originalMessage.rid, '', me, {
			attachments: [
				{
					text: originalMessage.msg,
					author_name: originalMessage.u.username,
					author_icon: getUserAvatarURL(originalMessage.u.username),
					ts: originalMessage.ts,
					attachments: attachments.map(recursiveRemove),
				},
			],
		});

		return Messages.findOneById(msgId);
	},
	async unpinMessage(message) {
		check(message._id, String);

		const userId = Meteor.userId();

		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'unpinMessage',
			});
		}

		if (!settings.get('Message_AllowPinning')) {
			throw new Meteor.Error('error-action-not-allowed', 'Message pinning not allowed', {
				method: 'unpinMessage',
				action: 'Message_pinning',
			});
		}

		let originalMessage = await Messages.findOneById(message._id);
		if (originalMessage == null || originalMessage._id == null) {
			throw new Meteor.Error('error-invalid-message', 'Message you are unpinning was not found', {
				method: 'unpinMessage',
				action: 'Message_pinning',
			});
		}

		const subscription = await Subscriptions.findOneByRoomIdAndUserId(originalMessage.rid, userId, { projection: { _id: 1 } });
		if (!subscription) {
			// If it's a valid message but on a room that the user is not subscribed to, report that the message was not found.
			throw new Meteor.Error('error-invalid-message', 'Message you are unpinning was not found', {
				method: 'unpinMessage',
				action: 'Message_pinning',
			});
		}

		if (!(await hasPermissionAsync(userId, 'pin-message', originalMessage.rid))) {
			throw new Meteor.Error('not-authorized', 'Not Authorized', { method: 'unpinMessage' });
		}

		const me = await Users.findOneById<Required<Pick<IUser, '_id' | 'username' | 'name'>>>(userId, {
			projection: { username: 1, name: 1 },
		});
		if (!me) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'unpinMessage' });
		}

		// If we keep history of edits, insert a new message to store history information
		if (settings.get('Message_KeepHistory') && me.username) {
			await Messages.cloneAndSaveAsHistoryById(originalMessage._id, me);
		}

		originalMessage.pinned = false;
		originalMessage.pinnedBy = {
			_id: userId,
			username: me.username,
		};
		originalMessage = callbacks.run('beforeSaveMessage', originalMessage);

		const room = await Rooms.findOneById(originalMessage.rid, { projection: { ...roomAccessAttributes, lastMessage: 1 } });
		if (!room) {
			throw new Meteor.Error('not-authorized', 'Not Authorized', { method: 'unpinMessage' });
		}

		if (!(await canAccessRoomAsync(room, { _id: userId }))) {
			throw new Meteor.Error('not-authorized', 'Not Authorized', { method: 'unpinMessage' });
		}

		if (isTheLastMessage(room, message)) {
			await Rooms.setLastMessagePinned(room._id, originalMessage.pinnedBy, originalMessage.pinned);
		}

		// App IPostMessagePinned event hook
		await Apps.triggerEvent(AppEvents.IPostMessagePinned, originalMessage, await Meteor.userAsync(), originalMessage.pinned);

		await Messages.setPinnedByIdAndUserId(originalMessage._id, originalMessage.pinnedBy, originalMessage.pinned);

		return true;
	},
});
