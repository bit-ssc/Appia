import { useDebouncedValue, useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useMethod, useToastMessageDispatch, useUserRoom, useUserSubscription } from '@rocket.chat/ui-contexts';
import { sortBy } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';

import { APPIA_TAG, hasPermission } from '../../../../../../../lib/utils/permission';
import { useRecordList } from '../../../../../../hooks/lists/useRecordList';
import { AsyncStatePhase } from '../../../../../../hooks/useAsyncState';
import { useEndpointActionExperimental } from '../../../../../../hooks/useEndpointActionExperimental';
import { useForm } from '../../../../../../hooks/useForm';
import { useMembersList } from '../../../../../hooks/useMembersList';
import { useTabBarClose } from '../../../../contexts/ToolboxContext';
import UserInfoWithData from '../../../UserInfo';
import AddUsers from '../AddUsers';
import RoomSetting from '../RoomSetting';
import RoomMembers from './RoomMembers';

import ToDos from '/client/views/room/contextualBar/Appia/Todos';
import Announcement from '/client/views/room/contextualBar/Appia/RoomAnnouncement/Announcement';
import { RoomRoles } from '/app/models';

const RoomMembersWithData = ({ rid }) => {
	const [state, setState] = useState({});
	const onClickClose = useTabBarClose();
	const room = useUserRoom(rid);
	const isTeam = room.t !== 'c';
	const isDirect = room.t === 'd';
	const getRoomRoles = useMethod('getRoomRoles');
	const realFederated = useMemo(() => hasPermission(room.showAppiaTag, APPIA_TAG.external), [room.showAppiaTag]);

	room.type = room.t;
	room.rid = rid;

	const type = 'all';
	const [text, setText] = useState('');

	const debouncedText = useDebouncedValue(text, 800);

	const dispatchToastMessage = useToastMessageDispatch();
	const toggleFavorite = useMethod('toggleFavorite');
	const subscription = useUserSubscription(rid);

	const { values, handlers, commit } = useForm({
		readonly: room?.ro,
		turnOn: subscription?.disableNotifications,
		muteGroupMentions: subscription?.muteGroupMentions,
		showCounter: subscription?.hideUnreadStatus,
		desktopAlert: (subscription?.desktopPrefOrigin === 'subscription' && subscription.desktopNotifications) || 'default',
		desktopSound: subscription?.audioNotificationValue || 'default',
		mobileAlert: (subscription?.mobilePrefOrigin === 'subscription' && subscription.mobilePushNotifications) || 'default',
		emailAlert: (subscription?.emailPrefOrigin === 'subscription' && subscription.emailNotifications) || 'default',
		favorite: (subscription != null ? subscription.f : undefined) != null && subscription.f,
	});

	const saveSettings = useEndpointActionExperimental('POST', '/v1/rooms.saveNotification');

	const handleSaveButton = useMutableCallback(() => {
		const notifications = {};

		notifications.disableNotifications = values.turnOn ? '1' : '0';
		notifications.muteGroupMentions = values.muteGroupMentions ? '1' : '0';
		notifications.hideUnreadStatus = values.showCounter ? '1' : '0';
		notifications.desktopNotifications = values.desktopAlert;
		notifications.audioNotificationValue = values.desktopSound;
		notifications.mobilePushNotifications = values.mobileAlert;
		notifications.emailNotifications = values.emailAlert;

		saveSettings({
			roomId: rid,
			notifications,
		});

		commit();
	});

	const {
		membersList,
		enterprise,
		loadMoreItems,
		reload: fetchMembersList,
	} = useMembersList(
		useMemo(
			() => ({ rid, type, limit: 50, debouncedText: !realFederated && debouncedText, count: 30, roomType: room.t, realFederated }),
			[rid, type, debouncedText, room.t, realFederated],
		),
	);

	const reload = useCallback(() => {
		getRoomRoles(rid).then((results) => {
			RoomRoles.remove({ rid });
			Array.from(results).forEach(({ _id, ...data }) => {
				const {
					rid,
					u: { _id: uid },
				} = data;
				RoomRoles.upsert({ rid, 'u._id': uid }, { $set: data });
			});
		});
		fetchMembersList();
	}, [fetchMembersList, getRoomRoles, rid]);

	const { phase, items, itemCount: total } = useRecordList(membersList);
	const { phase: federatedPhase, items: federatedItems, itemCount: federatedTotal } = useRecordList(enterprise);

	const members = useMemo(
		() =>
			sortBy(items, (value) => {
				if (value.roles?.length) {
					const set = new Set();
					value.roles.forEach((role) => set.add(role));

					if (set.has('owner')) {
						return 0;
					}

					if (set.has('moderator')) {
						return 1;
					}
				}

				return 2;
			}),
		[items],
	);

	const rolesToTop = (members) =>
		sortBy(members, (value) => {
			if (value.roles?.length) {
				const set = new Set();
				value.roles.forEach((role) => set.add(role));

				if (set.has('owner')) {
					return 0;
				}

				if (set.has('moderator')) {
					return 1;
				}
			}

			return 2;
		});

	const federatedMembers = useMemo(
		() =>
			federatedItems?.map((item) => ({
				...item,
				members: rolesToTop(item.members),
			})),
		[federatedItems],
	);

	const searchFederatedMembers = useMemo(() => {
		if (!text?.trim()) return;
		// 防治字符的闪退
		const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const pattern = new RegExp(escapedText, 'i');
		const result = [];
		federatedMembers?.forEach((item) => {
			item?.members?.forEach((member) => {
				if (pattern.test(member.username) || pattern.test(member.name ?? '')) {
					result.push(member);
				}
			});
		});
		return result;
	}, [text]);

	const handleTextChange = useCallback((event) => {
		setText(event.currentTarget.value);
	}, []);

	const viewUser = useMutableCallback((e) => {
		const { username } = e.currentTarget.dataset;
		setState({
			tab: 'UserInfo',
			username,
		});
	});

	const getValue = (eventOrValue) => {
		const target = eventOrValue.currentTarget;

		if (target instanceof HTMLTextAreaElement) {
			return target.value;
		}

		if (target instanceof HTMLSelectElement) {
			return target.value;
		}

		if (!(target instanceof HTMLInputElement)) {
			return undefined;
		}

		if (target.type === 'checkbox' || target.type === 'radio') {
			return target.checked;
		}
		return target.value;
	};

	const handleToggleFavorite = useMutableCallback(async (e) => {
		try {
			await toggleFavorite(rid, getValue(e));
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	});

	const createInvite = useMutableCallback(() => {
		setState({ tab: 'InviteUsers' });
	});

	const addUser = useMutableCallback(() => {
		setState({ tab: 'AddUsers' });
	});

	const clickSet = useMutableCallback(() => {
		setState({ tab: 'Setting' });
	});

	const clickTodos = useMutableCallback(() => {
		setState({ tab: 'Todos' });
	});

	const clickAnnouncement = useMutableCallback(() => {
		setState({ tab: 'Announcement' });
	});

	const handleBack = useCallback(() => {
		setState({});
		reload();
	}, [setState, reload]);

	if (state.tab === 'Todos') {
		return <ToDos rid={rid} onClickBack={handleBack} />;
	}

	// if (state.tab === 'Announcement') {
	// 	return <Announcement rid={rid} onClickBack={handleBack} />;
	// }

	if (state.tab === 'UserInfo') {
		return <UserInfoWithData rid={rid} onClickClose={onClickClose} onClickBack={handleBack} username={state.username} />;
	}

	if (state.tab === 'AddUsers') {
		return <AddUsers onClickClose={onClickClose} rid={rid} onClickBack={handleBack} reload={reload} />;
	}

	if (state.tab === 'Setting') {
		return (
			<RoomSetting
				room={room}
				handleClose={onClickClose}
				onClickBack={handleBack}
				formValues={values}
				formHandlers={handlers}
				handleSaveButton={handleSaveButton}
				handleToggleFavorite={(e) => handleToggleFavorite(e)}
			/>
		);
	}

	return (
		<RoomMembers
			rid={rid}
			isTeam={isTeam}
			teamMain={room.teamMain}
			isDirect={isDirect}
			room={room}
			loading={(realFederated ? federatedPhase : phase) === AsyncStatePhase.LOADING}
			text={text}
			setText={handleTextChange}
			members={members}
			federatedMembers={federatedMembers}
			total={realFederated ? federatedTotal : total}
			onClickClose={onClickClose}
			onClickView={viewUser}
			onClickAdd={addUser}
			showAddButton={true}
			onClickInvite={createInvite}
			onClickSet={clickSet}
			onClickAnnouncement={clickAnnouncement}
			onClickTodos={clickTodos}
			loadMoreItems={loadMoreItems}
			reload={reload}
			realFederated={realFederated}
			searchFederatedMembers={searchFederatedMembers}
			formValues={values}
			formHandlers={handlers}
			handleSaveButton={handleSaveButton}
		/>
	);
};

export default RoomMembersWithData;
