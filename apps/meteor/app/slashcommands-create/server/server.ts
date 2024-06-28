import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import { api } from '@rocket.chat/core-services';
import { Rooms } from '@rocket.chat/models';

import { settings } from '../../settings/server';
import { slashCommands } from '../../utils/lib/slashCommand';

slashCommands.add({
	command: 'create',
	callback: async function Create(_command: 'create', params, item): Promise<void> {
		function getParams(str: string): string[] {
			const regex = /(--(\w+))+/g;
			const result = [];
			let m;
			while ((m = regex.exec(str)) !== null) {
				if (m.index === regex.lastIndex) {
					regex.lastIndex++;
				}
				result.push(m[2]);
			}
			return result;
		}

		const regexp = new RegExp(settings.get('UTF8_Channel_Names_Validation') as string);

		const channel = regexp.exec(params.trim());

		if (!channel) {
			return;
		}

		const channelStr: string = channel ? channel[0] : '';
		if (channelStr === '') {
			return;
		}
		const userId = Meteor.userId() as string;

		const room = await Rooms.findOneByName(channelStr);
		if (room != null) {
			void api.broadcast('notify.ephemeralMessage', userId, item.rid, {
				msg: TAPi18n.__('Channel_already_exist', {
					postProcess: 'sprintf',
					sprintf: [channelStr],
					lng: settings.get('Language') || 'en',
				}),
			});
			return;
		}

		if (getParams(params).indexOf('private') > -1) {
			return Meteor.callAsync('createPrivateGroup', channelStr, []);
		}

		await Meteor.callAsync('createChannel', channelStr, []);
	},
	options: {
		description: 'Create_A_New_Channel',
		params: '#channel',
		permission: ['create-c', 'create-p'],
	},
});
