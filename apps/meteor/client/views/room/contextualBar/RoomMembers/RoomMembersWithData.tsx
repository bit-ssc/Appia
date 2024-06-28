import type { IRoom, IUser } from '@rocket.chat/core-typings';
import { isRoomFederated, isDirectMessageRoom, isTeamRoom } from '@rocket.chat/core-typings';
import { useMutableCallback, useDebouncedValue, useLocalStorage } from '@rocket.chat/fuselage-hooks';
import { useUserRoom, useAtLeastOnePermission, useUser, usePermission, useUserSubscription } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';

import AddUsers from './AddUsers';
import InviteUsers from './InviteUsers';
import RoomMembers from './RoomMembers';
import { useRecordList } from '../../../../hooks/lists/useRecordList';
import { AsyncStatePhase } from '../../../../hooks/useAsyncState';
import * as Federation from '../../../../lib/federation/Federation';
import { useMembersList } from '../../../hooks/useMembersList';
import { useTabBarClose } from '../../contexts/ToolboxContext';
import UserInfoWithData from '../UserInfo';

enum ROOM_MEMBERS_TABS {
	INFO = 'user-info',
	INVITE = 'invite-users',
	ADD = 'add-users',
	LIST = 'users-list',
}

type validRoomType = 'd' | 'p' | 'c';

const RoomMembersWithData = ({ rid }: { rid: IRoom['_id'] }): ReactElement => {
	const user = useUser();
	const room = useUserRoom(rid);
	const handleClose = useTabBarClose();
	const [type, setType] = useLocalStorage<'online' | 'all'>('members-list-type', 'online');
	const [text, setText] = useState('');
	const subscription = useUserSubscription(rid);

	const isTeam = room && isTeamRoom(room);
	const isDirect = room && isDirectMessageRoom(room);
	const hasPermissionToCreateInviteLinks = usePermission('create-invite-links', rid);
	const isFederated = room && isRoomFederated(room);

	const canCreateInviteLinks = isFederated ? false : hasPermissionToCreateInviteLinks;

	const [state, setState] = useState<{ tab: ROOM_MEMBERS_TABS; userId?: IUser['_id'] }>({
		tab: ROOM_MEMBERS_TABS.LIST,
		userId: undefined,
	});

	const debouncedText = useDebouncedValue(text, 800);

	const { membersList, loadMoreItems, reload } = useMembersList(
		useMemo(() => ({ rid, type, limit: 50, debouncedText, roomType: room?.t as validRoomType }), [rid, type, debouncedText, room?.t]),
	);

	const { phase, items, itemCount: total } = useRecordList(membersList);

	const hasPermissionToAddUsers = useAtLeastOnePermission(
		useMemo(() => [room?.t === 'p' ? 'add-user-to-any-p-room' : 'add-user-to-any-c-room', 'add-user-to-joined-room'], [room?.t]),
		rid,
	);

	const canAddUsers = room && user && isFederated ? Federation.isEditableByTheUser(user, room, subscription) : hasPermissionToAddUsers;

	const handleTextChange = useCallback((event) => {
		setText(event.currentTarget.value);
	}, []);

	const openUserInfo = useMutableCallback((e) => {
		const { userid } = e.currentTarget.dataset;
		setState({
			tab: ROOM_MEMBERS_TABS.INFO,
			userId: userid,
		});
	});

	const openInvite = useMutableCallback(() => {
		setState({ tab: ROOM_MEMBERS_TABS.INVITE });
	});

	const openAddUser = useMutableCallback(() => {
		setState({ tab: ROOM_MEMBERS_TABS.ADD });
	});

	const handleBack = useCallback(() => {
		setState({ tab: ROOM_MEMBERS_TABS.LIST });
	}, [setState]);

	if (state.tab === ROOM_MEMBERS_TABS.INFO && state.userId) {
		return <UserInfoWithData rid={rid} uid={state.userId} onClose={handleClose} onClickBack={handleBack} />;
	}

	if (state.tab === ROOM_MEMBERS_TABS.INVITE) {
		return <InviteUsers rid={rid} onClickBack={handleBack} />;
	}

	if (state.tab === ROOM_MEMBERS_TABS.ADD) {
		return <AddUsers rid={rid} onClickBack={handleBack} reload={reload} />;
	}

	return (
		<RoomMembers
			rid={rid}
			isTeam={isTeam}
			isDirect={isDirect}
			isFederated={isFederated}
			loading={phase === AsyncStatePhase.LOADING}
			type={type}
			text={text}
			setText={handleTextChange}
			setType={setType}
			members={items}
			total={total}
			onClickClose={handleClose}
			onClickView={openUserInfo}
			loadMoreItems={loadMoreItems}
			reload={reload}
			onClickInvite={canCreateInviteLinks && canAddUsers ? openInvite : undefined}
			onClickAdd={canAddUsers ? openAddUser : undefined}
		/>
	);
};

export default RoomMembersWithData;
