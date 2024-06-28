import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';

import { saveRoomAnnouncementRead } from '../functions/saveRoomAnnouncement';

Meteor.methods({
	async roomAnnouncementRead(rid, announcementId) {
		const userId = Meteor.userId();

		if (!announcementId) {
			throw new Meteor.Error('error-invalid-announcementId', 'Invalid announcementId', {
				function: 'roomAnnouncementRead',
			});
		}
		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				function: 'roomAnnouncementRead',
			});
		}
		if (!Match.test(rid, String)) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'roomAnnouncementRead',
			});
		}

		const user = Meteor.user();
		await saveRoomAnnouncementRead(rid, announcementId, user);
		return {
			result: true,
		};
	},
});
