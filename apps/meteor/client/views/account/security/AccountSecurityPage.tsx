import { Box, Accordion } from '@rocket.chat/fuselage';
import { useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import EndToEnd from './EndToEnd';
import TwoFactorEmail from './TwoFactorEmail';
import TwoFactorTOTP from './TwoFactorTOTP';
import Page from '../../../components/Page';
import NotAuthorizedPage from '../../notAuthorized/NotAuthorizedPage';

const AccountSecurityPage = (): ReactElement => {
	const t = useTranslation();

	const twoFactorEnabled = useSetting('Accounts_TwoFactorAuthentication_Enabled');
	const twoFactorTOTP = useSetting('Accounts_TwoFactorAuthentication_By_TOTP_Enabled');
	const twoFactorByEmailEnabled = useSetting('Accounts_TwoFactorAuthentication_By_Email_Enabled');
	const e2eEnabled = useSetting('E2E_Enable');

	if (!twoFactorEnabled && !e2eEnabled) {
		return <NotAuthorizedPage />;
	}

	return (
		<Page>
			<Page.Header title={t('Security')} />
			<Page.ScrollableContentWithShadow>
				<Box maxWidth='x600' w='full' alignSelf='center' color='default'>
					<Accordion>
						{(twoFactorTOTP || twoFactorByEmailEnabled) && twoFactorEnabled && (
							<Accordion.Item title={t('Two Factor Authentication')} defaultExpanded>
								{twoFactorTOTP && <TwoFactorTOTP />}
								{twoFactorByEmailEnabled && <TwoFactorEmail />}
							</Accordion.Item>
						)}
						{e2eEnabled && (
							<Accordion.Item
								title={t('E2E Encryption')}
								aria-label={t('E2E Encryption')}
								defaultExpanded={!twoFactorEnabled}
								data-qa-type='e2e-encryption-section'
							>
								<EndToEnd />
							</Accordion.Item>
						)}
					</Accordion>
				</Box>
			</Page.ScrollableContentWithShadow>
		</Page>
	);
};

export default AccountSecurityPage;
