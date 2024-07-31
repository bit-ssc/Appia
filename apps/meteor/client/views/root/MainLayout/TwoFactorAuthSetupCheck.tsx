import { useLayout, useUser, useSetting } from '@rocket.chat/ui-contexts';
import type { ReactElement, ReactNode } from 'react';
import React, { lazy, useCallback } from 'react';

import LayoutWithSidebar from './LayoutWithSidebar';
import { Roles } from '../../../../app/models/client';
import { useReactiveValue } from '../../../hooks/useReactiveValue';

const AccountSecurityPage = lazy(() => import('../../account/security/AccountSecurityPage'));

const TwoFactorAuthSetupCheck = ({ children }: { children: ReactNode }): ReactElement => {
	const { isEmbedded: embeddedLayout } = useLayout();
	const user = useUser();
	const tfaEnabled = useSetting('Accounts_TwoFactorAuthentication_Enabled');
	const require2faSetup = useReactiveValue(
		useCallback(() => {
			// User is already using 2fa
			if (!user || user?.services?.totp?.enabled || user?.services?.email2fa?.enabled) {
				return false;
			}

			const mandatoryRole = Roles.findOne({ _id: { $in: user.roles ?? [] }, mandatory2fa: true });
			return mandatoryRole !== undefined && tfaEnabled;
		}, [tfaEnabled, user]),
	);

	if (require2faSetup) {
		return (
			<main id='rocket-chat' className={embeddedLayout ? 'embedded-view' : undefined}>
				<div className='rc-old main-content content-background-color'>
					<AccountSecurityPage />
				</div>
			</main>
		);
	}

	return <LayoutWithSidebar>{children}</LayoutWithSidebar>;
};

export default TwoFactorAuthSetupCheck;
