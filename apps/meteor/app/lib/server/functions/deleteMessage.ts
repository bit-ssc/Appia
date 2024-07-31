import { Meteor } from 'meteor/meteor';
import type { IMessage, IUser } from '@rocket.chat/core-typings';
import { Messages, Rooms, Uploads } from '@rocket.chat/models';
import { api, Message } from '@rocket.chat/core-services';

import { FileUpload } from '../../../file-upload/server';
import { settings } from '../../../settings/server';
import { callbacks } from '../../../../lib/callbacks';
import { Apps } from '../../../../ee/server/apps';

export async function deleteMessage(message: IMessage, user: IUser): Promise<void> {
	const deletedMsg = await Messages.findOneById(message._id);
	const isThread = (deletedMsg?.tcount || 0) > 0;
	const keepHistory = settings.get('Message_KeepHistory') || isThread;
	const showDeletedStatus = settings.get('Message_ShowDeletedStatus') || isThread;
	const bridges = Apps?.isLoaded() && Apps.getBridges();

	if (deletedMsg && bridges) {
		const prevent = await bridges.getListenerBridge().messageEvent('IPreMessageDeletePrevent', deletedMsg);
		if (prevent) {
			throw new Meteor.Error('error-app-prevented-deleting', 'A Rocket.Chat App prevented the message deleting.');
		}
	}

	if (deletedMsg?.tmid) {
		await Messages.decreaseReplyCountById(deletedMsg.tmid, -1);
	}

	const files = (message.files || [message.file]).filter(Boolean); // Keep compatibility with old messages

	if (keepHistory) {
		if (showDeletedStatus) {
			// TODO is there a better way to tell TS "IUser[username]" is not undefined?
			await Messages.cloneAndSaveAsHistoryById(message._id, user as Required<Pick<IUser, '_id' | 'username' | 'name'>>);
		} else {
			await Messages.setHiddenById(message._id, true);
		}

		for await (const file of files) {
			file?._id && (await Uploads.updateOne({ _id: file._id }, { $set: { _hidden: true } }));
		}
	} else {
		if (!showDeletedStatus) {
			await Messages.removeById(message._id);
		}

		for await (const file of files) {
			file?._id && (await FileUpload.getStore('Uploads').deleteById(file._id));
		}
	}

	const room = await Rooms.findOneById(message.rid, { projection: { lastMessage: 1, prid: 1, mid: 1, federated: 1 } });
	callbacks.run('afterDeleteMessage', deletedMsg, room);

	// update last message
	if (settings.get('Store_Last_Message')) {
		if (!room?.lastMessage || room.lastMessage._id === message._id) {
			await Rooms.resetLastMessageById(message.rid, deletedMsg);
		}
	}

	// decrease message count
	await Rooms.decreaseMessageCountById(message.rid, 1);

	if (showDeletedStatus) {
		// TODO is there a better way to tell TS "IUser[username]" is not undefined?
		await Messages.setAsDeletedByIdAndUser(message._id, user as Required<Pick<IUser, '_id' | 'username' | 'name'>>);
	} else {
		void api.broadcast('notify.deleteMessage', message.rid, { _id: message._id });
	}

	if (bridges) {
		void bridges.getListenerBridge().messageEvent('IPostMessageDeleted', deletedMsg, user);
	}
	const msg = user.name || user.username || '';
	await Message.saveSystemMessage('rollback-message', message.rid, msg, user, { delMsgId: message._id });
}
