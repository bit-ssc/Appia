import { Skeleton } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { useMemo } from 'react';

import BaseRemoveUsersModal from './BaseRemoveUsersModal';
import GenericModal from '../../../../../components/GenericModal';
import { useEndpointData } from '../../../../../hooks/useEndpointData';
import { AsyncStatePhase } from '../../../../../lib/asyncState';

const initialData = { user: { username: '' } };

const RemoveUsersModal = ({ teamId, userId, onClose, onCancel, onConfirm }) => {
	const t = useTranslation();
	const { value, phase } = useEndpointData('/v1/teams.listRoomsOfUser', { params: useMemo(() => ({ teamId, userId }), [teamId, userId]) });
	const userDataFetch = useEndpointData('/v1/users.info', { params: useMemo(() => ({ userId }), [userId]), initialValue: initialData });
	const { user } = userDataFetch?.value;

	if (phase === AsyncStatePhase.LOADING) {
		return (
			<GenericModal variant='warning' onClose={onClose} title={<Skeleton width='50%' />} confirmText={t('Cancel')} onConfirm={onClose}>
				<Skeleton width='full' />
			</GenericModal>
		);
	}

	return (
		<BaseRemoveUsersModal
			onClose={onClose}
			user={user}
			username={user.username}
			onCancel={onCancel}
			onConfirm={onConfirm}
			rooms={value?.rooms}
		/>
	);
};

export default RemoveUsersModal;
