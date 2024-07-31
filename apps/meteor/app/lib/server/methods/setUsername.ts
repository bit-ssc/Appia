import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'underscore';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { Users } from '@rocket.chat/models';

import { settings } from '../../../settings/server';
import { callbacks } from '../../../../lib/callbacks';
import { checkUsernameAvailability } from '../functions/checkUsernameAvailability';
import { RateLimiter } from '../lib';
import { saveUserIdentity } from '../functions/saveUserIdentity';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		setUsername(username: string, param?: { joinDefaultChannelsSilenced?: boolean }): string;
	}
}

Meteor.methods<ServerMethods>({
	async setUsername(username, param = {}) {
		const { joinDefaultChannelsSilenced } = param;
		check(username, String);

		const user = await Meteor.userAsync();

		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'setUsername' });
		}

		if (user.username && !settings.get('Accounts_AllowUsernameChange')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'setUsername' });
		}

		if (user.username === username || (user.username && user.username.toLowerCase() === username.toLowerCase())) {
			return username;
		}

		let nameValidation;
		try {
			nameValidation = new RegExp(`^${settings.get('UTF8_User_Names_Validation')}$`);
		} catch (error) {
			nameValidation = new RegExp('^[0-9a-zA-Z-_.]+$');
		}

		if (!nameValidation.test(username)) {
			throw new Meteor.Error(
				'username-invalid',
				`${_.escape(username)} is not a valid username, use only letters, numbers, dots, hyphens and underscores`,
			);
		}

		if (!(await checkUsernameAvailability(username))) {
			throw new Meteor.Error('error-field-unavailable', `<strong>${_.escape(username)}</strong> is already in use :(`, {
				method: 'setUsername',
				field: username,
			});
		}

		if (!(await saveUserIdentity({ _id: user._id, username }))) {
			throw new Meteor.Error('error-could-not-change-username', 'Could not change username', {
				method: 'setUsername',
			});
		}

		if (!user.username) {
			await Meteor.runAsUser(user._id, () => Meteor.callAsync('joinDefaultChannels', joinDefaultChannelsSilenced));
			Meteor.defer(async function () {
				return callbacks.run('afterCreateUser', await Users.findOneById(user._id));
			});
		}

		return username;
	},
});

RateLimiter.limitMethod('setUsername', 1, 1000, {
	userId() {
		return true;
	},
});
