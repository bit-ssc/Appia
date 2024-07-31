import { Meteor } from 'meteor/meteor';
import { Integrations, Rooms, Subscriptions } from '@rocket.chat/models';
import { isRoomFederated } from '@rocket.chat/core-typings';
import { Message } from '@rocket.chat/core-services';

import { getValidRoomName } from '../../../utils/server';
import { callbacks } from '../../../../lib/callbacks';
import { checkUsernameAvailability } from '../../../lib/server/functions/checkUsernameAvailability';
import { roomCoordinator } from '../../../../server/lib/rooms/roomCoordinator';

const updateFName = async (rid, displayName) => {
	return Promise.all([Rooms.setFnameById(rid, displayName), Subscriptions.updateFnameByRoomId(rid, displayName)]);
};

const updateRoomName = async (rid, displayName) => {
	const slugifiedRoomName = await getValidRoomName(displayName, rid);

	// Check if the username is available
	if (!(await checkUsernameAvailability(slugifiedRoomName))) {
		throw new Meteor.Error('error-duplicate-handle', `A room, team or user with name '${slugifiedRoomName}' already exists`, {
			function: 'RocketChat.updateRoomName',
			handle: slugifiedRoomName,
		});
	}

	return Promise.all([
		Rooms.setNameById(rid, slugifiedRoomName, displayName),
		Subscriptions.updateNameAndAlertByRoomId(rid, slugifiedRoomName, displayName),
	]);
};

export async function saveRoomName(rid, displayName, user, sendMessage = true) {
	const room = await Rooms.findOneById(rid);
	if (roomCoordinator.getRoomDirectives(room.t).preventRenaming()) {
		throw new Meteor.Error('error-not-allowed', 'Not allowed', {
			function: 'RocketChat.saveRoomdisplayName',
		});
	}
	console.log(`saveRoomName rid:${rid} user:`, user);
	const opSubscriptions = await Subscriptions.findOneByRoomIdAndUsername(rid, user.username);
	if (!opSubscriptions || !opSubscriptions.roles) {
		throw new Meteor.Error('invalid-room', 'Invalid room', {
			function: 'RocketChat.saveRoomName',
		});
	}
	if (opSubscriptions.roles) {
		if (!opSubscriptions.roles.includes('owner') && !opSubscriptions.roles.includes('moderator')) {
			throw new Meteor.Error('invalid-room', 'Invalid room', {
				function: 'RocketChat.saveRoomName',
			});
		}
	}
	if (displayName === room.name || displayName === room.fname) {
		return;
	}
	const isDiscussion = Boolean(room && room.prid);
	let update;

	if (isDiscussion || isRoomFederated(room)) {
		update = await updateFName(rid, displayName);
	} else {
		update = await updateRoomName(rid, displayName);
	}

	if (!update) {
		return;
	}

	await Integrations.updateRoomName(room.name, displayName);
	if (sendMessage) {
		await Message.saveSystemMessage('r', rid, displayName, user);
	}
	callbacks.run('afterRoomNameChange', { rid, name: displayName, oldName: room.name });
	return displayName;
}
