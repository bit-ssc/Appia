import { Meteor } from 'meteor/meteor';
import { Permissions } from '@rocket.chat/models';

Meteor.startup(async () => {
	if (!(await Permissions.findOne({ _id: 'auto-translate' }))) {
		await Permissions.create('auto-translate', ['admin']);
	}
});
