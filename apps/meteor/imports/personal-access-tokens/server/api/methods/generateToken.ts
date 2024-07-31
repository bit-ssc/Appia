import { Meteor } from 'meteor/meteor';
import { Random } from '@rocket.chat/random';
import { Accounts } from 'meteor/accounts-base';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { Users } from '@rocket.chat/models';

import { hasPermissionAsync } from '../../../../../app/authorization/server/functions/hasPermission';
import { twoFactorRequired } from '../../../../../app/2fa/server/twoFactorRequired';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'personalAccessTokens:generateToken'(params: { tokenName: string; bypassTwoFactor: boolean }): Promise<string>;
	}
}

Meteor.methods<ServerMethods>({
	'personalAccessTokens:generateToken': twoFactorRequired(async function ({ tokenName, bypassTwoFactor }) {
		const uid = Meteor.userId();
		if (!uid) {
			throw new Meteor.Error('not-authorized', 'Not Authorized', {
				method: 'personalAccessTokens:generateToken',
			});
		}
		if (!(await hasPermissionAsync(uid, 'create-personal-access-tokens'))) {
			throw new Meteor.Error('not-authorized', 'Not Authorized', {
				method: 'personalAccessTokens:generateToken',
			});
		}

		const token = Random.secret();
		const tokenExist = await Users.findPersonalAccessTokenByTokenNameAndUserId({
			userId: uid,
			tokenName,
		});
		if (tokenExist) {
			throw new Meteor.Error('error-token-already-exists', 'A token with this name already exists', {
				method: 'personalAccessTokens:generateToken',
			});
		}

		await Users.addPersonalAccessTokenToUser({
			userId: uid,
			loginTokenObject: {
				hashedToken: Accounts._hashLoginToken(token),
				type: 'personalAccessToken',
				createdAt: new Date(),
				lastTokenPart: token.slice(-6),
				name: tokenName,
				bypassTwoFactor,
			},
		});
		return token;
	}),
});
