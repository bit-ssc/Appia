import { isEditedMessage, isOmnichannelRoom } from '@rocket.chat/core-typings';

import { callbacks } from '../../../../../lib/callbacks';
import { settings } from '../../../../../app/settings/server';
import { setPredictedVisitorAbandonmentTime } from '../lib/Helper';

callbacks.add(
	'afterSaveMessage',
	async function (message, room) {
		if (
			!settings.get('Livechat_abandoned_rooms_action') ||
			settings.get('Livechat_abandoned_rooms_action') === 'none' ||
			settings.get<number>('Livechat_visitor_inactivity_timeout') <= 0
		) {
			return message;
		}
		// skips this callback if the message was edited
		if (isEditedMessage(message)) {
			return message;
		}

		if (!isOmnichannelRoom(room)) {
			return message;
		}

		// message valid only if it is a livechat room
		if (!(typeof room.t !== 'undefined' && room.t === 'l' && room.v && room.v.token)) {
			return message;
		}
		// if the message has a type means it is a special message (like the closing comment), so skip it
		if (message.t) {
			return message;
		}
		const sentByAgent = !message.token;
		if (sentByAgent) {
			await setPredictedVisitorAbandonmentTime(room);
		}
		return message;
	},
	callbacks.priority.MEDIUM,
	'save-visitor-inactivity',
); // This hook priority should always be less than the priority of hook "save-last-visitor-message-timestamp" bcs, the room.v.lastMessage property set there is being used here for determining visitor abandonment
