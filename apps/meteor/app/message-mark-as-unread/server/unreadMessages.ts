import { Meteor } from 'meteor/meteor';
import { Messages, Subscriptions } from '@rocket.chat/models';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import type { IMessage, IRoom } from '@rocket.chat/core-typings';

import logger from './logger';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		unreadMessages(firstUnreadMessage?: IMessage, room?: IRoom['_id']): void;
	}
}

Meteor.methods<ServerMethods>({
	async unreadMessages(firstUnreadMessage, room) {
		const userId = Meteor.userId();
		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'unreadMessages',
			});
		}

		if (room && typeof room === 'string') {
			const lastMessage = (
				await Messages.findVisibleByRoomId(room, {
					limit: 1,
					sort: { ts: -1 },
				}).toArray()
			)[0];

			if (!lastMessage) {
				throw new Meteor.Error('error-no-message-for-unread', 'There are no messages to mark unread', {
					method: 'unreadMessages',
					action: 'Unread_messages',
				});
			}

			await Subscriptions.setAsUnreadByRoomIdAndUserId(lastMessage.rid, userId, lastMessage.ts);
			return;
		}

		if (typeof firstUnreadMessage?._id !== 'string') {
			throw new Meteor.Error('error-action-not-allowed', 'Not allowed', {
				method: 'unreadMessages',
				action: 'Unread_messages',
			});
		}

		const originalMessage = await Messages.findOneById(firstUnreadMessage._id, {
			projection: {
				u: 1,
				rid: 1,
				file: 1,
				ts: 1,
			},
		});
		if (!originalMessage || userId === originalMessage.u._id) {
			throw new Meteor.Error('error-action-not-allowed', 'Not allowed', {
				method: 'unreadMessages',
				action: 'Unread_messages',
			});
		}
		const lastSeen = (await Subscriptions.findOneByRoomIdAndUserId(originalMessage.rid, userId))?.ls;
		if (!lastSeen) {
			throw new Meteor.Error('error-subscription-not-found', 'Subscription not found', {
				method: 'unreadMessages',
				action: 'Unread_messages',
			});
		}

		if (firstUnreadMessage.ts >= lastSeen) {
			return logger.debug('Provided message is already marked as unread');
		}
		logger.debug(`Updating unread  message of ${originalMessage.ts} as the first unread`);
		await Subscriptions.setAsUnreadByRoomIdAndUserId(originalMessage.rid, userId, originalMessage.ts);
	},
});
