import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import { LivechatInquiry, Users } from '@rocket.chat/models';

import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { RoutingManager } from '../lib/RoutingManager';
import { settings } from '../../../settings/server';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'livechat:takeInquiry'(inquiryId: string, options?: { clientAction: boolean; forwardingToDepartment?: boolean }): unknown;
	}
}

Meteor.methods<ServerMethods>({
	async 'livechat:takeInquiry'(inquiryId, options) {
		const uid = Meteor.userId();
		if (!uid || !(await hasPermissionAsync(uid, 'view-l-room'))) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'livechat:takeInquiry',
			});
		}

		const inquiry = await LivechatInquiry.findOneById(inquiryId);

		if (!inquiry) {
			throw new Meteor.Error('error-not-found', 'Inquiry not found', {
				method: 'livechat:takeInquiry',
			});
		}

		if (inquiry.status === 'taken') {
			throw new Meteor.Error('error-inquiry-taken', 'Inquiry already taken', {
				method: 'livechat:takeInquiry',
			});
		}

		const user = await Users.findOneOnlineAgentById(uid, settings.get<boolean>('Livechat_enabled_when_agent_idle'));
		if (!user) {
			throw new Meteor.Error('error-agent-status-service-offline', 'Agent status is offline or Omnichannel service is not active', {
				method: 'livechat:takeInquiry',
			});
		}

		const agent = {
			agentId: user._id,
			username: user.username,
		};

		try {
			await RoutingManager.takeInquiry(inquiry, agent, options);
		} catch (e: any) {
			throw new Meteor.Error(e.message);
		}
	},
});
