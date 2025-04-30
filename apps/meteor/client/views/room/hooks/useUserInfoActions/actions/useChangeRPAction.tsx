import type { IRoom, IUser } from '@rocket.chat/core-typings';
import { isRoomFederated } from '@rocket.chat/core-typings';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { escapeHTML } from '@rocket.chat/string-helpers';
import { useTranslation, usePermission, useUserRoom, useUserSubscription, useSetModal, useUser } from '@rocket.chat/ui-contexts';
import { is } from 'date-fns/locale';
import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';

import GenericModal from '../../../../../components/GenericModal';
import { useEndpointAction } from '../../../../../hooks/useEndpointAction';
import { roomCoordinator } from '../../../../../lib/rooms/roomCoordinator';
import type { Action } from '../../../../hooks/useActionSpread';
import { getRoomDirectives } from '../../../lib/getRoomDirectives';
import { useUserHasRoomRole } from '../../useUserHasRoomRole';

const getWarningModalForFederatedRooms = (
	closeModalFn: () => void,
	handleConfirmFn: () => void,
	title: string,
	confirmText: string,
	bodyText: string,
): ReactElement => (
	<GenericModal
		variant='warning'
		onClose={closeModalFn}
		onConfirm={handleConfirmFn}
		onCancel={closeModalFn}
		title={title}
		confirmText={confirmText}
	>
		{bodyText}
	</GenericModal>
);

// TODO: Remove endpoint concatenation
export const useChangeRPAction = (user: Pick<IUser, '_id' | 'username' | 'name'>, rid: IRoom['_id'], reload): Action | undefined => {
	const t = useTranslation();
	const room = useUserRoom(rid);
	const { _id: uid } = user;
	const userCanSetOwner = usePermission('set-ghost-owner', rid);
	const isGhostOwner = useUserHasRoomRole(uid, rid, 'ghost-owner');
	const userSubscription = useUserSubscription(rid);
	const setModal = useSetModal();
	const { _id: loggedUserId = '' } = useUser() || {};
	const loggedUserIsGhostOwner = useUserHasRoomRole(loggedUserId, rid, 'ghost-owner');
	const loggedUserIsOwner = useUserHasRoomRole(loggedUserId, rid, 'owner');
	const closeModal = useCallback(() => setModal(null), [setModal]);

	if (!room) {
		throw Error('Room not provided');
	}

	// const endpointPrefix = room.t === 'p' ? '/v1/groups' : '/v1/channels';
	const { roomCanSetOwner } = getRoomDirectives({ room, showingUserId: uid, userSubscription });
	const roomName = room?.t && escapeHTML(roomCoordinator.getRoomName(room.t, room));

	const changeOwnerMessage = isGhostOwner
		? 'User__username__removed_from__room_name_ghost__owners'
		: 'User__username__is_now_an_ghost_owner_of__room_name_';

	const change = useEndpointAction('POST', `/v1/channels.changeGhostOwner` as const, {
		successMessage: t(changeOwnerMessage, { username: user.name || user.username, room_name: roomName }),
	});

	const changeOwner = useCallback(
		async (params) => {
			params = {
				...params,
				add: !isGhostOwner,
			};
			await change(params);
			reload && reload();
		},
		[change, reload, isGhostOwner],
	);

	const handleConfirm = useCallback(() => {
		changeOwner({ roomId: rid, userId: uid });
		closeModal();
	}, [changeOwner, rid, uid, closeModal]);

	const handleChangeOwner = useCallback(
		({ userId }) => {
			if (!isRoomFederated(room)) {
				return changeOwner({ roomId: rid, userId: uid });
			}
			const changingOwnRole = userId === loggedUserId;

			if (changingOwnRole && loggedUserIsGhostOwner) {
				return setModal(() =>
					getWarningModalForFederatedRooms(
						closeModal,
						handleConfirm,
						t('Federation_Matrix_losing_privileges'),
						t('Yes_continue'),
						t('Federation_Matrix_losing_privileges_warning'),
					),
				);
			}

			if (!changingOwnRole && loggedUserIsGhostOwner && !isGhostOwner) {
				return setModal(() =>
					getWarningModalForFederatedRooms(
						closeModal,
						handleConfirm,
						t('Warning'),
						t('Yes_continue'),
						t('Federation_Matrix_giving_same_permission_warning'),
					),
				);
			}

			changeOwner({ roomId: rid, userId: uid });
		},
		[setModal, loggedUserId, loggedUserIsGhostOwner, t, rid, uid, changeOwner, closeModal, handleConfirm, room],
	);

	const changeOwnerAction = useMutableCallback(async () => handleChangeOwner({ roomId: rid, userId: uid }));

	const label = isGhostOwner ? 'Remove_as_owner_ghost' : 'Set_as_owner_ghost';

	// if (room.t === 'c') {
	// 	label = isOwner ? 'Remove_as_owner2' : 'Set_as_owner2';
	// }

	const changeOwnerOption = useMemo(() => {
		if (isGhostOwner && loggedUserIsGhostOwner && !loggedUserIsOwner) {
			return undefined;
		}

		return roomCanSetOwner && userCanSetOwner
			? {
					label: t(label),
					icon: 'shield-alt' as const,
					action: changeOwnerAction,
			  }
			: undefined;
	}, [changeOwnerAction, roomCanSetOwner, userCanSetOwner, isGhostOwner, t, room]);

	return changeOwnerOption;
};
