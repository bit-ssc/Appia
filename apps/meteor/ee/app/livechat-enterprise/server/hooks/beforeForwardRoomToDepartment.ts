import { Meteor } from 'meteor/meteor';
import { LivechatDepartment } from '@rocket.chat/models';

import { callbacks } from '../../../../../lib/callbacks';
import { cbLogger } from '../lib/logger';

callbacks.add(
	'livechat.beforeForwardRoomToDepartment',
	async (options) => {
		const { room, transferData } = options;
		if (!room || !transferData) {
			cbLogger.debug('Skipping callback. No room provided');
			return options;
		}
		const { departmentId } = room;
		if (!departmentId) {
			cbLogger.debug('Skipping callback. No department provided');
			return options;
		}
		const { department: departmentToTransfer } = transferData;
		const currentDepartment = await LivechatDepartment.findOneById(departmentId);
		if (!currentDepartment) {
			cbLogger.debug('Skipping callback. Current department does not exists');
			return options;
		}
		const { departmentsAllowedToForward } = currentDepartment;
		const isAllowedToTransfer =
			!departmentsAllowedToForward?.length ||
			(Array.isArray(departmentsAllowedToForward) && departmentsAllowedToForward.includes(departmentToTransfer._id));
		if (isAllowedToTransfer) {
			cbLogger.debug(`Callback success. Room ${room._id} can be forwarded to department ${departmentToTransfer._id}`);
			return options;
		}
		throw new Meteor.Error('error-forwarding-department-target-not-allowed', 'The forwarding to the target department is not allowed.');
	},
	callbacks.priority.HIGH,
	'livechat-before-forward-room-to-department',
);
