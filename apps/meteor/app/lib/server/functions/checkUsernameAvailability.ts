import { Meteor } from 'meteor/meteor';
import _ from 'underscore';
import { escapeRegExp } from '@rocket.chat/string-helpers';
import { Team } from '@rocket.chat/core-services';
import { Users } from '@rocket.chat/models';

import { settings } from '../../../settings/server';
import { validateName } from './validateName';

let usernameBlackList: RegExp[] = [];

const toRegExp = (username: string): RegExp => new RegExp(`^${escapeRegExp(username).trim()}$`, 'i');

settings.watch('Accounts_BlockedUsernameList', (value: string) => {
	usernameBlackList = ['all', 'here'].concat(value.split(',')).map(toRegExp);
});

const usernameIsBlocked = (username: string, usernameBlackList: RegExp[]): boolean | number =>
	usernameBlackList.length && usernameBlackList.some((restrictedUsername) => restrictedUsername.test(escapeRegExp(username).trim()));

export const checkUsernameAvailability = async function (username: string): Promise<boolean> {
	if (usernameIsBlocked(username, usernameBlackList) || !validateName(username)) {
		throw new Meteor.Error('error-blocked-username', `${_.escape(username)} is blocked and can't be used!`, {
			method: 'checkUsernameAvailability',
			field: username,
		});
	}

	// Make sure no users are using this username
	const existingUser = await Users.findOne(
		{
			username: toRegExp(username),
		},
		{ projection: { _id: 1 } },
	);
	if (existingUser) {
		return false;
	}

	// Make sure no teams are using this username
	const existingTeam = await Team.getOneByName(toRegExp(username), { projection: { _id: 1 } });
	if (existingTeam) {
		return false;
	}

	return true;
};
