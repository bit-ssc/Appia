import type { IRoom, Serialized } from '@rocket.chat/core-typings';
import { Box, Button, Field, Modal } from '@rocket.chat/fuselage';
import { useToastMessageDispatch, useEndpoint, useTranslation } from '@rocket.chat/ui-contexts';
import type { ComponentProps } from 'react';
import React, { memo, useCallback } from 'react';

import RoomsAvailableForTeamsAutoComplete from './RoomsAvailableForTeamsAutoComplete';
import { useForm } from '../../../../../hooks/useForm';

type AddExistingModalProps = {
	teamId: string;
	onClose: () => void;
};

const AddExistingModal = ({ onClose, teamId }: AddExistingModalProps) => {
	const t = useTranslation();

	const addRoomEndpoint = useEndpoint('POST', '/v1/teams.addRooms');
	const dispatchToastMessage = useToastMessageDispatch();

	const { values, handlers, hasUnsavedChanges } = useForm({
		rooms: [] as Serialized<IRoom>[],
	});

	const { rooms } = values as { rooms: string[] };
	const { handleRooms } = handlers;

	const handleAddChannels = useCallback(
		async (e) => {
			e.preventDefault();
			try {
				await addRoomEndpoint({
					rooms,
					teamId,
				});

				dispatchToastMessage({ type: 'success', message: t('Channels_added') });
			} catch (error) {
				dispatchToastMessage({ type: 'error', message: error });
			} finally {
				onClose();
			}
		},
		[addRoomEndpoint, rooms, teamId, onClose, dispatchToastMessage, t],
	);

	return (
		<Modal wrapperFunction={(props: ComponentProps<typeof Box>) => <Box is='form' onSubmit={handleAddChannels} {...props} />}>
			<Modal.Header>
				<Modal.Title>{t('Team_Add_existing_channels')}</Modal.Title>
				<Modal.Close onClick={onClose} />
			</Modal.Header>
			<Modal.Content>
				<Field mbe='x24'>
					<Field.Label>{t('Channels')}</Field.Label>
					<RoomsAvailableForTeamsAutoComplete value={rooms} onChange={handleRooms} />
				</Field>
			</Modal.Content>
			<Modal.Footer>
				<Modal.FooterControllers>
					<Button onClick={onClose}>{t('Cancel')}</Button>
					<Button disabled={!hasUnsavedChanges} type='submit' primary>
						{t('Add')}
					</Button>
				</Modal.FooterControllers>
			</Modal.Footer>
		</Modal>
	);
};

export default memo(AddExistingModal);
