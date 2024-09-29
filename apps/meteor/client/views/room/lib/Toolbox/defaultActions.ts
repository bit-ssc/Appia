import { useEndpoint } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import React, { lazy, useMemo, useEffect, useState } from 'react';

import { addAction } from '.';
import { SetToDo, AddUserIcon } from '../../../../components/AppiaIcon';
import { Badge } from '../../../../components/AppiaUI';

import { Header } from '@rocket.chat/ui-client';

import { useAddInnerUser } from '/client/views/room/contextualBar/Appia/RoomInfo/AddUsersModal';
import { APPIA_TAG, hasPermission } from '/lib/utils/permission';
import { useRoomSubscription } from '/client/views/room/contexts/RoomContext';

addAction('rocket-search', {
	groups: ['channel', 'group', 'direct', 'direct_multiple', 'live', 'team'],
	id: 'rocket-search',
	title: 'Search_Messages',
	icon: 'magnifier',
	template: lazy(() => import('../../contextualBar/Appia/SearchMessages')),
	order: 6,
});

/**
addAction('rocket-search', {
	groups: ['channel', 'group', 'direct', 'direct_multiple', 'live', 'team'],
	id: 'rocket-search',
	title: 'Search_Messages',
	icon: 'magnifier',
	template: lazy(() => import('../../contextualBar/MessageSearchTab')),
	order: 6,
});
*/

addAction('user-info', {
	groups: ['direct'],
	id: 'user-info',
	title: 'User_Info',
	icon: 'user',
	template: lazy(() => import('../../MemberListRouter')),
	order: 1,
});

/**
 addAction('qrcode', ({ room }) => {
	const openAddInnerUser = useAddInnerUser(room, undefined);
	return useMemo(
		() => ({
			groups: ['channel', 'group', 'team'],
			id: 'qrcode',
			title: 'qrcode',
			icon: () => (
				<span style={{ fontSize: 20 }}>
					<AddUserIcon />
				</span>
			),
			action: openAddInnerUser,
			// template: lazy(() => import('../../../../client/views/room/contextualBar/AutoTranslate')),
			order: 1.5,
			full: true,
		}),
		[openAddInnerUser, room],
	);
});
 */

/**
addAction('contact-profile', {
	groups: ['live', 'voip'],
	id: 'contact-profile',
	title: 'Contact_Info',
	icon: 'user',
	template: lazy(() => import('../../../omnichannel/directory/contacts/contextualBar/ContactsContextualBar')),
	order: 1,
});

addAction('user-info-group', {
	groups: ['direct_multiple'],
	id: 'user-info-group',
	title: 'Members',
	icon: 'members',
	template: lazy(() => import('../../MemberListRouter')),
	order: 1,
});

addAction('members-list', ({ room }) => {
	const hasPermission = usePermission('view-broadcast-member-list', room._id);
	return useMemo(
		() =>
			!room.broadcast || hasPermission
				? {
						groups: ['channel', 'group', 'team'],
						id: 'members-list',
						title: room.teamMain ? 'Teams_members' : 'Members',
						icon: 'members',
						template: lazy(() => import('../../MemberListRouter')),
						order: 5,
				  }
				: null,
		[hasPermission, room.broadcast, room.teamMain],
	);
});

addAction('uploaded-files-list', {
	groups: ['channel', 'group', 'direct', 'direct_multiple', 'live', 'team'],
	id: 'uploaded-files-list',
	title: 'Files',
	icon: 'clip',
	template: lazy(() => import('../../contextualBar/RoomFiles')),
	order: 7,
});

addAction('keyboard-shortcut-list', {
	groups: ['channel', 'group', 'direct', 'direct_multiple', 'team'],
	id: 'keyboard-shortcut-list',
	title: 'Keyboard_Shortcuts_Title',
	icon: 'keyboard',
	template: lazy(() => import('../../contextualBar/KeyboardShortcuts')),
	order: 99,
});
*/

addAction('team-info', {
	groups: ['team', 'group'],
	id: 'team-info',
	anonymous: true,
	full: true,
	title: 'Teams_Info',
	icon: 'info-circled',
	template: lazy(() => import('../../contextualBar/Appia/RoomInfo')),
	order: 1,
});

addAction('chanel-info', {
	groups: ['channel'],
	id: 'chanel-info',
	anonymous: true,
	full: true,
	title: 'Channel_Info',
	icon: 'info-circled',
	template: lazy(() => import('../../contextualBar/Appia/RoomInfo')),
	order: 1,
});

addAction('todos', ({ room }) => {
	return {
		groups: ['channel', 'group', 'direct', 'direct_multiple', 'live', 'team'],
		id: 'todos',
		anonymous: true,
		full: true,
		title: 'ToDos',
		icon: ({ color }) => (
			<Badge count={room?.todoCount || 0} size={'small'} color={'#FF1B1B'} overflowCount={99}>
				<SetToDo fontSize={20} color={color} />
			</Badge>
		),
		renderAction: (props) => {
			// if (room.t === 'd') {
			// 	return <Header.ToolBox.Action {...props} />;
			// }
			<div></div>;
		},
		template: lazy(() => import('../../contextualBar/Appia/Todos')),
		order: 2,
	};
});
