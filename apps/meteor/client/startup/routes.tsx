import type { IUser } from '@rocket.chat/core-typings';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import { Tracker } from 'meteor/tracker';
import React, { lazy } from 'react';

import { KonchatNotification } from '../../app/ui/client/lib/KonchatNotification';
import { APIClient } from '../../app/utils/client';
import { appLayout } from '../lib/appLayout';
import { dispatchToastMessage } from '../lib/toast';
import MainLayout from '../views/root/MainLayout';

const PageLoading = lazy(() => import('../views/root/PageLoading'));
const HomePage = lazy(() => import('../views/home/HomePage'));
const InvitePage = lazy(() => import('../views/invite/InvitePage'));
const ConferenceRoute = lazy(() => import('../views/conference/ConferenceRoute'));

const SecretURLPage = lazy(() => import('../views/invite/SecretURLPage'));
const CMSPage = lazy(() => import('@rocket.chat/web-ui-registration').then(({ CMSPage }) => ({ default: CMSPage })));
const ResetPasswordPage = lazy(() =>
	import('@rocket.chat/web-ui-registration').then(({ ResetPasswordPage }) => ({ default: ResetPasswordPage })),
);

const MailerUnsubscriptionPage = lazy(() => import('../views/mailer/MailerUnsubscriptionPage'));
const SetupWizardRoute = lazy(() => import('../views/setupWizard/SetupWizardRoute'));
const NotFoundPage = lazy(() => import('../views/notFound/NotFoundPage'));
const MeetPage = lazy(() => import('../views/meet/MeetPage'));

const DirectoryPage = lazy(() => import('../views/directory'));
const OmnichannelDirectoryPage = lazy(() => import('../views/omnichannel/directory/OmnichannelDirectoryPage'));
const OmnichannelQueueList = lazy(() => import('../views/omnichannel/queueList'));

const OAuthAuthorizationPage = lazy(() => import('../views/oauth/OAuthAuthorizationPage'));
const OAuthErrorPage = lazy(() => import('../views/oauth/OAuthErrorPage'));

const Embed = lazy(() => import('../views/embed'));
const Contact = lazy(() => import('../views/contact'));

FlowRouter.wait();

FlowRouter.route('/', {
	name: 'index',
	action() {
		appLayout.render(
			<MainLayout>
				<PageLoading />
			</MainLayout>,
		);

		if (!Meteor.userId()) {
			return FlowRouter.go('home');
		}

		Tracker.autorun((c) => {
			if (FlowRouter.subsReady() === true) {
				Meteor.defer(async () => {
					const user = Meteor.user() as IUser | null;
					if (user?.defaultRoom) {
						const room = user.defaultRoom.split('/');
						FlowRouter.go(room[0], { name: room[1] }, FlowRouter.current().queryParams);
					} else {
						FlowRouter.go('home');
					}
				});
				c.stop();
			}
		});
	},
});

FlowRouter.route('/login', {
	name: 'login',

	action() {
		FlowRouter.go('home');
	},
});

FlowRouter.route('/meet/:rid', {
	name: 'meet',

	async action(_params, queryParams) {
		if (queryParams?.token !== undefined) {
			// visitor login
			const result = await APIClient.get(`/v1/livechat/visitor/${queryParams.token}`);
			if ('visitor' in result) {
				appLayout.render(<MeetPage />);
				return;
			}

			dispatchToastMessage({ type: 'error', message: TAPi18n.__('Visitor_does_not_exist') });
			return;
		}

		if (!Meteor.userId()) {
			FlowRouter.go('home');
			return;
		}

		appLayout.render(<MeetPage />);
	},
});

FlowRouter.route('/home', {
	name: 'home',

	action(_params, queryParams) {
		KonchatNotification.getDesktopPermission();
		if (queryParams?.saml_idp_credentialToken !== undefined) {
			const token = queryParams.saml_idp_credentialToken;
			FlowRouter.setQueryParams({
				saml_idp_credentialToken: null,
			});
			(Meteor as any).loginWithSamlToken(token, (error?: unknown) => {
				if (error) {
					dispatchToastMessage({ type: 'error', message: error });
				}

				appLayout.render(
					<MainLayout>
						<HomePage />
					</MainLayout>,
				);
			});

			return;
		}

		appLayout.render(
			<MainLayout>
				<HomePage />
			</MainLayout>,
		);
	},
});

FlowRouter.route('/directory/:tab?', {
	name: 'directory',
	action: () => {
		appLayout.render(
			<MainLayout>
				<DirectoryPage />
			</MainLayout>,
		);
	},
});

FlowRouter.route('/omnichannel-directory/:page?/:bar?/:id?/:tab?/:context?', {
	name: 'omnichannel-directory',
	action: () => {
		appLayout.render(
			<MainLayout>
				<OmnichannelDirectoryPage />
			</MainLayout>,
		);
	},
});

FlowRouter.route('/livechat-queue', {
	name: 'livechat-queue',
	action: () => {
		appLayout.render(
			<MainLayout>
				<OmnichannelQueueList />
			</MainLayout>,
		);
	},
});

FlowRouter.route('/terms-of-service', {
	name: 'terms-of-service',
	action: () => {
		appLayout.render(<CMSPage page='Layout_Terms_of_Service' />);
	},
});

FlowRouter.route('/privacy-policy', {
	name: 'privacy-policy',
	action: () => {
		appLayout.render(<CMSPage page='Layout_Privacy_Policy' />);
	},
});

FlowRouter.route('/legal-notice', {
	name: 'legal-notice',
	action: () => {
		appLayout.render(<CMSPage page='Layout_Legal_Notice' />);
	},
});

FlowRouter.route('/register/:hash', {
	name: 'register-secret-url',
	action: () => {
		appLayout.render(<SecretURLPage />);
	},
});

FlowRouter.route('/invite/:hash', {
	name: 'invite',
	action: () => {
		appLayout.render(<InvitePage />);
	},
});

FlowRouter.route('/conference/:id', {
	name: 'conference',
	action: () => {
		appLayout.render(<ConferenceRoute />);
	},
});

FlowRouter.route('/setup-wizard/:step?', {
	name: 'setup-wizard',
	action: () => {
		appLayout.renderStandalone(<SetupWizardRoute />);
	},
});

FlowRouter.route('/mailer/unsubscribe/:_id/:createdAt', {
	name: 'mailer-unsubscribe',
	action: () => {
		appLayout.render(<MailerUnsubscriptionPage />);
	},
});

FlowRouter.route('/login-token/:token', {
	name: 'tokenLogin',
	action(params) {
		Accounts.callLoginMethod({
			methodArguments: [
				{
					loginToken: params?.token,
				},
			],
			userCallback(error) {
				console.error(error);
				FlowRouter.go('/');
			},
		});
	},
});

FlowRouter.route('/reset-password/:token', {
	name: 'resetPassword',
	action() {
		appLayout.render(<ResetPasswordPage />);
	},
});

FlowRouter.route('/oauth/authorize', {
	name: 'oauth/authorize',
	action() {
		appLayout.render(<OAuthAuthorizationPage />);
	},
});

FlowRouter.route('/oauth/error/:error', {
	name: 'oauth/error',
	action() {
		appLayout.render(<OAuthErrorPage />);
	},
});

FlowRouter.route('/contact', {
	name: 'contact',
	action() {
		appLayout.render(
			<MainLayout>
				<Contact />
			</MainLayout>,
		);
	},
});

FlowRouter.route('/embed', {
	name: 'embed',
	action() {
		appLayout.render(
			<MainLayout>
				<Embed />
			</MainLayout>,
		);
	},
});

FlowRouter.notFound = {
	action: (): void => {
		appLayout.render(<NotFoundPage />);
	},
};

Meteor.startup(() => {
	FlowRouter.initialize();
});
