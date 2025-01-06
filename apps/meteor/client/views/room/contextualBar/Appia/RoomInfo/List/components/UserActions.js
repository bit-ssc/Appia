import { Option, Menu } from '@rocket.chat/fuselage';
import React from 'react';

import { useActionSpread } from '../../../../../../hooks/useActionSpread';
import { useUserInfoActions } from '../../../../../hooks/useUserInfoActions';

const UserActions = ({ username, _id, rid, reload, federated, name, roleMap }) => {
	const { menu: menuOptions } = useActionSpread(useUserInfoActions({ _id, username, name, roleMap }, rid, reload), 0);

	if (federated && menuOptions && menuOptions.openDirectMessage) {
		delete menuOptions.openDirectMessage;
	}

	if (!menuOptions || !Object.keys(menuOptions).length) {
		return null;
	}

	return (
		<Menu
			flexShrink={0}
			key='menu'
			tiny
			renderItem={({ label: { label, icon }, ...props }) => <Option {...props} label={label} icon={icon} />}
			options={menuOptions}
		/>
	);
};

export default UserActions;
