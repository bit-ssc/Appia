import type { IRoom, IUser } from '@rocket.chat/core-typings';
import { isRoomFederated } from '@rocket.chat/core-typings';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useToastMessageDispatch, useMethod, useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import AddUsers from './AddUsers';
import { useForm } from '../../../../../hooks/useForm';
import { useRoom } from '../../../contexts/RoomContext';
import { useTabBarClose } from '../../../contexts/ToolboxContext';

type AddUsersWithDataProps = {
	rid: IRoom['_id'];
	onClickBack: () => void;
	reload: () => void;
};

type AddUsersInitialProps = {
	users: Exclude<IUser['username'], undefined>[];
};

const AddUsersWithData = ({ rid, onClickBack, reload }: AddUsersWithDataProps): ReactElement => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();
	const room = useRoom();

	const onClickClose = useTabBarClose();
	const saveAction = useMethod('addUsersToRoom');

	const { values, handlers } = useForm({ users: [] as IUser['username'][] });
	const { users } = values as AddUsersInitialProps;
	const { handleUsers } = handlers;

	const handleSave = useMutableCallback(async () => {
		try {
			await saveAction({ rid, users });
			dispatchToastMessage({ type: 'success', message: t('Users_added') });
			onClickBack();
			reload();
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error as Error });
		}
	});

	return (
		<AddUsers
			onClickClose={onClickClose}
			onClickBack={onClickBack}
			onClickSave={handleSave}
			users={users}
			isRoomFederated={isRoomFederated(room)}
			onChange={handleUsers}
		/>
	);
};

export default AddUsersWithData;
