import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { Rooms } from '@rocket.chat/models';
import { Message } from '@rocket.chat/core-services';
import { Random } from 'meteor/random';

export const saveRoomAnnouncement = async function (rid, roomAnnouncement, user, sendMessage = true) {
	if (!Match.test(rid, String)) {
		throw new Meteor.Error('invalid-room', 'Invalid room', {
			function: 'RocketChat.saveRoomAnnouncement',
		});
	}

	let message;
	let announcementDetails;
	if (typeof roomAnnouncement === 'string') {
		message = roomAnnouncement;
	} else {
		({ message, ...announcementDetails } = roomAnnouncement);
	}
	const announcementInfo = { _id: Random.id(16), message, u: { _id: user._id, username: user.username, name: user.name }, readUsers: [] };
	const updated = await Rooms.setAnnouncementById(rid, announcementInfo, announcementDetails);
	if (updated && sendMessage) {
		await Message.saveSystemMessage('room_changed_announcement', rid, message, user);
	}

	return updated;
};

export const saveRoomAnnouncementRead = async function (rid, roomAnnouncementId, user) {
	if (!Match.test(rid, String)) {
		throw new Meteor.Error('invalid-room', 'Invalid room', {
			function: 'RocketChat.saveRoomAnnouncement',
		});
	}
	const room = await Rooms.findOneById(rid);
	if (!room) {
		throw new Meteor.Error('invalid-room', 'Invalid room', {
			function: 'saveRoomAnnouncementRead',
		});
	}
	if (!room.announcement || room.announcement._id !== roomAnnouncementId) {
		return;
	}

	return Rooms.setAnnouncementReadById(rid, roomAnnouncementId, user.username);
};
