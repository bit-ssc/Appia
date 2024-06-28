import qs from 'querystring';

import { useSession, useUserId, useSetting } from '@rocket.chat/ui-contexts';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';

import LoginPage from './LoginPage';
import UsernameCheck from './UsernameCheck';
import { settings } from '../../../../app/settings/client/lib/settings';

/*
 * Anonymous and guest are similar in some way
 *
 * Anonymous is an old feature that allows the user to navigate as an anonymus user
 * by default the user dont need to do anything its hadled by the system but by behind the scenes a new    * user is registered
 *
 * Guest is only for certain locations, it shows a form asking if the user wants to stay as guest and if so
 * renders the page, without creating an user (not even an anonymous user)
 */
const AuthenticationCheck = ({ children }: { children: ReactNode }): ReactElement => {
	const [showLoginPage, setShowLoginPage] = useState(false);
	const uid = useUserId();
	const allowAnonymousRead = useSetting('Accounts_AllowAnonymousRead');
	const forceLogin = useSession('forceLogin');

	const showLogin = !uid && (allowAnonymousRead !== true || forceLogin === true);
	useEffect(() => {
		if (showLogin) {
			const credentialToken = window.sessionStorage.getItem('credentialToken');
			if (credentialToken) {
				window.sessionStorage.removeItem('credentialToken');

				Accounts.callLoginMethod({
					methodArguments: [{ cas: { credentialToken } }],
					userCallback: () => {
						window.location.href = window.sessionStorage.getItem('LOGIN_BACK_URL') || `/home`;
					},
				});
			} else if (settings.get('CAS_enabled') && !qs.parse(window.location.search.substring(1)).test) {
				const loginUrl = settings.get('CAS_login_url');
				const callbackUrl = settings.get('CAS_callback_url');
				if (loginUrl) {
					const credentialToken = Random.id();
					window.sessionStorage.setItem('credentialToken', credentialToken);
					const appUrl = callbackUrl || Meteor.absoluteUrl().replace(/\/$/, '') + window.__meteor_runtime_config__.ROOT_URL_PATH_PREFIX;
					const delim = loginUrl.split('?').length > 1 ? '&' : '?';

					const { latestSSoTime } = window.sessionStorage;
					if (!latestSSoTime || Date.now() - latestSSoTime > 3000) {
						window.sessionStorage.latestSSoTime = Date.now();
						window.location.href = `${loginUrl}${delim}service=${appUrl}/_cas/${credentialToken}`;
					} else {
						setShowLoginPage(true);
					}
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (showLoginPage) {
		return <LoginPage />;
	}
	if (showLogin) {
		if (window.sessionStorage.getItem('credentialToken')) {
			return <></>;
		}

		if (settings.get('CAS_enabled') && !qs.parse(window.location.search.substring(1)).test) {
			const loginUrl = settings.get('CAS_login_url');

			if (loginUrl) {
				return <></>;
			}
		}

		return <LoginPage />;
	}
	return <UsernameCheck>{children}</UsernameCheck>;
};

export default AuthenticationCheck;
