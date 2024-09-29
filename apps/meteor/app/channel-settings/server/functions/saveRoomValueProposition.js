import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { Random } from 'meteor/random';
import { Message } from '@rocket.chat/core-services';
import { Rooms } from '@rocket.chat/models';

export const saveRoomValueProposition = async function (rid, roomValueProposition, user, room, sendMessage = true) {
	if (!Match.test(rid, String)) {
		throw new Meteor.Error('invalid-room', 'Invalid room', {
			function: 'RocketChat.saveRoomValueProposition',
		});
	}

	let message;
	if (typeof roomValueProposition === 'string') {
		message = roomValueProposition;
	}

	const roomValuePropositionInfo = {
		_id: Random.id(16),
		message,
		u: { _id: user._id, username: user.username, name: user.name },
		readUsers: [],
	};
	const updated = await Rooms.setValuePropositionById(rid, roomValuePropositionInfo);

	if (updated && sendMessage) {
		const dbIsNotEmpty = room.valueProposition && room.valueProposition.message;
		let changeType;
		if (dbIsNotEmpty && message) {
			changeType = 'room_changed_value_proposition';
		} else if (dbIsNotEmpty && !message) {
			changeType = 'room_deleted_value_proposition';
		} else {
			changeType = 'room_created_value_proposition';
		}
		await Message.saveSystemMessage(changeType, rid, message, user);
	}
	return updated;
};
