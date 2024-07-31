import { Meteor } from 'meteor/meteor';
import type { ServerMethods, TranslationKey } from '@rocket.chat/ui-contexts';
import { Users } from '@rocket.chat/models';

import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import { Livechat } from '../lib/Livechat';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'livechat:getAgentOverviewData'(options: { chartOptions: { name: string } }): {
			head: { name: TranslationKey }[];
			data: { name: string; value: number | string }[];
		};
	}
}

Meteor.methods<ServerMethods>({
	async 'livechat:getAgentOverviewData'(options) {
		const uid = Meteor.userId();
		if (!uid || !(await hasPermissionAsync(uid, 'view-livechat-manager'))) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', {
				method: 'livechat:getAgentOverviewData',
			});
		}

		if (!options.chartOptions?.name) {
			Livechat.logger.warn('Incorrect analytics options');
			return;
		}

		const user = await Users.findOneById(uid, { projection: { _id: 1, utcOffset: 1 } });
		return Livechat.Analytics.getAgentOverviewData({ ...options, utcOffset: user?.utcOffset || 0 });
	},
});
