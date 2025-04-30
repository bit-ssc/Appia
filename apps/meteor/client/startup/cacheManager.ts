import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
	Tracker.autorun(() => {
		if (window.location.hostname !== 'sophgo.appia.cn') {
			return;
		}
		const userId = Meteor.userId();
		const users = ['zXmKAAdbvp9w7Sebe'];
		if (userId && users.includes(userId)) {
			const clearCache = localStorage.getItem('clearCache');
			if (clearCache !== '1') {
				deleteDatabase();
			}
		}
	});
});
const deleteDatabase = () => {
	console.info('deleteDatabase========', indexedDB);
	indexedDB.deleteDatabase('MeteorDynamicImportCache');
	console.info('deleteDatabase========2');
	localStorage.setItem('clearCache', '1');
	location.reload();
};
