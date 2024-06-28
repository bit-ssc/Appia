import type { AtLeast, IMessage, IRoom, ISubscription } from '@rocket.chat/core-typings';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import { e2e } from '../../app/e2e/client/rocketchat.e2e';
import { Subscriptions, ChatRoom } from '../../app/models/client';
import { Notifications } from '../../app/notifications/client';
import { settings } from '../../app/settings/client';
import { onClientBeforeSendMessage } from '../lib/onClientBeforeSendMessage';
import { onClientMessageReceived } from '../lib/onClientMessageReceived';
import { isLayoutEmbedded } from '../lib/utils/isLayoutEmbedded';
import { waitUntilFind } from '../lib/utils/waitUntilFind';

const handle = async (roomId: IRoom['_id'], keyId: string): Promise<void> => {
	const e2eRoom = await e2e.getInstanceByRoomId(roomId);
	if (!e2eRoom) {
		return;
	}

	e2eRoom.provideKeyToUser(keyId);
};

Meteor.startup(() => {
	Tracker.autorun(() => {
		if (!Meteor.userId()) {
			return;
		}

		const adminEmbedded = isLayoutEmbedded() && FlowRouter.current().path.startsWith('/admin');

		if (!adminEmbedded && settings.get('E2E_Enable') && window.crypto) {
			e2e.startClient();
			e2e.enabled.set(true);
		} else {
			e2e.enabled.set(false);
			e2e.closeAlert();
		}
	});

	let observable: Meteor.LiveQueryHandle | null = null;
	let offClientMessageReceived: undefined | (() => void);
	let offClientBeforeSendMessage: undefined | (() => void);
	Tracker.autorun(() => {
		if (!e2e.isReady()) {
			offClientMessageReceived?.();
			Notifications.unUser('e2ekeyRequest', handle);
			observable?.stop();
			offClientBeforeSendMessage?.();
			return;
		}

		Notifications.onUser('e2ekeyRequest', handle);

		observable = Subscriptions.find().observe({
			changed: async (sub: ISubscription) => {
				Meteor.defer(async () => {
					if (!sub.encrypted && !sub.E2EKey) {
						e2e.removeInstanceByRoomId(sub.rid);
						return;
					}

					const e2eRoom = await e2e.getInstanceByRoomId(sub.rid);
					if (!e2eRoom) {
						return;
					}

					if (sub.E2ESuggestedKey) {
						if (await e2eRoom.importGroupKey(sub.E2ESuggestedKey)) {
							e2e.acceptSuggestedKey(sub.rid);
						} else {
							console.warn('Invalid E2ESuggestedKey, rejecting', sub.E2ESuggestedKey);
							e2e.rejectSuggestedKey(sub.rid);
						}
					}

					sub.encrypted ? e2eRoom.resume() : e2eRoom.pause();

					// Cover private groups and direct messages
					if (!e2eRoom.isSupportedRoomType(sub.t)) {
						e2eRoom.disable();
						return;
					}

					if (sub.E2EKey && e2eRoom.isWaitingKeys()) {
						e2eRoom.keyReceived();
						return;
					}

					if (!e2eRoom.isReady()) {
						return;
					}

					e2eRoom.decryptSubscription();
				});
			},
			added: async (sub: ISubscription) => {
				Meteor.defer(async () => {
					if (!sub.encrypted && !sub.E2EKey) {
						return;
					}
					return e2e.getInstanceByRoomId(sub.rid);
				});
			},
			removed: (sub: ISubscription) => {
				e2e.removeInstanceByRoomId(sub.rid);
			},
		});

		offClientMessageReceived = onClientMessageReceived.use(async (msg: IMessage) => {
			const e2eRoom = await e2e.getInstanceByRoomId(msg.rid);
			if (!e2eRoom?.shouldConvertReceivedMessages()) {
				return msg;
			}
			return e2e.decryptMessage(msg);
		});

		// Encrypt messages before sending
		offClientBeforeSendMessage = onClientBeforeSendMessage.use(async (message: AtLeast<IMessage, '_id' | 'rid' | 'msg'>) => {
			const e2eRoom = await e2e.getInstanceByRoomId(message.rid);

			if (!e2eRoom) {
				return message;
			}

			const subscription = await waitUntilFind(() => ChatRoom.findOne({ _id: message.rid }));

			subscription.encrypted ? e2eRoom.resume() : e2eRoom.pause();

			const shouldConvertSentMessages = await e2eRoom.shouldConvertSentMessages(message);

			if (!shouldConvertSentMessages) {
				return message;
			}

			// Should encrypt this message.
			const msg = await e2eRoom.encrypt(message);

			message.msg = msg;
			message.t = 'e2e';
			message.e2e = 'pending';
			return message;
		});
	});
});
