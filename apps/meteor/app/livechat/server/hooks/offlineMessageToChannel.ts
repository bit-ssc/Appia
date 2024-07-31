import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import { LivechatDepartment, Users, Rooms } from '@rocket.chat/models';

import { callbacks } from '../../../../lib/callbacks';
import { settings } from '../../../settings/server';
import { sendMessage } from '../../../lib/server';

callbacks.add(
	'livechat.offlineMessage',
	async (data) => {
		if (!settings.get('Livechat_OfflineMessageToChannel_enabled')) {
			return data;
		}

		let channelName = settings.get('Livechat_OfflineMessageToChannel_channel_name');
		let departmentName;
		const { name, email, department, message: text, host } = data;
		if (department && department !== '') {
			const dept = await LivechatDepartment.findOneById(department, {
				projection: { name: 1, offlineMessageChannelName: 1 },
			});
			departmentName = dept?.name;
			if (dept?.offlineMessageChannelName) {
				channelName = dept.offlineMessageChannelName;
			}
		}

		if (!channelName || channelName === '') {
			return data;
		}

		const room = await Rooms.findOneByName(channelName, { projection: { t: 1, archived: 1 } });
		if (!room || room.archived || room.closedAt) {
			return data;
		}

		const user = await Users.findOneById('rocket.cat', { projection: { username: 1 } });
		if (!user) {
			return data;
		}

		const lng = settings.get<string>('Language') || 'en';

		let msg = `${TAPi18n.__('New_Livechat_offline_message_has_been_sent', { lng })}: \n`;
		if (host && host !== '') {
			msg = msg.concat(`${TAPi18n.__('Sent_from', { lng })}: ${host} \n`);
		}
		msg = msg.concat(`${TAPi18n.__('Visitor_Name', { lng })}: ${name} \n`);
		msg = msg.concat(`${TAPi18n.__('Visitor_Email', { lng })}: ${email} \n`);
		if (departmentName) {
			msg = msg.concat(`${TAPi18n.__('Department', { lng })}: ${departmentName} \n`);
		}
		msg = msg.concat(`${TAPi18n.__('Message', { lng })}: ${text} \n`);

		const message = {
			rid: room._id,
			msg,
			groupable: false,
		};

		await sendMessage(user, message, room, true);
	},
	callbacks.priority.MEDIUM,
	'livechat-send-email-offline-message-to-channel',
);
