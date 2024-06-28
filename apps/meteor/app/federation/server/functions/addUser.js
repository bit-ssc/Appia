import { Meteor } from 'meteor/meteor';
import { FederationServers, Users } from '@rocket.chat/models';

import * as federationErrors from './errors';
import { getUserByUsername } from '../handler';

export async function addUser(query) {
	if (!Meteor.userId()) {
		throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'addUser' });
	}

	const user = await getUserByUsername(query);

	if (!user) {
		throw federationErrors.userNotFound(query);
	}

	let userId = user._id;

	try {
		console.log('federation create user:', user);
		// Create the local user
		userId = await Users.create(user);

		// Refresh the servers list
		await FederationServers.refreshServers();
	} catch (err) {
		// This might get called twice by the createDirectMessage method
		// so we need to handle the situation accordingly
		if (err.code !== 11000) {
			throw err;
		}
	}

	return Users.findOne({ _id: userId });
}
