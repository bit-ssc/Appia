import { Meteor } from 'meteor/meteor';
import type { IMessage, RequiredField } from '@rocket.chat/core-typings';

import { slashCommands } from '../../utils/lib/slashCommand';
/*
 * Gimme is a named function that will replace /gimme commands
 * @param {Object} message - The message object
 */

async function Gimme(_command: 'gimme', params: string, item: RequiredField<Partial<IMessage>, 'rid'>): Promise<void> {
	const msg = item;
	msg.msg = `༼ つ ◕_◕ ༽つ ${params}`;
	await Meteor.callAsync('sendMessage', msg);
}

slashCommands.add({
	command: 'gimme',
	callback: Gimme,
	options: {
		description: 'Slash_Gimme_Description',
		params: 'your_message_optional',
	},
});
