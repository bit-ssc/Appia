import type { IOmnichannelRoom } from '@rocket.chat/core-typings';
import { LivechatRooms } from '@rocket.chat/models';

import { callbacks } from '../../../../../lib/callbacks';
import { settings } from '../../../../../app/settings/server';
import { cbLogger } from '../lib/logger';

settings.watch('Livechat_abandoned_rooms_action', (value) => {
	if (!value || value === 'none') {
		callbacks.remove('livechat:afterReturnRoomAsInquiry', 'livechat-after-return-room-as-inquiry');
		return;
	}
	callbacks.add(
		'livechat:afterReturnRoomAsInquiry',
		({ room }: { room: IOmnichannelRoom }) => {
			if (!room?._id || !room?.omnichannel?.predictedVisitorAbandonmentAt) {
				cbLogger.debug('Skipping callback. No room or no visitor abandonment info');
				return;
			}

			return LivechatRooms.unsetPredictedVisitorAbandonmentByRoomId(room._id);
		},
		callbacks.priority.HIGH,
		'livechat-after-return-room-as-inquiry',
	);
});
