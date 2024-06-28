import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import type { UpdateResult } from 'mongodb';
import type { IUser } from '@rocket.chat/core-typings';
import { isRegisterUser } from '@rocket.chat/core-typings';
import { Rooms } from '@rocket.chat/models';
import { Message } from '@rocket.chat/core-services';

export const saveRoomEncrypted = async function (rid: string, encrypted: boolean, user: IUser, sendMessage = true): Promise<UpdateResult> {
	if (!Match.test(rid, String)) {
		throw new Meteor.Error('invalid-room', 'Invalid room', {
			function: 'RocketChat.saveRoomEncrypted',
		});
	}

	if (!isRegisterUser(user)) {
		throw new Meteor.Error('invalid-user', 'Invalid user', {
			function: 'RocketChat.saveRoomEncrypted',
		});
	}

	const update = await Rooms.saveEncryptedById(rid, encrypted);
	if (update && sendMessage) {
		const type = encrypted ? 'room_e2e_enabled' : 'room_e2e_disabled';

		await Message.saveSystemMessage(type, rid, user.username, user);
	}
	return update;
};
