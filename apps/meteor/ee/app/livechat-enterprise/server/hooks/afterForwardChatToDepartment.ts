import { LivechatRooms, LivechatDepartment } from '@rocket.chat/models';

import { callbacks } from '../../../../../lib/callbacks';
import { cbLogger } from '../lib/logger';

callbacks.add(
	'livechat.afterForwardChatToDepartment',
	async (options) => {
		const { rid, newDepartmentId } = options;

		const room = await LivechatRooms.findOneById(rid);
		if (!room) {
			cbLogger.debug('Skipping callback. No room found');
			return options;
		}
		await LivechatRooms.unsetPredictedVisitorAbandonmentByRoomId(room._id);

		const department = await LivechatDepartment.findOneById(newDepartmentId, {
			projection: { ancestors: 1 },
		});
		if (!department) {
			cbLogger.debug('Skipping callback. No department found');
			return options;
		}

		const { departmentAncestors } = room;
		const { ancestors } = department;
		if (!ancestors && !departmentAncestors) {
			cbLogger.debug('Skipping callback. No ancestors found for department');
			return options;
		}

		cbLogger.debug(`Updating department ${newDepartmentId} ancestors for room ${rid}`);
		await LivechatRooms.updateDepartmentAncestorsById(room._id, ancestors);

		return options;
	},
	callbacks.priority.MEDIUM,
	'livechat-after-forward-room-to-department',
);
