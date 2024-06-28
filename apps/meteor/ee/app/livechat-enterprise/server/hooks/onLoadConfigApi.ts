import { callbacks } from '../../../../../lib/callbacks';
import { getLivechatQueueInfo, getLivechatCustomFields } from '../lib/Helper';

callbacks.add(
	'livechat.onLoadConfigApi',
	async (options) => {
		const { room } = options;

		const queueInfo = await getLivechatQueueInfo(room);
		const customFields = await getLivechatCustomFields();

		return {
			...(queueInfo && { queueInfo }),
			...(customFields && { customFields }),
			...options,
		};
	},
	callbacks.priority.MEDIUM,
	'livechat-on-load-config-api',
);
