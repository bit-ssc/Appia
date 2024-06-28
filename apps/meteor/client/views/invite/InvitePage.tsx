import { HeroLayout, HeroLayoutTitle } from '@rocket.chat/layout';
import {
	useToastMessageDispatch,
	useSessionDispatch,
	useRoute,
	useRouteParameter,
	useUserId,
	useSetting,
	useTranslation,
} from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React from 'react';

import { APIClient } from '../../../app/utils/client';
import LoginPage from '../root/MainLayout/LoginPage';
import PageLoading from '../root/PageLoading';

const InvitePage = (): ReactElement => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const token = useRouteParameter('hash');
	const registrationForm = useSetting('Accounts_RegistrationForm');
	const setLoginDefaultState = useSessionDispatch('loginDefaultState');
	const userId = useUserId();
	const homeRoute = useRoute('/');
	const groupRoute = useRoute('/group/:name/:tab?/:context?');
	const channelRoute = useRoute('/channel/:name/:tab?/:context?');

	const { isLoading, data } = useQuery(
		['invite', token],
		async () => {
			if (!token) {
				return false;
			}

			try {
				const { valid } = await APIClient.post('/v1/validateInviteToken', { token });

				return valid;
			} catch (error) {
				dispatchToastMessage({ type: 'error', message: t('Failed_to_validate_invite_token') });
				return false;
			}
		},
		{
			onSuccess: async (valid) => {
				if (!token) {
					return;
				}

				if (registrationForm !== 'Disabled') {
					setLoginDefaultState('register');
				} else {
					setLoginDefaultState('login');
				}

				if (!valid || !userId) {
					return;
				}

				try {
					const result = await APIClient.post('/v1/useInviteToken', { token });

					if (!result.room.name) {
						dispatchToastMessage({ type: 'error', message: t('Failed_to_activate_invite_token') });
						homeRoute.push();
						return;
					}

					if (result.room.t === 'p') {
						groupRoute.push({ name: result.room.name });
						return;
					}

					channelRoute.push({ name: result.room.name });
				} catch (error) {
					dispatchToastMessage({ type: 'error', message: t('Failed_to_activate_invite_token') });
					homeRoute.push();
				}
			},
		},
	);

	if (data) {
		return <LoginPage />;
	}

	if (isLoading) {
		return <PageLoading />;
	}

	return (
		<HeroLayout>
			<HeroLayoutTitle>{t('Invalid_or_expired_invite_token')}</HeroLayoutTitle>
		</HeroLayout>
	);
};

export default InvitePage;
