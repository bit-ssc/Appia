import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';

import { callbacks } from '../../../../lib/callbacks';
import { methodDeprecationLogger } from '../../../lib/server/lib/deprecationWarningLogger';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'livechat:getDepartmentForwardRestrictions'(departmentId: string): unknown;
	}
}

Meteor.methods<ServerMethods>({
	'livechat:getDepartmentForwardRestrictions'(departmentId) {
		methodDeprecationLogger.warn('livechat:getDepartmentForwardRestrictions will be deprecated in future versions of Rocket.Chat');
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'livechat:getDepartmentForwardRestrictions',
			});
		}

		const options = callbacks.run('livechat.onLoadForwardDepartmentRestrictions', { departmentId });
		const { restrictions } = options;

		return restrictions;
	},
});
