import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import { Rooms, Subscriptions } from '@rocket.chat/models';
import { Message } from '@rocket.chat/core-services';

import { settings } from '../../../settings/server';
import { roomCoordinator } from '../../../../server/lib/rooms/roomCoordinator';
import { RoomSettingsEnum } from '../../../../definition/IRoomTypeConfig';

export const saveRoomType = async function (rid, roomType, user, sendMessage = true) {
	if (!Match.test(rid, String)) {
		throw new Meteor.Error('invalid-room', 'Invalid room', {
			function: 'RocketChat.saveRoomType',
		});
	}
	if (roomType !== 'c' && roomType !== 'p') {
		throw new Meteor.Error('error-invalid-room-type', 'error-invalid-room-type', {
			function: 'RocketChat.saveRoomType',
			type: roomType,
		});
	}
	const room = await Rooms.findOneById(rid);
	if (room == null) {
		throw new Meteor.Error('error-invalid-room', 'error-invalid-room', {
			function: 'RocketChat.saveRoomType',
			_id: rid,
		});
	}

	if (!(await roomCoordinator.getRoomDirectives(room.t)?.allowRoomSettingChange(room, RoomSettingsEnum.TYPE))) {
		throw new Meteor.Error('error-direct-room', "Can't change type of direct rooms", {
			function: 'RocketChat.saveRoomType',
		});
	}

	const result = (await Rooms.setTypeById(rid, roomType)) && (await Subscriptions.updateTypeByRoomId(rid, roomType));
	if (!result) {
		return result;
	}

	if (sendMessage) {
		let message;
		if (roomType === 'c') {
			message = TAPi18n.__('public', {
				lng: (user && user.language) || settings.get('Language') || 'en',
			});
		} else {
			message = TAPi18n.__('private', {
				lng: (user && user.language) || settings.get('Language') || 'en',
			});
		}
		await Message.saveSystemMessage('room_changed_privacy', rid, message, user);
	}
	return result;
};
