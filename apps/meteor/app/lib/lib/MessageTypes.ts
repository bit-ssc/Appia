import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import type { MessageTypesValues as MessageTypesValuesType } from '@rocket.chat/core-typings';

import { MessageTypes } from '../../ui-utils/lib/MessageTypes';

const escapeHtml = (unsafe) =>
	unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
		.replace(/\//g, '&#x2F;');
// import { callbacks } from '../../../lib/callbacks';

const getRoleMap = (room) => {
	if (room.t !== 'c') {
		return {
			owner: TAPi18n.__('role_name_owner1'),
			moderator: TAPi18n.__('role_name_moderator1'),
		};
	}

	return {
		owner: TAPi18n.__('role_name_owner2'),
		moderator: TAPi18n.__('role_name_moderator2'),
	};
};

Meteor.startup(function () {
	MessageTypes.registerType({
		id: 'rollback-message',
		system: true,
		message: 'Rollback_message',
		data(message) {
			return {
				user: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'r',
		system: true,
		message: 'Room_name_changed',
		render: (message) => {
			return TAPi18n.__('Room_name_changed', {
				room_name: escapeHtml(message.msg),
				user_by: message.u.name || message.u.username,
			});
		},
	});
	MessageTypes.registerType({
		id: 'au',
		system: true,
		message: 'User_added_by',
		data(message) {
			return {
				user_added: message.msg,
				user_by: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'added-user-to-team',
		system: true,
		message: 'Added__username__to_team',
		data(message) {
			return {
				user_added: message.msg,
				user_by: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'ru',
		system: true,
		render(message) {
			if (message.msg === message.u?.name) {
				return TAPi18n.__('User_had_removed', {
					username: message.msg,
				});
			}

			return TAPi18n.__('User_removed_by', {
				user_removed: message.msg,
				user_by: message.u.name || message.u.username,
			});
		},
	});
	MessageTypes.registerType({
		id: 'removed-user-from-team',
		system: true,
		message: 'Removed__username__from_team',
		data(message) {
			return {
				user_by: message.u.name || message.u.username,
				user_removed: message.msg,
			};
		},
	});
	MessageTypes.registerType({
		id: 'ul',
		system: true,
		message: 'User_left',
		data(message) {
			return {
				user_left: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'ca',
		system: true,
		message: 'Change_Agent',
		data() {
			return {};
		},
	});
	MessageTypes.registerType({
		id: 'ult',
		system: true,
		message: 'User_left_team',
		data(message) {
			return {
				user_left: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'user-converted-to-team',
		system: true,
		message: 'Converted__roomName__to_team',
		data(message) {
			return {
				roomName: message.msg,
			};
		},
	});
	MessageTypes.registerType({
		id: 'user-converted-to-channel',
		system: true,
		message: 'Converted__roomName__to_channel',
		data(message) {
			return {
				roomName: message.msg,
			};
		},
	});
	MessageTypes.registerType({
		id: 'user-removed-room-from-team',
		system: true,
		message: 'Removed__roomName__from_this_team',
		data(message) {
			return {
				roomName: message.msg,
			};
		},
	});
	MessageTypes.registerType({
		id: 'user-deleted-room-from-team',
		system: true,
		message: 'Deleted__roomName__',
		data(message) {
			return {
				roomName: message.msg,
			};
		},
	});
	MessageTypes.registerType({
		id: 'user-added-room-to-team',
		system: true,
		message: 'added__roomName__to_team',
		data(message) {
			return {
				roomName: message.msg,
			};
		},
	});
	MessageTypes.registerType({
		id: 'uj',
		system: true,
		message: 'User_joined_channel',
		data(message) {
			return {
				user_join: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'ujt',
		system: true,
		message: 'User_joined_team',
		data(message) {
			return {
				user_join: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'ut',
		system: true,
		message: 'User_joined_conversation',
		data(message) {
			return {
				user_join: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'wm',
		system: true,
		message: 'Welcome',
		data(message) {
			return {
				user: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'rm',
		system: true,
		message: 'Message_removed',
		data(message) {
			return {
				user: message.u.name || message.u.username,
			};
		},
	});
	// MessageTypes.registerType({
	// 	id: 'rtc',
	// 	render(message) {
	// 		return callbacks.run('renderRtcMessage', message);
	// 	},
	// });
	MessageTypes.registerType({
		id: 'user-muted',
		system: true,
		message: 'User_muted_by',
		data(message) {
			return {
				user_muted: message.msg,
				user_by: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'user-unmuted',
		system: true,
		message: 'User_unmuted_by',
		data(message) {
			return {
				user_unmuted: message.msg,
				user_by: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'subscription-role-added',
		system: true,
		render: (message, room) => {
			if (message.role === 'leader') {
				return TAPi18n.__('__username__was_pinned__user_by__', {
					username: message.msg,
					user_by: message.u.name || message.u.username,
				});
			}

			const roleMap = getRoleMap(room);

			return TAPi18n.__('__username__was_set__role__by__user_by_', {
				username: message.msg,
				role: roleMap[message.roleName || message.role] || message.roleName || message.role || '',
				user_by: message.u.name || message.u.username,
			});
		},
		message: '__username__was_set__role__by__user_by_',
	});
	MessageTypes.registerType({
		id: 'subscription-role-removed',
		system: true,
		message: '__username__is_no_longer__role__defined_by__user_by_',
		render: (message, room) => {
			if (message.role === 'leader') {
				return TAPi18n.__('__username__was_unpinned__user_by__', {
					username: message.msg,
					user_by: message.u.name || message.u.username,
				});
			}

			const roleMap = getRoleMap(room);

			return TAPi18n.__('__username__is_no_longer__role__defined_by__user_by_', {
				username: message.msg,
				role: roleMap[message.roleName || message.role] || message.roleName || message.role || '',
				user_by: message.u.name || message.u.username,
			});
		},
	});
	MessageTypes.registerType({
		id: 'room-archived',
		system: true,
		message: 'This_room_has_been_archived_by__username_',
		data(message) {
			return {
				username: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'room-unarchived',
		system: true,
		message: 'This_room_has_been_unarchived_by__username_',
		data(message) {
			return {
				username: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'room-removed-read-only',
		system: true,
		message: 'room_removed_read_only',
		data(message) {
			return {
				user_by: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'room-set-read-only',
		system: true,
		message: 'room_set_read_only',
		data(message) {
			return {
				user_by: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'room-allowed-reacting',
		system: true,
		message: 'room_allowed_reacting',
		data(message) {
			return {
				user_by: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'room-disallowed-reacting',
		system: true,
		message: 'room_disallowed_reacting',
		data(message) {
			return {
				user_by: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'room_e2e_enabled',
		system: true,
		message: 'This_room_encryption_has_been_enabled_by__username_',
		data(message) {
			return {
				username: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'room_e2e_disabled',
		system: true,
		message: 'This_room_encryption_has_been_disabled_by__username_',
		data(message) {
			return {
				username: message.u.name || message.u.username,
			};
		},
	});
	MessageTypes.registerType({
		id: 'videoconf',
		system: false,
		message: 'Video_Conference',
	});
});

export const MessageTypesValues: Array<{ key: MessageTypesValuesType; i18nLabel: string }> = [
	{
		key: 'rollback-message',
		i18nLabel: 'Rollback_message',
	},
	{
		key: 'uj', // user joined
		i18nLabel: 'Message_HideType_uj',
	},
	{
		key: 'ujt', // user joined team
		i18nLabel: 'Message_HideType_ujt',
	},
	{
		key: 'ul', // user left
		i18nLabel: 'Message_HideType_ul',
	},
	{
		key: 'ult', // user left team
		i18nLabel: 'Message_HideType_ult',
	},
	{
		key: 'ru', // user removed
		i18nLabel: 'Message_HideType_ru',
	},
	{
		key: 'removed-user-from-team',
		i18nLabel: 'Message_HideType_removed_user_from_team',
	},
	{
		key: 'au', // added user
		i18nLabel: 'Message_HideType_au',
	},
	{
		key: 'added-user-to-team',
		i18nLabel: 'Message_HideType_added_user_to_team',
	},
	{
		key: 'mute_unmute',
		i18nLabel: 'Message_HideType_mute_unmute',
	},
	{
		key: 'r', // room name changed
		i18nLabel: 'Message_HideType_r',
	},
	{
		key: 'ut', // user joined conversation
		i18nLabel: 'Message_HideType_ut',
	},
	{
		key: 'wm', // welcome
		i18nLabel: 'Message_HideType_wm',
	},
	{
		key: 'rm', // message removed
		i18nLabel: 'Message_HideType_rm',
	},
	{
		key: 'subscription-role-added',
		i18nLabel: 'Message_HideType_subscription_role_added',
	},
	{
		key: 'subscription-role-removed',
		i18nLabel: 'Message_HideType_subscription_role_removed',
	},
	{
		key: 'room-archived',
		i18nLabel: 'Message_HideType_room_archived',
	},
	{
		key: 'room-unarchived',
		i18nLabel: 'Message_HideType_room_unarchived',
	},
	{
		key: 'room_changed_privacy',
		i18nLabel: 'Message_HideType_room_changed_privacy',
	},
	{
		key: 'room_changed_avatar',
		i18nLabel: 'Message_HideType_room_changed_avatar',
	},
	{
		key: 'room_changed_topic',
		i18nLabel: 'Message_HideType_room_changed_topic',
	},
	{
		key: 'room_e2e_enabled',
		i18nLabel: 'Message_HideType_room_enabled_encryption',
	},
	{
		key: 'room_e2e_disabled',
		i18nLabel: 'Message_HideType_room_disabled_encryption',
	},
	{
		key: 'room-removed-read-only',
		i18nLabel: 'Message_HideType_room_removed_read_only',
	},
	{
		key: 'room-set-read-only',
		i18nLabel: 'Message_HideType_room_set_read_only',
	},
	{
		key: 'room-disallowed-reacting',
		i18nLabel: 'Message_HideType_room_disallowed_reacting',
	},
	{
		key: 'room-allowed-reacting',
		i18nLabel: 'Message_HideType_room_allowed_reacting',
	},
	{
		key: 'user-added-room-to-team',
		i18nLabel: 'Message_HideType_user_added_room_to_team',
	},
	{
		key: 'user-converted-to-channel',
		i18nLabel: 'Message_HideType_user_converted_to_channel',
	},
	{
		key: 'user-converted-to-team',
		i18nLabel: 'Message_HideType_user_converted_to_team',
	},
	{
		key: 'user-deleted-room-from-team',
		i18nLabel: 'Message_HideType_user_deleted_room_from_team',
	},
	{
		key: 'user-removed-room-from-team',
		i18nLabel: 'Message_HideType_user_removed_room_from_team',
	},
	{
		key: 'room_changed_announcement',
		i18nLabel: 'Message_HideType_changed_announcement',
	},
	{
		key: 'room_changed_description',
		i18nLabel: 'Message_HideType_changed_description',
	},
	{
		key: 'ca',
		i18nLabel: 'Change_Agent',
	},
];
