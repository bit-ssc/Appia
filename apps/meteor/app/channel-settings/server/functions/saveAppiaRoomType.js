import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { Rooms } from '@rocket.chat/models';

export const saveAppiaRoomType = async function (rid, appiaRoomType, user) {
	if (!Match.test(rid, String)) {
		throw new Meteor.Error('invalid-room', 'Invalid room', {
			function: 'RocketChat.saveRoomType',
		});
	}
	console.log(`saveAppiaRoomType rid:${rid} appiaRoomType:${appiaRoomType}`);
	const room = await Rooms.findOneById(rid);
	if (room == null) {
		throw new Meteor.Error('error-invalid-room', 'error-invalid-room', {
			function: 'RocketChat.saveAppiaRoomType',
			_id: rid,
		});
	}

	const result = await Rooms.setAppiaRoomTypeById(rid, appiaRoomType);
	if (!result) {
		return result;
	}
	return result;
};
