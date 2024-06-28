import { Meteor } from 'meteor/meteor';
import type { ServerMethods } from '@rocket.chat/ui-contexts';

import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { Livechat } from '../lib/Livechat';
import { methodDeprecationLogger } from '../../../lib/server/lib/deprecationWarningLogger';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'livechat:removeAgent'(username: string): boolean;
	}
}

Meteor.methods<ServerMethods>({
	async 'livechat:removeAgent'(username) {
		methodDeprecationLogger.warn('livechat:removeAgent will be deprecated in future versions of Rocket.Chat');
		const uid = Meteor.userId();
		if (!uid || !(await hasPermissionAsync(uid, 'manage-livechat-agents'))) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'livechat:removeAgent',
			});
		}

		return Livechat.removeAgent(username);
	},
});
