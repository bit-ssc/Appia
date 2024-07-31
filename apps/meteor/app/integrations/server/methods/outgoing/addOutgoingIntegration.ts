import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import type { INewOutgoingIntegration, IOutgoingIntegration } from '@rocket.chat/core-typings';
import { Integrations } from '@rocket.chat/models';
import type { ServerMethods } from '@rocket.chat/ui-contexts';

import { hasPermissionAsync } from '../../../../authorization/server/functions/hasPermission';
import { validateOutgoingIntegration } from '../../lib/validateOutgoingIntegration';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		addOutgoingIntegration(integration: INewOutgoingIntegration): Promise<IOutgoingIntegration>;
	}
}

Meteor.methods<ServerMethods>({
	async addOutgoingIntegration(integration: INewOutgoingIntegration): Promise<IOutgoingIntegration> {
		const { userId } = this;

		check(
			integration,
			Match.ObjectIncluding({
				type: String,
				name: String,
				enabled: Boolean,
				username: String,
				channel: String,
				alias: Match.Maybe(String),
				emoji: Match.Maybe(String),
				scriptEnabled: Boolean,
				script: Match.Maybe(String),
				urls: Match.Maybe([String]),
				event: Match.Maybe(String),
				triggerWords: Match.Maybe([String]),
				avatar: Match.Maybe(String),
				token: Match.Maybe(String),
				impersonateUser: Match.Maybe(Boolean),
				retryCount: Match.Maybe(Number),
				retryDelay: Match.Maybe(String),
				retryFailedCalls: Match.Maybe(Boolean),
				runOnEdits: Match.Maybe(Boolean),
				targetRoom: Match.Maybe(String),
				triggerWordAnywhere: Match.Maybe(Boolean),
			}),
		);

		if (
			!userId ||
			(!(await hasPermissionAsync(userId, 'manage-outgoing-integrations')) &&
				!(await hasPermissionAsync(userId, 'manage-own-outgoing-integrations')))
		) {
			throw new Meteor.Error('not_authorized');
		}

		const integrationData = await validateOutgoingIntegration(integration, userId);

		const result = await Integrations.insertOne(integrationData);
		integrationData._id = result.insertedId;

		return integrationData;
	},
});
