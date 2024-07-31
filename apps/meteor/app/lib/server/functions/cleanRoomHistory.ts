import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import type { IRoom } from '@rocket.chat/core-typings';
import { api } from '@rocket.chat/core-services';
import { Messages, Rooms, Subscriptions } from '@rocket.chat/models';

import { deleteRoom } from './deleteRoom';
import { FileUpload } from '../../../file-upload/server';

export async function cleanRoomHistory({
	rid = '',
	latest = new Date(),
	oldest = new Date('0001-01-01T00:00:00Z'),
	inclusive = true,
	limit = 0,
	excludePinned = true,
	ignoreDiscussion = true,
	filesOnly = false,
	fromUsers = [],
	ignoreThreads = true,
}: {
	rid?: IRoom['_id'];
	latest?: Date;
	oldest?: Date;
	inclusive?: boolean;
	limit?: number;
	excludePinned?: boolean;
	ignoreDiscussion?: boolean;
	filesOnly?: boolean;
	fromUsers?: string[];
	ignoreThreads?: boolean;
}): Promise<number> {
	const gt = inclusive ? '$gte' : '$gt';
	const lt = inclusive ? '$lte' : '$lt';

	const ts = { [gt]: oldest, [lt]: latest };

	const text = `_${TAPi18n.__('File_removed_by_prune')}_`;

	let fileCount = 0;

	const cursor = Messages.findFilesByRoomIdPinnedTimestampAndUsers(rid, excludePinned, ignoreDiscussion, ts, fromUsers, ignoreThreads, {
		projection: { pinned: 1, files: 1 },
		limit,
	});

	for await (const document of cursor) {
		const uploadsStore = FileUpload.getStore('Uploads');

		document.files && (await Promise.all(document.files.map((file) => uploadsStore.deleteById(file._id))));

		fileCount++;
		if (filesOnly) {
			await Messages.updateOne({ _id: document._id }, { $unset: { file: 1 }, $set: { attachments: [{ color: '#FD745E', text }] } });
		}
	}

	if (filesOnly) {
		return fileCount;
	}

	if (!ignoreDiscussion) {
		const discussionsCursor = Messages.findDiscussionByRoomIdPinnedTimestampAndUsers(rid, excludePinned, ts, fromUsers, {
			projection: { drid: 1 },
			...(limit && { limit }),
		});

		for await (const { drid } of discussionsCursor) {
			if (!drid) {
				continue;
			}
			await deleteRoom(drid);
		}
	}

	if (!ignoreThreads) {
		const threads = new Set<string>();
		await Messages.findThreadsByRoomIdPinnedTimestampAndUsers(
			{ rid, pinned: excludePinned, ignoreDiscussion, ts, users: fromUsers },
			{ projection: { _id: 1 } },
		).forEach(({ _id }) => {
			threads.add(_id);
		});

		if (threads.size > 0) {
			await Subscriptions.removeUnreadThreadsByRoomId(rid, [...threads]);
		}
	}

	const count = await Messages.removeByIdPinnedTimestampLimitAndUsers(
		rid,
		excludePinned,
		ignoreDiscussion,
		ts,
		limit,
		fromUsers,
		ignoreThreads,
	);
	if (count) {
		const lastMessage = await Messages.getLastVisibleMessageSentWithNoTypeByRoomId(rid);
		await Rooms.resetLastMessageById(rid, lastMessage);
		void api.broadcast('notify.deleteMessageBulk', rid, {
			rid,
			excludePinned,
			ignoreDiscussion,
			ts,
			users: fromUsers,
		});
	}
	return count;
}
