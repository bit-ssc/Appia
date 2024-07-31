import { Meteor } from 'meteor/meteor';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { Users } from '@rocket.chat/models';

import { Livechat } from '../lib/Livechat';
import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { methodDeprecationLogger } from '../../../lib/server/lib/deprecationWarningLogger';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'livechat:changeLivechatStatus'(params?: { status?: string; agentId?: string }): unknown;
	}
}

Meteor.methods<ServerMethods>({
	async 'livechat:changeLivechatStatus'({ status, agentId = Meteor.userId() } = {}) {
		methodDeprecationLogger.warn(
			'livechat:changeLivechatStatus is deprecated and will be removed in future versions of Rocket.Chat. Use /api/v1/livechat/agent.status REST API instead.',
		);

		const uid = Meteor.userId();

		if (!uid || !agentId) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'livechat:changeLivechatStatus',
			});
		}

		const agent = await Users.findOneAgentById(agentId, {
			projection: {
				status: 1,
				statusLivechat: 1,
			},
		});

		if (!agent) {
			throw new Meteor.Error('error-not-allowed', 'Invalid Agent Id', {
				method: 'livechat:changeLivechatStatus',
			});
		}

		if (status && !['available', 'not-available'].includes(status)) {
			throw new Meteor.Error('error-not-allowed', 'Invalid Status', {
				method: 'livechat:changeLivechatStatus',
			});
		}

		const newStatus = status || (agent.statusLivechat === 'available' ? 'not-available' : 'available');

		if (newStatus === agent.statusLivechat) {
			return;
		}

		if (agentId !== uid) {
			if (!(await hasPermissionAsync(uid, 'manage-livechat-agents'))) {
				throw new Meteor.Error('error-not-allowed', 'Not allowed', {
					method: 'livechat:saveAgentInfo',
				});
			}
			return Livechat.setUserStatusLivechat(agentId, newStatus);
		}

		if (!(await Livechat.allowAgentChangeServiceStatus(newStatus, agentId))) {
			throw new Meteor.Error('error-business-hours-are-closed', 'Not allowed', {
				method: 'livechat:changeLivechatStatus',
			});
		}

		return Livechat.setUserStatusLivechat(agentId, newStatus);
	},
});
