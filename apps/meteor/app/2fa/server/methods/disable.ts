import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import { Users } from '@rocket.chat/models';

import { TOTP } from '../lib/totp';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'2fa:disable': (code: string) => Promise<boolean>;
	}
}

Meteor.methods<ServerMethods>({
	async '2fa:disable'(code) {
		const userId = Meteor.userId();
		if (!userId) {
			throw new Meteor.Error('not-authorized');
		}

		const user = await Meteor.userAsync();

		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: '2fa:disable',
			});
		}

		const verified = await TOTP.verify({
			secret: user.services.totp.secret,
			token: code,
			userId,
			backupTokens: user.services.totp.hashedBackup,
		});

		if (!verified) {
			return false;
		}

		return (await Users.disable2FAByUserId(userId)).modifiedCount > 0;
	},
});
