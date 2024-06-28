import URL from 'url';
import QueryString from 'querystring';

import { Meteor } from 'meteor/meteor';
// import type { MessageAttachment, IMessage, IOmnichannelRoom } from '@rocket.chat/core-typings';
import type { IOmnichannelRoom } from '@rocket.chat/core-typings';
import { isQuoteAttachment } from '@rocket.chat/core-typings';
import { Messages, Users, Rooms } from '@rocket.chat/models';

import { createQuoteAttachment } from '../../../lib/createQuoteAttachment';
import { settings } from '../../settings/server';
import { callbacks } from '../../../lib/callbacks';
import { canAccessRoomAsync } from '../../authorization/server/functions/canAccessRoom';

// const recursiveRemoveAttachments = (attachments: MessageAttachment, deep = 1, quoteChainLimit: number): MessageAttachment => {
// 	if (attachments && isQuoteAttachment(attachments)) {
// 		if (deep < quoteChainLimit - 1) {
// 			attachments.attachments?.map((msg) => recursiveRemoveAttachments(msg, deep + 1, quoteChainLimit));
// 		} else {
// 			delete attachments.attachments;
// 		}
// 	}
//
// 	return attachments;
// };
//
// const validateAttachmentDeepness = (message: IMessage): IMessage => {
// 	if (!message?.attachments) {
// 		return message;
// 	}
//
// 	const quoteChainLimit = settings.get<number>('Message_QuoteChainLimit');
// 	if ((message.attachments && quoteChainLimit < 2) || isNaN(quoteChainLimit)) {
// 		delete message.attachments;
// 	}
//
// 	message.attachments = message.attachments?.map((attachment) => recursiveRemoveAttachments(attachment, 1, quoteChainLimit));
//
// 	return message;
// };

const recursiveRemove = (message, deep = 1) => {
	if (message) {
		const hasAttachment = 'attachments' in message && message.attachments !== null;
		if (hasAttachment && deep < settings.get('Message_QuoteChainLimit')) {
			message.attachments.map((msg) => recursiveRemove(msg, deep + 1));
		} else if (hasAttachment && deep === settings.get('Message_QuoteChainLimit')) {
			// 此处是为了在引用消息中展示文件内容
			let hasFile = false;
			message.attachments.forEach((attachment) => {
				if (!hasFile && attachment.type && attachment.type === 'file') {
					hasFile = true;
				}
			});
			if (!hasFile) {
				delete message.attachments;
			}
		} else {
			delete message.attachments;
		}
	}
	return message;
};

callbacks.add(
	'beforeSaveMessage',
	async (msg) => {
		// if no message is present, or the message doesn't have any URL, skip
		if (!msg?.urls?.length) {
			return msg;
		}

		const currentUser = await Users.findOneById(msg.u._id);

		for await (const item of msg.urls) {
			// if the URL doesn't belong to the current server, skip
			const { url } = item;
			const hostPattern = /https?:\/\/.*?\//i;
			item.url = url.replace(hostPattern, Meteor.absoluteUrl());

			if (!item.url.includes(Meteor.absoluteUrl())) {
				console.log('apps/meteor/app/oembed/server/jumpToMessage.js return1:', msg);
				console.log('Meteor.absoluteUrl():', Meteor.absoluteUrl(), 'item.url:', item.url);
				return;
			}

			const urlObj = URL.parse(item.url);

			// if the URL doesn't have query params (doesn't reference message) skip
			if (!urlObj.query) {
				continue;
			}

			const { msg: msgId } = QueryString.parse(urlObj.query);

			if (typeof msgId !== 'string') {
				continue;
			}

			const message = await Messages.findOneById(msgId);

			// const jumpToMessage = message && validateAttachmentDeepness(message);
			const jumpToMessage = message && recursiveRemove(message);
			if (!jumpToMessage) {
				continue;
			}

			// validates if user can see the message
			// user has to belong to the room the message was first wrote in
			const room = await Rooms.findOneById<IOmnichannelRoom>(jumpToMessage.rid);
			if (!room) {
				continue;
			}
			const isLiveChatRoomVisitor = !!msg.token && !!room.v?.token && msg.token === room.v.token;
			const canAccessRoomForUser = isLiveChatRoomVisitor || (currentUser && (await canAccessRoomAsync(room, currentUser)));
			if (!canAccessRoomForUser) {
				continue;
			}

			msg.attachments = msg.attachments || [];
			// Only QuoteAttachments have "message_link" property
			const index = msg.attachments.findIndex((a) => isQuoteAttachment(a) && a.message_link === item.url);
			if (index > -1) {
				msg.attachments.splice(index, 1);
			}

			const useRealName = Boolean(settings.get('UI_Use_Real_Name'));

			msg.attachments.push(createQuoteAttachment(jumpToMessage, item.url, useRealName));
			item.ignoreParse = true;
		}

		return msg;
	},
	callbacks.priority.LOW,
	'jumpToMessage',
);
