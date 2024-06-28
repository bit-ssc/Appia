import type { IRoom, ILivechatVisitor, ILivechatDepartment } from '@rocket.chat/core-typings';
import { LivechatDepartment } from '@rocket.chat/models';
import { Message } from '@rocket.chat/core-services';

import { callbacks } from '../../../../../lib/callbacks';
import { forwardRoomToDepartment } from '../../../../../app/livechat/server/lib/Helper';
import { cbLogger } from '../lib/logger';

const onTransferFailure = async ({
	room,
	guest,
	transferData,
}: {
	room: IRoom;
	guest: ILivechatVisitor;
	transferData: { [k: string]: string | any };
}) => {
	cbLogger.debug(`Attempting to transfer room ${room._id} using fallback departments`);
	const { departmentId } = transferData;
	const department = (await LivechatDepartment.findOneById(departmentId, {
		projection: { _id: 1, name: 1, fallbackForwardDepartment: 1 },
	})) as Partial<ILivechatDepartment>;

	if (!department?.fallbackForwardDepartment?.length) {
		return false;
	}

	cbLogger.debug(`Fallback department ${department.fallbackForwardDepartment} found for department ${department._id}. Redirecting`);
	const transferDataFallback = {
		...transferData,
		prevDepartment: department.name,
		departmentId: department.fallbackForwardDepartment,
		department: await LivechatDepartment.findOneById(department.fallbackForwardDepartment, {
			fields: { name: 1, _id: 1 },
		}),
	};

	const forwardSuccess = await forwardRoomToDepartment(room, guest, transferDataFallback);
	if (forwardSuccess) {
		const { _id, username } = transferData.transferredBy;
		// The property is injected dynamically on ee folder

		await Message.saveSystemMessage(
			'livechat_transfer_history_fallback',
			room._id,
			'',
			{ _id, username },
			{ transferData: transferDataFallback },
		);
	}

	return forwardSuccess;
};

callbacks.add('livechat:onTransferFailure', onTransferFailure, callbacks.priority.HIGH);
