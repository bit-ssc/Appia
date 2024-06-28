import { SyncedCron } from 'meteor/littledata:synced-cron';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import { AppStatus } from '@rocket.chat/apps-engine/definition/AppStatus';
import { Settings, Users } from '@rocket.chat/models';

import { Apps } from './orchestrator';
import { getWorkspaceAccessToken } from '../../../app/cloud/server';
import { sendMessagesToAdmins } from '../../../server/lib/sendMessagesToAdmins';
import { fetch } from '../../../server/lib/http/fetch';

const notifyAdminsAboutInvalidApps = async function _notifyAdminsAboutInvalidApps(apps) {
	if (!apps) {
		return;
	}

	const hasInvalidApps = !!apps.find((app) => app.getLatestLicenseValidationResult().hasErrors);

	if (!hasInvalidApps) {
		return;
	}

	const id = 'someAppInInvalidState';
	const title = 'Warning';
	const text = 'There is one or more apps in an invalid state. Click here to review.';
	const rocketCatMessage = 'There is one or more apps in an invalid state. Go to Administration > Apps to review.';
	const link = '/admin/apps';

	await sendMessagesToAdmins({
		msgs: async ({ adminUser }) => ({
			msg: `*${TAPi18n.__(title, adminUser.language)}*\n${TAPi18n.__(rocketCatMessage, adminUser.language)}`,
		}),
		banners: async ({ adminUser }) => {
			await Users.removeBannerById(adminUser._id, { id });

			return [
				{
					id,
					priority: 10,
					title,
					text,
					modifiers: ['danger'],
					link,
				},
			];
		},
	});

	return apps;
};

const notifyAdminsAboutRenewedApps = async function _notifyAdminsAboutRenewedApps(apps) {
	if (!apps) {
		return;
	}

	const renewedApps = apps.filter(
		(app) => app.getStatus() === AppStatus.DISABLED && app.getPreviousStatus() === AppStatus.INVALID_LICENSE_DISABLED,
	);

	if (renewedApps.length === 0) {
		return;
	}

	const rocketCatMessage = 'There is one or more disabled apps with valid licenses. Go to Administration > Apps to review.';

	await sendMessagesToAdmins({
		msgs: async ({ adminUser }) => ({ msg: `${TAPi18n.__(rocketCatMessage, adminUser.language)}` }),
	});
};

const appsUpdateMarketplaceInfo = async function _appsUpdateMarketplaceInfo() {
	const token = await getWorkspaceAccessToken();
	const baseUrl = Apps.getMarketplaceUrl();
	const workspaceIdSetting = await Settings.getValueById('Cloud_Workspace_Id');

	const currentSeats = await Users.getActiveLocalUserCount();

	const fullUrl = `${baseUrl}/v1/workspaces/${workspaceIdSetting}/apps?seats=${currentSeats}`;
	const options = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};

	let data = [];

	try {
		const response = await fetch(fullUrl, options);

		const result = await response.json();

		if (Array.isArray(result)) {
			data = result;
		}
	} catch (err) {
		Apps.debugLog(err);
	}

	await Apps.updateAppsMarketplaceInfo(data).then(notifyAdminsAboutInvalidApps).then(notifyAdminsAboutRenewedApps);
};

SyncedCron.add({
	name: 'Apps-Engine:check',
	schedule: (parser) => parser.text('at 4:00 am'),
	async job() {
		await appsUpdateMarketplaceInfo();
	},
});
