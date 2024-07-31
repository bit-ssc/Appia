import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
// import jQuery from 'jquery';

import './forwardMessageList.html';

Meteor.startup(() => {
	Template.forwardMessageList.onCreated(function () {
		this.user = this.data.user;
		this.messages = this.data.messages;
		this.settings = this.data.settings;
		this.room = this.data.room;
		this.subscription = this.data.subscription;
	});
});
