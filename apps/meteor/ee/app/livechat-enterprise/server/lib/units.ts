import { Meteor } from 'meteor/meteor';
import mem from 'mem';
import { LivechatUnit } from '@rocket.chat/models';

async function hasUnits(): Promise<boolean> {
	// @ts-expect-error - this prop is injected dynamically on ee license
	return (await LivechatUnit.countUnits({ type: 'u' })) > 0;
}

// Units should't change really often, so we can cache the result
const memoizedHasUnits = mem(hasUnits, { maxAge: 5000 });

export async function getUnitsFromUser(): Promise<{ [k: string]: any }[] | undefined> {
	if (!(await memoizedHasUnits())) {
		return;
	}

	return Meteor.callAsync('livechat:getUnitsFromUser');
}
