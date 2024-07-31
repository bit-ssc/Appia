import { useSetting } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import AccountSecurityPage from './AccountSecurityPage';
import NotAuthorizedPage from '../../notAuthorized/NotAuthorizedPage';

const AccountSecurityRoute = (): ReactElement => {
	const isTwoFactorEnabled = useSetting('Accounts_TwoFactorAuthentication_Enabled');
	const isE2EEnabled = useSetting('E2E_Enable');
	const canViewSecurity = isTwoFactorEnabled || isE2EEnabled;

	if (!canViewSecurity) {
		return <NotAuthorizedPage />;
	}

	return <AccountSecurityPage />;
};

export default AccountSecurityRoute;
