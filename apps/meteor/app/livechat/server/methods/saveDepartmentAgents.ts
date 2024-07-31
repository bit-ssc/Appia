import { Meteor } from 'meteor/meteor';
import type { ServerMethods } from '@rocket.chat/ui-contexts';

import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { Livechat } from '../lib/Livechat';
import { methodDeprecationLogger } from '../../../lib/server/lib/deprecationWarningLogger';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'livechat:saveDepartmentAgents'(
			_id: string,
			departmentAgents: {
				agentId: string;
				count?: number;
				order?: number;
			}[],
		): boolean;
	}
}

Meteor.methods<ServerMethods>({
	async 'livechat:saveDepartmentAgents'(_id, departmentAgents) {
		methodDeprecationLogger.warn('livechat:saveDepartmentAgents will be deprecated in future versions of Rocket.Chat');

		const uid = Meteor.userId();
		if (!uid || !(await hasPermissionAsync(uid, 'add-livechat-department-agents'))) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'livechat:saveDepartmentAgents',
			});
		}

		return Livechat.saveDepartmentAgents(_id, { upsert: departmentAgents });
	},
});
