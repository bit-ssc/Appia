import { usePermission } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import UsersPage from './UsersPage';
import NotAuthorizedPage from '../../notAuthorized/NotAuthorizedPage';

const UsersRoute = (): ReactElement => {
	const canViewUserAdministration = usePermission('view-user-administration');

	if (!canViewUserAdministration) {
		return <NotAuthorizedPage />;
	}

	return <UsersPage />;
};

export default UsersRoute;
