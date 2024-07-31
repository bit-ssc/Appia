import type { IRoom, IUser } from '@rocket.chat/core-typings';
import { isRoomFederated } from '@rocket.chat/core-typings';
import { Box, Icon } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { escapeHTML } from '@rocket.chat/string-helpers';
import { usePermission, useSetModal, useTranslation, useUser, useUserRoom, useUserSubscription } from '@rocket.chat/ui-contexts';
import React, { useMemo } from 'react';

import GenericModal from '../../../../../components/GenericModal';
import { useEndpointAction } from '../../../../../hooks/useEndpointAction';
import * as Federation from '../../../../../lib/federation/Federation';
import { roomCoordinator } from '../../../../../lib/rooms/roomCoordinator';
import type { Action } from '../../../../hooks/useActionSpread';
import RemoveUsersModal from '../../../../teams/contextualBar/members/RemoveUsersModal';
import { getRoomDirectives } from '../../../lib/getRoomDirectives';

// TODO: Remove endpoint concatenation
export const useRemoveUserAction = (user: Pick<IUser, '_id' | 'username'>, rid: IRoom['_id'], reload?: () => void): Action | undefined => {
	const t = useTranslation();
	const room = useUserRoom(rid);
	const currentUser = useUser();
	const subscription = useUserSubscription(rid);

	const { _id: uid } = user;

	if (!room) {
		throw Error('Room not provided');
	}

	const hasPermissionToRemove = usePermission('remove-user', rid);
	const userCanRemove = isRoomFederated(room)
		? Federation.isEditableByTheUser(currentUser || undefined, room, subscription)
		: hasPermissionToRemove;
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal(null));
	const roomName = room?.t && escapeHTML(roomCoordinator.getRoomName(room.t, room));

	const endpointPrefix = room.t === 'p' ? '/v1/groups' : '/v1/channels';
	const { roomCanRemove } = getRoomDirectives({ room, showingUserId: uid, userSubscription: subscription });

	const removeFromTeam = useEndpointAction('POST', '/v1/teams.removeMember', {
		successMessage: t('User_has_been_removed_from_team'),
	});
	const removeFromRoom = useEndpointAction('POST', `${endpointPrefix}.kick`, {
		successMessage: t('User_has_been_removed_from_s', roomName),
	});

	const removeUserOptionAction = useMutableCallback(() => {
		const handleRemoveFromTeam = async (rooms: IRoom[]): Promise<void> => {
			if (room.teamId) {
				const roomKeys = Object.keys(rooms);
				await removeFromTeam({
					teamId: room.teamId,
					userId: uid,
					...(roomKeys.length && { rooms: roomKeys }),
				});
				closeModal();
				reload?.();
			}
		};

		const handleRemoveFromRoom = async (rid: IRoom['_id'], uid: IUser['_id']): Promise<void> => {
			await removeFromRoom({ roomId: rid, userId: uid });
			closeModal();
			reload?.();
		};

		if (room.teamMain && room.teamId) {
			return setModal(
				<RemoveUsersModal teamId={room?.teamId} userId={uid} onClose={closeModal} onCancel={closeModal} onConfirm={handleRemoveFromTeam} />,
			);
		}

		setModal(
			<GenericModal
				variant='danger'
				confirmText={t('Yes_remove_user')}
				onClose={closeModal}
				onCancel={closeModal}
				onConfirm={(): Promise<void> => handleRemoveFromRoom(rid, uid)}
			>
				{t('The_user_will_be_removed_from_s', roomName)}
			</GenericModal>,
		);
	});

	const removeUserOption = useMemo(
		() =>
			roomCanRemove && userCanRemove
				? {
						label: (
							<Box color='status-font-on-danger'>
								<Icon mie='x4' name='cross' size='x20' />
								{room?.teamMain ? t('Remove_from_team') : t('Remove_from_room')}
							</Box>
						),
						action: removeUserOptionAction,
				  }
				: undefined,
		[room, roomCanRemove, userCanRemove, removeUserOptionAction, t],
	);

	return removeUserOption;
};
