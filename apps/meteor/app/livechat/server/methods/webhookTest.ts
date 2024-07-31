import { Meteor } from 'meteor/meteor';
import type { ServerMethods } from '@rocket.chat/ui-contexts';

import { settings } from '../../../settings/server';
import { SystemLogger } from '../../../../server/lib/logger/system';
import { methodDeprecationLogger } from '../../../lib/server/lib/deprecationWarningLogger';
import { fetch } from '../../../../server/lib/http/fetch';

const postCatchError = async function (url: string, options?: Record<string, any> | undefined) {
	try {
		return fetch(url, { ...options, method: 'POST' });
	} catch (e) {
		return undefined; // TODO: should we return the error?
	}
};

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'livechat:webhookTest'(): Promise<any>;
	}
}

Meteor.methods<ServerMethods>({
	async 'livechat:webhookTest'() {
		methodDeprecationLogger.info(`Method 'livechat:webhookTest' is deprecated and will be removed in future versions of Rocket.Chat`);
		this.unblock();

		const sampleData = {
			type: 'LivechatSession',
			_id: 'fasd6f5a4sd6f8a4sdf',
			label: 'title',
			topic: 'asiodojf',
			createdAt: new Date(),
			lastMessageAt: new Date(),
			tags: ['tag1', 'tag2', 'tag3'],
			customFields: {
				productId: '123456',
			},
			visitor: {
				_id: '',
				name: 'visitor name',
				username: 'visitor-username',
				department: 'department',
				email: 'email@address.com',
				phone: '192873192873',
				ip: '123.456.7.89',
				browser: 'Chrome',
				os: 'Linux',
				customFields: {
					customerId: '123456',
				},
			},
			agent: {
				_id: 'asdf89as6df8',
				username: 'agent.username',
				name: 'Agent Name',
				email: 'agent@email.com',
			},
			messages: [
				{
					username: 'visitor-username',
					msg: 'message content',
					ts: new Date(),
				},
				{
					username: 'agent.username',
					agentId: 'asdf89as6df8',
					msg: 'message content from agent',
					ts: new Date(),
				},
			],
		};

		const options = {
			headers: {
				'X-RocketChat-Livechat-Token': settings.get<string>('Livechat_secret_token'),
			},
			body: JSON.stringify(sampleData),
		};

		const response = await postCatchError(settings.get('Livechat_webhookUrl'), options);

		SystemLogger.debug({ response });

		if (response?.ok) {
			return true;
		}

		throw new Meteor.Error('error-invalid-webhook-response');
	},
});
