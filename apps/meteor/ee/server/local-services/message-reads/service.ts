import { Messages, MessageReads, Subscriptions } from '@rocket.chat/models';
import { ServiceClassInternal } from '@rocket.chat/core-services';

import type { IMessageReadsService } from '../../sdk/types/IMessageReadsService';
import { ReadReceipt } from '../../lib/message-read-receipt/ReadReceipt';
import { MAX_ROOM_SIZE_CHECK_INDIVIDUAL_READ_RECEIPTS } from '../../lib/constants';

export class MessageReadsService extends ServiceClassInternal implements IMessageReadsService {
	protected name = 'message-reads';

	async readThread(userId: string, tmid: string): Promise<void> {
		const read = await MessageReads.findOneByUserIdAndThreadId(userId, tmid);

		const threadMessage = await Messages.findOneById(tmid, { projection: { ts: 1, tlm: 1, rid: 1 } });
		if (!threadMessage?.tlm) {
			return;
		}

		await MessageReads.updateReadTimestampByUserIdAndThreadId(userId, tmid);
		await ReadReceipt.storeThreadMessagesReadReceipts(tmid, userId, read?.ls || threadMessage.ts);

		// doesn't mark as read if not all room members have read the thread
		const membersCount = await Subscriptions.countUnarchivedByRoomId(threadMessage.rid);

		if (membersCount <= MAX_ROOM_SIZE_CHECK_INDIVIDUAL_READ_RECEIPTS) {
			const subscriptions = await Subscriptions.findUnarchivedByRoomId(threadMessage.rid, {
				projection: { 'u._id': 1 },
			}).toArray();
			const members = subscriptions.map((s) => s.u._id);

			const totalMessageReads = await MessageReads.countByThreadAndUserIds(tmid, members);
			if (totalMessageReads < membersCount) {
				return;
			}
		} else {
			// for large rooms, mark as read if there are as many reads as room members to improve performance (instead of checking each read)
			const totalMessageReads = await MessageReads.countByThreadId(tmid);
			if (totalMessageReads < membersCount) {
				return;
			}
		}

		const firstRead = await MessageReads.getMinimumLastSeenByThreadId(tmid);
		if (firstRead?.ls) {
			await Messages.setThreadMessagesAsRead(tmid, firstRead.ls);
		}
	}
}
