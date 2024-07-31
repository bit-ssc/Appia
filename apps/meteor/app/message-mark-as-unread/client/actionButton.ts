import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { LegacyRoomManager, MessageAction } from '../../ui-utils/client';
import { messageArgs } from '../../../client/lib/utils/messageArgs';
import { ChatSubscription } from '../../models/client';
import { roomCoordinator } from '../../../client/lib/rooms/roomCoordinator';
import { dispatchToastMessage } from '../../../client/lib/toast';

Meteor.startup(() => {
	MessageAction.addButton({
		id: 'mark-message-as-unread',
		icon: 'flag',
		label: 'Mark_unread',
		context: ['message', 'message-mobile', 'threads'],
		action(_, props) {
			const { message = messageArgs(this).msg } = props;
			return Meteor.call('unreadMessages', message, async function (error: unknown) {
				if (error) {
					dispatchToastMessage({ type: 'error', message: error });
					return;
				}
				const subscription = ChatSubscription.findOne({
					rid: message.rid,
				});
				if (subscription == null) {
					return;
				}
				await LegacyRoomManager.close(subscription.t + subscription.name);
				return FlowRouter.go('home');
			});
		},
		condition({ message, user, room }) {
			const isLivechatRoom = roomCoordinator.isLivechatRoom(room.t);
			if (isLivechatRoom) {
				return false;
			}

			if (!user) {
				return false;
			}

			return message.u._id !== user._id;
		},
		order: 10,
		group: 'menu',
	});
});
