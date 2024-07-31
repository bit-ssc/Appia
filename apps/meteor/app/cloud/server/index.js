import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/littledata:synced-cron';

import { getWorkspaceAccessToken } from './functions/getWorkspaceAccessToken';
import { getWorkspaceAccessTokenWithScope } from './functions/getWorkspaceAccessTokenWithScope';
import { retrieveRegistrationStatus } from './functions/retrieveRegistrationStatus';
import { syncWorkspace } from './functions/syncWorkspace';
import { connectWorkspace } from './functions/connectWorkspace';
import { settings } from '../../settings/server';
import { SystemLogger } from '../../../server/lib/logger/system';
import './methods';

const licenseCronName = 'Cloud Workspace Sync';

Meteor.startup(async function () {
	// run token/license sync if registered
	let TroubleshootDisableWorkspaceSync;
	settings.watch('Troubleshoot_Disable_Workspace_Sync', (value) => {
		if (TroubleshootDisableWorkspaceSync === value) {
			return;
		}
		TroubleshootDisableWorkspaceSync = value;

		if (value) {
			return SyncedCron.remove(licenseCronName);
		}

		Meteor.defer(() => syncWorkspace());

		SyncedCron.add({
			name: licenseCronName,
			schedule(parser) {
				// Every 12 hours
				return parser.cron('0 */12 * * *');
			},
			job: syncWorkspace,
		});
	});

	const { workspaceRegistered } = await retrieveRegistrationStatus();

	if (process.env.REG_TOKEN && process.env.REG_TOKEN !== '' && !workspaceRegistered) {
		try {
			SystemLogger.info('REG_TOKEN Provided. Attempting to register');

			if (!(await connectWorkspace(process.env.REG_TOKEN))) {
				throw new Error("Couldn't register with token.  Please make sure token is valid or hasn't already been used");
			}

			console.log('Successfully registered with token provided by REG_TOKEN!');
		} catch (e) {
			SystemLogger.error('An error occured registering with token.', e.message);
		}
	}
});

export { getWorkspaceAccessToken, getWorkspaceAccessTokenWithScope };
