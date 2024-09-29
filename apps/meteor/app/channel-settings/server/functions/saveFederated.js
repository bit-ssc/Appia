import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { Rooms, Users, MatrixBridgedRoom, Subscriptions } from '@rocket.chat/models';

import { callbacks } from '../../../../lib/callbacks';

export const saveFederated = async function (rid, federated, user) {
	if (!Match.test(rid, String)) {
		throw new Meteor.Error('invalid-room', 'Invalid room', {
			function: 'RocketChat.saveFederated',
		});
	}
	console.log(`saveFederated rid:${rid} user:`, user);
	const opSubscriptions = await Subscriptions.findOneByRoomIdAndUsername(rid, user.username);
	if (!opSubscriptions || !opSubscriptions.roles) {
		console.log(`saveFederated error. rid:${rid} federated:${federated}`);
		throw new Meteor.Error('invalid-room', 'Invalid room', {
			function: 'RocketChat.saveFederated',
		});
	}
	if (opSubscriptions.roles) {
		if (!opSubscriptions.roles.includes('owner') && !opSubscriptions.roles.includes('moderator')) {
			throw new Meteor.Error('invalid-room', 'Invalid room', {
				function: 'RocketChat.saveFederated',
			});
		}
	}
	console.log(`saveFederated rid:${rid} federated:${federated}`);
	const room = await Rooms.findOneById(rid);
	if (room == null) {
		throw new Meteor.Error('error-invalid-room', 'error-invalid-room', {
			function: 'RocketChat.saveFederated',
			_id: rid,
		});
	}

	const result = await Rooms.setFederatedStatus(rid, federated);
	room.federated = federated;
	if (federated) {
		const externalRoomId = await MatrixBridgedRoom.getExternalRoomId(rid);
		console.log(`MatrixBridgedRoom getExternalRoomId rid:${rid} externalRoomId:${externalRoomId}`);
		if (!externalRoomId) {
			console.log(`federation.afterCreateFederatedRoom rid:${rid} uid:${room.u._id}`);
			const owner = await Users.findOneById(room.u._id);

			const subscriptions = await Subscriptions.findByRoomId(rid, {
				projection: { 'u.username': 1 },
			});
			// const members = (await subscriptions.toArray()).filter((s) => s.u?.username !== owner.username).map((s) => s.u?.username);
			const members = (await subscriptions.toArray()).map((s) => s.u?.username);
			console.log('member exist in room. members:', members);
			callbacks.runAsync('federation.afterCreateFederatedRoom', room, {
				owner,
				originalMemberList: members,
			});
		}
	}
	return result;
};
