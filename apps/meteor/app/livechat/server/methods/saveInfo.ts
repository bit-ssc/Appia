import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { isOmnichannelRoom } from '@rocket.chat/core-typings';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { LivechatRooms, Users } from '@rocket.chat/models';

import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { callbacks } from '../../../../lib/callbacks';
import { Livechat } from '../lib/Livechat';
import { methodDeprecationLogger } from '../../../lib/server/lib/deprecationWarningLogger';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'livechat:saveInfo'(
			guestData: {
				_id: string;
				name?: string;
				email?: string;
				phone?: string;
				livechatData?: Record<string, any>;
			},
			roomData: {
				_id: string;
				topic?: string;
				tags?: string[];
				livechatData?: Record<string, any>;
				priorityId?: string;
				slaId?: string;
			},
		): boolean;
	}
}

Meteor.methods<ServerMethods>({
	async 'livechat:saveInfo'(guestData, roomData) {
		methodDeprecationLogger.warn(
			'livechat:saveInfo method will be deprecated in future versions of Rocket.Chat. Use "livechat/room.saveInfo" endpoint instead.',
		);
		const userId = Meteor.userId();

		if (!userId || !(await hasPermissionAsync(userId, 'view-l-room'))) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveInfo' });
		}

		check(
			guestData,
			Match.ObjectIncluding({
				_id: String,
				name: Match.Optional(String),
				email: Match.Optional(String),
				phone: Match.Optional(String),
				livechatData: Match.Optional(Object),
			}),
		);

		check(
			roomData,
			Match.ObjectIncluding({
				_id: String,
				topic: Match.Optional(String),
				tags: Match.Optional([String]),
				livechatData: Match.Optional(Object),
				priorityId: Match.Optional(String),
				slaId: Match.Optional(String),
			}),
		);

		const room = await LivechatRooms.findOneById(roomData._id);
		if (!room || !isOmnichannelRoom(room)) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', { method: 'livechat:saveInfo' });
		}

		if ((!room.servedBy || room.servedBy._id !== userId) && !(await hasPermissionAsync(userId, 'save-others-livechat-room-info'))) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveInfo' });
		}

		if (room.sms) {
			delete guestData.phone;
		}

		await Promise.allSettled([Livechat.saveGuest(guestData), Livechat.saveRoomInfo(roomData)]);

		const user = await Users.findOne({ _id: userId }, { projection: { _id: 1, username: 1 } });

		Meteor.defer(async () => {
			callbacks.run('livechat.saveInfo', await LivechatRooms.findOneById(roomData._id), {
				user,
				oldRoom: room,
			});
		});

		return true;
	},
});
