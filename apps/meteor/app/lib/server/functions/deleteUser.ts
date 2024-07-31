import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import {
	Integrations,
	FederationServers,
	LivechatVisitors,
	LivechatDepartmentAgents,
	Messages,
	Rooms,
	Subscriptions,
	Users,
	LivechatUnitMonitors,
} from '@rocket.chat/models';
import { api } from '@rocket.chat/core-services';

import { FileUpload } from '../../../file-upload/server';
import { settings } from '../../../settings/server';
import { updateGroupDMsName } from './updateGroupDMsName';
import { relinquishRoomOwnerships } from './relinquishRoomOwnerships';
import { getSubscribedRoomsForUserWithDetails, shouldRemoveOrChangeOwner } from './getRoomsWithSingleOwner';
import { getUserSingleOwnedRooms } from './getUserSingleOwnedRooms';

export async function deleteUser(userId: string, confirmRelinquish = false): Promise<void> {
	const user = await Users.findOneById(userId, {
		projection: { username: 1, avatarOrigin: 1, roles: 1, federated: 1 },
	});

	if (!user) {
		return;
	}

	const subscribedRooms = await getSubscribedRoomsForUserWithDetails(userId);

	if (shouldRemoveOrChangeOwner(subscribedRooms) && !confirmRelinquish) {
		const rooms = await getUserSingleOwnedRooms(subscribedRooms);
		throw new Meteor.Error('user-last-owner', '', rooms);
	}

	// Users without username can't do anything, so there is nothing to remove
	if (user.username != null) {
		await relinquishRoomOwnerships(userId, subscribedRooms);

		const messageErasureType = settings.get('Message_ErasureType');
		switch (messageErasureType) {
			case 'Delete':
				const store = FileUpload.getStore('Uploads');
				const cursor = Messages.findFilesByUserId(userId);

				for await (const { file } of cursor) {
					if (!file) {
						continue;
					}
					await store.deleteById(file._id);
				}

				await Messages.removeByUserId(userId);
				break;
			case 'Unlink':
				const rocketCat = await Users.findOneById('rocket.cat');
				const nameAlias = TAPi18n.__('Removed_User');
				if (!rocketCat?._id || !rocketCat?.username) {
					break;
				}
				await Messages.unlinkUserId(userId, rocketCat?._id, rocketCat?.username, nameAlias);
				break;
		}

		await Rooms.updateGroupDMsRemovingUsernamesByUsername(user.username, userId); // Remove direct rooms with the user
		await Rooms.removeDirectRoomContainingUsername(user.username); // Remove direct rooms with the user

		await Subscriptions.removeByUserId(userId); // Remove user subscriptions

		if (user.roles.includes('livechat-agent')) {
			// Remove user as livechat agent
			await LivechatDepartmentAgents.removeByAgentId(userId);
		}

		if (user.roles.includes('livechat-monitor')) {
			// Remove user as Unit Monitor
			await LivechatUnitMonitors.removeByMonitorId(userId);
		}

		// This is for compatibility. Since we allowed any user to be contact manager b4, we need to have the same logic
		// for deletion.
		await LivechatVisitors.removeContactManagerByUsername(user.username);

		// removes user's avatar
		if (user.avatarOrigin === 'upload' || user.avatarOrigin === 'url' || user.avatarOrigin === 'rest') {
			await FileUpload.getStore('Avatars').deleteByName(user.username);
		}

		await Integrations.disableByUserId(userId); // Disables all the integrations which rely on the user being deleted.

		// Don't broadcast user.deleted for Erasure Type of 'Keep' so that messages don't disappear from logged in sessions
		if (messageErasureType !== 'Keep') {
			void api.broadcast('user.deleted', user);
		}
	}

	// Remove user from users database
	await Users.removeById(userId);

	// update name and fname of group direct messages
	await updateGroupDMsName(user);

	// Refresh the servers list
	await FederationServers.refreshServers();
}
