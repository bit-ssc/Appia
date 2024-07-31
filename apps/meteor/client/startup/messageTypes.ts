import type { IMessage } from '@rocket.chat/core-typings';
import { escapeHTML } from '@rocket.chat/string-helpers';
import { Meteor } from 'meteor/meteor';

import { MessageTypes } from '../../app/ui-utils/client';
import { t } from '../../app/utils/client';

Meteor.startup(() => {
	MessageTypes.registerType({
		id: 'room_changed_privacy',
		system: true,
		message: 'room_changed_type',
		data(message: IMessage) {
			return {
				room_type: t(message.msg),
			};
		},
	});

	MessageTypes.registerType({
		id: 'room_changed_topic',
		system: true,
		message: 'room_changed_topic_to',
		data(message: IMessage) {
			return {
				room_topic: escapeHTML(message.msg || `(${t('None').toLowerCase()})`),
			};
		},
	});

	MessageTypes.registerType({
		id: 'room_changed_avatar',
		system: true,
		message: 'room_avatar_changed',
	});

	MessageTypes.registerType({
		id: 'room_created_announcement',
		system: true,
		message: 'room_created_announcement',
		data(message: IMessage) {
			return {
				user_by: message.u?.name || message.u?.username,
			};
		},
	});

	MessageTypes.registerType({
		id: 'room_deleted_announcement',
		system: true,
		message: 'room_deleted_announcement',
		data(message: IMessage) {
			return {
				user_by: message.u?.name || message.u?.username,
			};
		},
	});

	MessageTypes.registerType({
		id: 'room_changed_announcement',
		system: true,
		message: 'room_changed_announcement',
		data(message: IMessage) {
			return {
				user_by: message.u?.name || message.u?.username,
				room_announcement: escapeHTML(message.msg || `(${t('None').toLowerCase()})`),
			};
		},
	});

	MessageTypes.registerType({
		id: 'room_created_value_proposition',
		system: true,
		message: 'room_created_value_proposition',
		data(message: IMessage) {
			return {
				user_by: message.u?.name || message.u?.username,
				room_announcement: escapeHTML(message.msg || `(${t('None').toLowerCase()})`),
			};
		},
	});
	MessageTypes.registerType({
		id: 'room_changed_value_proposition',
		system: true,
		message: 'room_changed_value_proposition',
		data(message: IMessage) {
			return {
				user_by: message.u?.name || message.u?.username,
				room_announcement: escapeHTML(message.msg || `(${t('None').toLowerCase()})`),
			};
		},
	});
	MessageTypes.registerType({
		id: 'room_deleted_value_proposition',
		system: true,
		message: 'room_deleted_value_proposition',
		data(message: IMessage) {
			return {
				user_by: message.u?.name || message.u?.username,
				room_announcement: escapeHTML(message.msg || `(${t('None').toLowerCase()})`),
			};
		},
	});

	MessageTypes.registerType({
		id: 'room_changed_description',
		system: true,
		message: 'room_changed_description',
		data(message: IMessage) {
			return {
				user_by: message.u?.name || message.u?.username,
				room_description: escapeHTML(message.msg || `(${t('None').toLowerCase()})`),
			};
		},
	});

	MessageTypes.registerType({
		id: 'message_pinned',
		system: true,
		message: 'Pinned_a_message',
	});
});
