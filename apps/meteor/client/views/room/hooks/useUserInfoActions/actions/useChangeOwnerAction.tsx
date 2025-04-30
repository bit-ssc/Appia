import type { IRoom, IUser } from '@rocket.chat/core-typings';
import { isRoomFederated } from '@rocket.chat/core-typings';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { escapeHTML } from '@rocket.chat/string-helpers';
import { useTranslation, usePermission, useUserRoom, useUserSubscription, useSetModal, useUser } from '@rocket.chat/ui-contexts';
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
export const useChangeOwnerAction = (user: Pick<IUser, '_id' | 'username' | 'name'>, rid: IRoom['_id'], reload): Action | undefined => {
	const t = useTranslation();
	const room = useUserRoom(rid);
	const { _id: uid } = user;
	const userCanSetOwner = usePermission('set-owner', rid);
	const isOwner = useUserHasRoomRole(uid, rid, 'owner');
	const userSubscription = useUserSubscription(rid);
	const setModal = useSetModal();
	const { _id: loggedUserId = '' } = useUser() || {};
	const loggedUserIsOwner = useUserHasRoomRole(loggedUserId, rid, 'owner');
	const closeModal = useCallback(() => setModal(null), [setModal]);

	if (!room) {
		throw Error('Room not provided');
	}

	const endpointPrefix = room.t === 'p' ? '/v1/groups' : '/v1/channels';
	const { roomCanSetOwner } = getRoomDirectives({ room, showingUserId: uid, userSubscription });
	const roomName = room?.t && escapeHTML(roomCoordinator.getRoomName(room.t, room));

	const changeOwnerEndpoint = isOwner ? 'removeOwner' : 'addOwner';
	const changeOwnerMessage = isOwner ? 'User__username__removed_from__room_name__owners' : 'User__username__is_now_an_owner_of__room_name_';

	const change = useEndpointAction('POST', `${endpointPrefix}.${changeOwnerEndpoint}` as const, {
		successMessage: t(changeOwnerMessage, { username: user.name || user.username, room_name: roomName }),
	});

	const changeOwner = useCallback(
		async (params) => {
			console.info('changeOwner=======1');
			params = {
				...params,
				deliver: true,
			};
			await change(params);
			reload && reload();
		},
		[change, reload],
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

			if (changingOwnRole && loggedUserIsOwner) {
				console.info('changingOwnRole=========1');
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

			if (!changingOwnRole && loggedUserIsOwner) {
				console.info('changingOwnRole=========2');
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
		[setModal, loggedUserId, loggedUserIsOwner, t, rid, uid, changeOwner, closeModal, handleConfirm, room],
	);

	const changeOwnerAction = useMutableCallback(async () => handleChangeOwner({ roomId: rid, userId: uid }));

	const label = isOwner ? 'Remove_as_owner1' : 'Set_as_owner1';

	// if (room.t === 'c') {
	// 	label = isOwner ? 'Remove_as_owner2' : 'Set_as_owner2';
	// }

	const changeOwnerOption = useMemo(() => {
		if (isOwner && loggedUserIsOwner) {
			return undefined;
		}

		if (roomCanSetOwner && userCanSetOwner) {
			/^magnet:\?xt=urn:btih:[0-9a-fA-F]{40,}.*$/;
			return {
				label: t(label),
				icon: 'mic' as const,
				action: changeOwnerAction,
			};
		}
		return undefined;
	}, [changeOwnerAction, roomCanSetOwner, userCanSetOwner, isOwner, t, room, loggedUserIsOwner]);

	return changeOwnerOption;
};
