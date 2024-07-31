import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import _ from 'underscore';
import moment from 'moment';
import { api } from '@rocket.chat/core-services';
import { Users } from '@rocket.chat/models';
import { isEditedMessage } from '@rocket.chat/core-typings';

import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { callbacks } from '../../../../lib/callbacks';

callbacks.add(
	'beforeSaveMessage',
	async function (message) {
		// If the message was edited, or is older than 60 seconds (imported)
		// the notifications will be skipped, so we can also skip this validation
		if (isEditedMessage(message) || (message.ts && Math.abs(moment(message.ts).diff(moment())) > 60000)) {
			return message;
		}

		// Test if the message mentions include @all.
		if (message.mentions != null && _.pluck(message.mentions, '_id').some((item) => item === 'all')) {
			// Check if the user has permissions to use @all in both global and room scopes.
			if (
				!(await hasPermissionAsync(message.u._id, 'mention-all')) &&
				!(await hasPermissionAsync(message.u._id, 'mention-all', message.rid))
			) {
				// Get the language of the user for the error notification.
				const { language } = (await Users.findOneById(message.u._id)) || {};
				const action = TAPi18n.__('Notify_all_in_this_room', {}, language);

				// Add a notification to the chat, informing the user that this
				// action is not allowed.
				void api.broadcast('notify.ephemeralMessage', message.u._id, message.rid, {
					msg: TAPi18n.__('error-action-not-allowed', { action }, language),
				});

				// Also throw to stop propagation of 'sendMessage'.
				throw new Meteor.Error('error-action-not-allowed', 'Notify all in this room not allowed', {
					method: 'filterATAllTag',
					action: 'Notify_all_in_this_room',
				});
			}
		}

		return message;
	},
	callbacks.priority.HIGH,
	'filterATAllTag',
);
