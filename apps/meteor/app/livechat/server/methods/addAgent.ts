import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import type { IUser } from '@rocket.chat/core-typings';

import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { methodDeprecationLogger } from '../../../lib/server/lib/deprecationWarningLogger';
import { Livechat } from '../lib/Livechat';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'livechat:addAgent'(username: string): Promise<false | IUser>;
	}
}

Meteor.methods<ServerMethods>({
	async 'livechat:addAgent'(username) {
		const uid = Meteor.userId();
		methodDeprecationLogger.warn('livechat:addAgent will be deprecated in future versions of Rocket.Chat');
		if (!uid || !(await hasPermissionAsync(uid, 'manage-livechat-agents'))) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:addAgent' });
		}

		return Livechat.addAgent(username);
	},
});
