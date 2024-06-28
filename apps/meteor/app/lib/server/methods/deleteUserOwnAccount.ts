import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { SHA256 } from '@rocket.chat/sha256';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { Users } from '@rocket.chat/models';

import { settings } from '../../../settings/server';
import { deleteUser } from '../functions';
import { AppEvents, Apps } from '../../../../ee/server/apps/orchestrator';
import { trim } from '../../../../lib/utils/stringUtils';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		deleteUserOwnAccount(password: string, confirmRelinquish?: boolean): Promise<boolean>;
	}
}

Meteor.methods<ServerMethods>({
	async deleteUserOwnAccount(password, confirmRelinquish) {
		check(password, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'deleteUserOwnAccount',
			});
		}

		if (!settings.get('Accounts_AllowDeleteOwnAccount')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'deleteUserOwnAccount',
			});
		}

		const uid = Meteor.userId();
		if (!uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'deleteUserOwnAccount',
			});
		}

		const user = await Users.findOneById(uid);
		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'deleteUserOwnAccount',
			});
		}

		if (user.services?.password && trim(user.services.password.bcrypt)) {
			const result = Accounts._checkPassword(user as Meteor.User, {
				digest: password.toLowerCase(),
				algorithm: 'sha-256',
			});
			if (result.error) {
				throw new Meteor.Error('error-invalid-password', 'Invalid password', {
					method: 'deleteUserOwnAccount',
				});
			}
		} else if (!user.username || SHA256(user.username) !== password.trim()) {
			throw new Meteor.Error('error-invalid-username', 'Invalid username', {
				method: 'deleteUserOwnAccount',
			});
		}

		await deleteUser(uid, confirmRelinquish);

		// App IPostUserDeleted event hook
		await Apps.triggerEvent(AppEvents.IPostUserDeleted, { user });

		return true;
	},
});
