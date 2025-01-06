import { usePermission } from '@rocket.chat/ui-contexts';
import React from 'react';

import ContactTable from './ContactTable';
import NotAuthorizedPage from '../../../notAuthorized/NotAuthorizedPage';

function ContactTab(props) {
	const hasAccess = usePermission('view-l-room');

	if (hasAccess) {
		return <ContactTable {...props} />;
	}

	return <NotAuthorizedPage />;
}

export default ContactTab;
