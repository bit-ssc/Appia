import { Meteor } from 'meteor/meteor';
import { LivechatVisitors, Messages, LivechatRooms } from '@rocket.chat/models';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import type { ILivechatVisitor, IRoom } from '@rocket.chat/core-typings';

import { Livechat } from '../lib/Livechat';
import { methodDeprecationLogger } from '../../../lib/server/lib/deprecationWarningLogger';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'livechat:registerGuest'({
			token,
			name,
			email,
			department,
			customFields,
		}?: {
			token?: string;
			name?: string;
			email?: string;
			department?: string;
			customFields?: Array<{ key: string; value: string; overwrite: boolean; scope?: unknown }>;
		}): {
			userId: string;
			visitor: ILivechatVisitor | null;
		};
	}
}

Meteor.methods<ServerMethods>({
	async 'livechat:registerGuest'({ token, name, email, department, customFields } = {}) {
		methodDeprecationLogger.warn('livechat:registerGuest will be deprecated in future versions of Rocket.Chat');

		if (!token) {
			throw new Meteor.Error('error-invalid-token', 'Invalid token', { method: 'livechat:registerGuest' });
		}

		const userId = await Livechat.registerGuest.call(this, {
			token,
			name,
			email,
			department,
		});

		// update visited page history to not expire
		await Messages.keepHistoryForToken(token);

		const visitor = await LivechatVisitors.getVisitorByToken(token, {
			projection: {
				token: 1,
				name: 1,
				username: 1,
				visitorEmails: 1,
				department: 1,
			},
		});

		// If it's updating an existing visitor, it must also update the roomInfo
		const rooms: IRoom[] = await LivechatRooms.findOpenByVisitorToken(token).toArray();
		await Promise.all(rooms.map((room) => Livechat.saveRoomInfo(room, visitor)));

		if (customFields && customFields instanceof Array) {
			for await (const customField of customFields) {
				if (typeof customField !== 'object') {
					continue;
				}

				if (!customField.scope || customField.scope !== 'room') {
					const { key, value, overwrite } = customField;
					await LivechatVisitors.updateLivechatDataByToken(token, key, value, overwrite);
				}
			}
		}

		return {
			userId,
			visitor,
		};
	},
});
