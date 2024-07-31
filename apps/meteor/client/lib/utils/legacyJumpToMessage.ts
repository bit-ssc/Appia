import type { IMessage } from '@rocket.chat/core-typings';
import { isThreadMessage } from '@rocket.chat/core-typings';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { goToRoomById } from './goToRoomById';
import { ChatRoom } from '../../../app/models/client';
import { RoomHistoryManager } from '../../../app/ui-utils/client';
import { RoomManager } from '../RoomManager';

/** @deprecated */
export const legacyJumpToMessage = async (message: IMessage) => {
	if (matchMedia('(max-width: 500px)').matches) {
		(Template.instance() as any)?.tabBar?.close();
	}

	if (isThreadMessage(message) || message.tcount) {
		const { route, queryParams, params } = FlowRouter.current();

		if (params.tab === 'thread' && (params.context === message.tmid || params.context === message._id)) {
			return;
		}

		FlowRouter.go(
			route?.name ?? '/',
			{
				tab: 'thread',
				context: message.tmid || message._id,
				rid: message.rid,
				name: ChatRoom.findOne({ _id: message.rid })?.name ?? '',
			},
			{
				...queryParams,
				msg: message._id,
			},
		);
		return;
	}

	if (RoomManager.opened === message.rid) {
		RoomHistoryManager.getSurroundingMessages(message);
		return;
	}

	await goToRoomById(message.rid);

	setTimeout(() => {
		RoomHistoryManager.getSurroundingMessages(message);
	}, 400);
};
