import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import type { ServerMethods } from '@rocket.chat/ui-contexts';

import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { addOAuthService } from '../functions/addOAuthService';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		addOAuthService(name: string): void;
	}
}

Meteor.methods<ServerMethods>({
	async addOAuthService(name) {
		check(name, String);

		const userId = Meteor.userId();

		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'addOAuthService' });
		}

		if ((await hasPermissionAsync(userId, 'add-oauth-service')) !== true) {
			throw new Meteor.Error('error-action-not-allowed', 'Adding OAuth Services is not allowed', {
				method: 'addOAuthService',
				action: 'Adding_OAuth_Services',
			});
		}

		addOAuthService(name);
	},
});
