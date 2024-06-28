import { usePermission } from '@rocket.chat/ui-contexts';
import React from 'react';

import ModerationConsolePage from './ModerationConsolePage';
import NotAuthorizedPage from '../../notAuthorized/NotAuthorizedPage';

const ModerationRoute = () => {
	const canViewModerationConsole = usePermission('view-moderation-console');

	if (!canViewModerationConsole) {
		return <NotAuthorizedPage />;
	}

	return <ModerationConsolePage />;
};
export default ModerationRoute;
