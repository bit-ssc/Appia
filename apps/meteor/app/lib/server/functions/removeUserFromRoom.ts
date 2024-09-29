/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppsEngineException } from '@rocket.chat/apps-engine/definition/exceptions';
import { Meteor } from 'meteor/meteor';
import type { IUser } from '@rocket.chat/core-typings';
import { Message, Team } from '@rocket.chat/core-services';
import { Subscriptions, Rooms } from '@rocket.chat/models';

import { AppEvents, Apps } from '../../../../ee/server/apps';
import { callbacks } from '../../../../lib/callbacks';
import { getOrgByMatrixDomain } from '../../../api/server/lib/external-channel-common';
import { company } from '../../../api/server/v1/appia/config';

export const removeUserFromRoom = async function (
	rid: string,
	user: IUser,
	options?: { byUser: Pick<IUser, '_id' | 'username'> },
): Promise<void> {
	const room = await Rooms.findOneById(rid);

	if (!room) {
		return;
	}

	try {
		await Apps.triggerEvent(AppEvents.IPreRoomUserLeave, room, user);
	} catch (error: any) {
		if (error.name === AppsEngineException.name) {
			throw new Meteor.Error('error-app-prevented', error.message);
		}

		throw error;
	}

	callbacks.run('beforeLeaveRoom', user, room);

	const subscription = await Subscriptions.findOneByRoomIdAndUserId(rid, user._id, {
		projection: { _id: 1 },
	});

	if (subscription) {
		const removedUser = user;
		if (options?.byUser) {
			const extraData = {
				u: options.byUser,
			};

			if (room.teamMain) {
				await Message.saveSystemMessage('removed-user-from-team', rid, user.username || '', user, extraData);
			} else {
				await Message.saveSystemMessage('ru', rid, user.name || '', user, extraData);
			}
		} else if (room.teamMain) {
			await Message.saveSystemMessage('ult', rid, removedUser.username || '', removedUser);
		} else {
			await Message.saveSystemMessage('ul', rid, removedUser.username || '', removedUser);
		}
	}

	if (room.t === 'l') {
		await Message.saveSystemMessage('command', rid, 'survey', user);
	}

	await Subscriptions.removeByRoomIdAndUserId(rid, user._id);
	// if (user.username.includes(':')) {
	// 	const params = {
	// 		method: 'kick_user_from_room',
	// 		username: user.username,
	// 	};
	// 	saveRoomSettings(rid, params);
	// }
	if (room.teamId && room.teamMain) {
		await Team.removeMember(room.teamId, user._id);
	}

	// TODO: CACHE: maybe a queue?
	// callbacks.run('afterLeaveRoom', user, room);
	console.log(`team afterLeaveRoom roomId:${room._id} federated:${room.federated} options:`, options);
	if (room.federated) {
		Meteor.defer(function () {
			if (options && options?.byUser) {
				console.log('team start afterLeaveRoom byUser:', options?.byUser);
				console.log(`team start afterLeaveRoom user:`, user);
				if (options?.byUser.username.includes(':')) {
					const usernameArr = options?.byUser.username.split(':');
					if (company.toLowerCase() !== getOrgByMatrixDomain(usernameArr[1])) {
						callbacks.run('afterLeaveRoom', user, room);
					} else {
						callbacks.run('afterRemoveFromRoom', { removedUser: user, userWhoRemoved: options?.byUser }, room);
					}
				} else {
					callbacks.run('afterRemoveFromRoom', { removedUser: user, userWhoRemoved: options?.byUser }, room);
				}
				// callbacks.run('afterRemoveFromRoom', { removedUser: user, userWhoRemoved: options?.byUser }, room);
				// callbacks.run('afterRemoveFromRoom', { removedUser: user, userWhoRemoved: user }, room);
			}
		});
	}
	await Apps.triggerEvent(AppEvents.IPostRoomUserLeave, room, user);
};
