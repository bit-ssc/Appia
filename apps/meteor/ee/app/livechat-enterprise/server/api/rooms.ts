import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import { isPOSTLivechatRoomPriorityParams } from '@rocket.chat/rest-typings';
import { LivechatRooms, Subscriptions } from '@rocket.chat/models';

import { API } from '../../../../../app/api/server';
import { hasPermissionAsync } from '../../../../../app/authorization/server/functions/hasPermission';
import { LivechatEnterprise } from '../lib/LivechatEnterprise';
import { removePriorityFromRoom, updateRoomPriority } from './lib/priorities';

API.v1.addRoute(
	'livechat/room.onHold',
	{ authRequired: true, permissionsRequired: ['on-hold-livechat-room'] },
	{
		async post() {
			const { roomId } = this.bodyParams;
			if (!roomId || roomId.trim() === '') {
				return API.v1.failure('Invalid room Id');
			}

			const room = await LivechatRooms.findOneById(roomId);
			if (!room || room.t !== 'l') {
				return API.v1.failure('Invalid room Id');
			}

			if (room.lastMessage?.token) {
				return API.v1.failure('You cannot place chat on-hold, when the Contact has sent the last message');
			}

			if (room.onHold) {
				return API.v1.failure('Room is already On-Hold');
			}

			if (!room.open) {
				return API.v1.failure('Room cannot be placed on hold after being closed');
			}

			const user = await Meteor.userAsync();
			if (!user) {
				return API.v1.failure('Invalid user');
			}

			const subscription = await Subscriptions.findOneByRoomIdAndUserId(roomId, user._id, { projection: { _id: 1 } });
			if (!subscription && !(await hasPermissionAsync(this.userId, 'on-hold-others-livechat-room'))) {
				return API.v1.failure('Not authorized');
			}

			const onHoldBy = { _id: user._id, username: user.username, name: (user as any).name };
			const comment = TAPi18n.__('Omnichannel_On_Hold_manually', {
				user: onHoldBy.name || `@${onHoldBy.username}`,
			});

			await LivechatEnterprise.placeRoomOnHold(room, comment, onHoldBy);

			return API.v1.success();
		},
	},
);

API.v1.addRoute(
	'livechat/room/:rid/priority',
	{
		authRequired: true,
		validateParams: { POST: isPOSTLivechatRoomPriorityParams },
		permissionsRequired: {
			POST: { permissions: ['view-l-room'], operation: 'hasAny' },
			DELETE: { permissions: ['view-l-room'], operation: 'hasAny' },
		},
	},
	{
		async post() {
			const { rid } = this.urlParams;
			const { priorityId } = this.bodyParams;

			if (!this.user.username) {
				return API.v1.failure('Invalid user');
			}

			await updateRoomPriority(
				rid,
				{
					_id: this.user._id,
					name: this.user.name || '',
					username: this.user.username,
				},
				priorityId,
			);

			return API.v1.success();
		},
		async delete() {
			const { rid } = this.urlParams;

			if (!this.user.username) {
				return API.v1.failure('Invalid user');
			}

			await removePriorityFromRoom(rid, {
				_id: this.user._id,
				name: this.user.name || '',
				username: this.user.username,
			});

			return API.v1.success();
		},
	},
);
