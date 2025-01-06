import { usePermission } from '@rocket.chat/ui-contexts';
import React from 'react';

import RegisterWorkspace from './RegisterWorkspace';
import NotAuthorizedPage from '../../notAuthorized/NotAuthorizedPage';

function CloudRoute() {
	const canManageCloud = usePermission('manage-cloud');

	if (!canManageCloud) {
		return <NotAuthorizedPage />;
	}

	return <RegisterWorkspace />;
}

export default CloudRoute;
