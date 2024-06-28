import { Meteor } from 'meteor/meteor';
import { LivechatVisitors, LivechatCustomField, LivechatRooms } from '@rocket.chat/models';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import type { UpdateResult, Document } from 'mongodb';

import { methodDeprecationLogger } from '../../../lib/server/lib/deprecationWarningLogger';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'livechat:setCustomField'(token: string, key: string, value: string, overwrite?: boolean): Promise<boolean | UpdateResult | Document>;
	}
}

Meteor.methods<ServerMethods>({
	async 'livechat:setCustomField'(token, key, value, overwrite = true) {
		methodDeprecationLogger.warn('livechat:setCustomField will be deprecated in future versions of Rocket.Chat');

		const customField = await LivechatCustomField.findOneById(key);
		if (customField) {
			if (customField.scope === 'room') {
				return LivechatRooms.updateDataByToken(token, key, value, overwrite);
			}
			// Save in user
			return LivechatVisitors.updateLivechatDataByToken(token, key, value, overwrite);
		}

		return true;
	},
});
