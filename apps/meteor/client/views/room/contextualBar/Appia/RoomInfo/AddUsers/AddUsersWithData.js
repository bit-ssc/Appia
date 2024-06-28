import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useMethod, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';

import AddUsers from './AddUsers';
import { useForm } from '../../../../../../hooks/useForm';
import { useTabBarClose } from '../../../../contexts/ToolboxContext';

const AddUsersWithData = ({ rid, onClickBack, reload }) => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const onClickClose = useTabBarClose();
	const saveAction = useMethod('addUsersToRoom');

	const { values, handlers } = useForm({ users: [] });
	const { users } = values;
	const { handleUsers } = handlers;

	const onChangeUsers = useMutableCallback((value, action) => {
		if (!action) {
			const set = new Set(users || []);

			value?.forEach((v) => {
				set.add(v);
			});

			return handleUsers(Array.from(set));
		}
		handleUsers(users.filter((current) => current !== value));
	});

	const handleSave = useMutableCallback(async () => {
		try {
			await saveAction({ rid, users });
			dispatchToastMessage({ type: 'success', message: t('Users_added') });
			onClickBack();
			reload();
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	});

	return <AddUsers onClickClose={onClickClose} onClickBack={onClickBack} onClickSave={handleSave} value={users} onChange={onChangeUsers} />;
};

export default AddUsersWithData;
