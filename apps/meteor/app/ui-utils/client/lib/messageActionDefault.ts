// import { FlowRouter } from 'meteor/kadira:flow-router';
// import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import type { IMessage } from '@rocket.chat/core-typings';
import { isRoomFederated } from '@rocket.chat/core-typings';

// import ShareMessageModal from '../../../../client/views/room/modals/ShareMessageModal';
import { messageArgs } from '../../../../client/lib/utils/messageArgs';
import { roomCoordinator } from '../../../../client/lib/rooms/roomCoordinator';
// import { ChatRoom, Subscriptions } from '../../../models/client';
// import { hasAtLeastOnePermission, hasPermission } from '../../../authorization/client';
import { MessageAction } from './MessageAction';
import ForwardMessage from '../../../../client/components/ForwardMessage';
import { imperativeModal } from '../../../../client/lib/imperativeModal';
// import ReactionList from '../../../../client/views/room/modals/ReactionListModal';
// import ReportMessageModal from '../../../../client/views/room/modals/ReportMessageModal';
import { dispatchToastMessage } from '../../../../client/lib/toast';
import { selectedMessageStore } from '../../../../client/views/room/providers/SelectedMessagesProvider';

const getMainMessageText = (message: IMessage): IMessage => {
	const newMessage = { ...message };
	newMessage.msg = newMessage.msg || newMessage.attachments?.[0]?.description || newMessage.attachments?.[0]?.title || '';
	newMessage.md = newMessage.md || newMessage.attachments?.[0]?.descriptionMd || undefined;
	return { ...newMessage };
};

Meteor.startup(async function () {
	/**
	MessageAction.addButton({
		id: 'reply-directly',
		icon: 'reply-directly',
		label: 'Reply_in_direct_message',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		role: 'link',
		action(_, props) {
			const { message = messageArgs(this).msg } = props;
			roomCoordinator.openRouteLink(
				'd',
				{ name: message.u.username },
				{
					...FlowRouter.current().queryParams,
					reply: message._id,
				},
			);
		},
		condition({ subscription, room, message, user }) {
			if (subscription == null) {
				return false;
			}
			if (room.t === 'd' || room.t === 'l') {
				return false;
			}

			// Check if we already have a DM started with the message user (not ourselves) or we can start one
			if (!!user && user._id !== message.u._id && !hasPermission('create-d')) {
				const dmRoom = ChatRoom.findOne({ _id: [user._id, message.u._id].sort().join('') });
				if (!dmRoom || !Subscriptions.findOne({ 'rid': dmRoom._id, 'u._id': user._id })) {
					return false;
				}
			}

			return true;
		},
		order: 0,
		group: 'menu',
	});

	MessageAction.addButton({
		id: 'share-message',
		icon: 'arrow-forward',
		label: 'Share_Message',
		context: ['message', 'message-mobile', 'threads'],
		async action(_, props) {
			const { message = messageArgs(this).msg } = props;
			const permalink = await MessageAction.getPermaLink(message._id);
			imperativeModal.open({
				component: ShareMessageModal,
				props: {
					message,
					permalink,
					onClose: (): void => {
						imperativeModal.close();
					},
				},
			});
		},
		order: 0,
		group: ['message', 'menu'],
	});
	 */

	MessageAction.addButton({
		id: 'quote-message',
		icon: 'quote',
		label: 'Quote',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		async action(_, props) {
			const { message = messageArgs(this).msg, chat, autoTranslateOptions } = props;

			if (message && autoTranslateOptions?.autoTranslateEnabled && autoTranslateOptions.showAutoTranslate(message)) {
				message.msg =
					message.translations && autoTranslateOptions.autoTranslateLanguage
						? message.translations[autoTranslateOptions.autoTranslateLanguage]
						: message.msg;
			}

			await chat?.composer?.quoteMessage(message);
		},
		condition({ subscription }) {
			if (subscription == null) {
				return false;
			}

			return true;
		},
		order: -3,
		group: ['message', 'menu'],
	});

	/**
	MessageAction.addButton({
		id: 'permalink',
		icon: 'permalink',
		label: 'Get_link',
		// classes: 'clipboard',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		async action(_, props) {
			try {
				const { message = messageArgs(this).msg } = props;
				const permalink = await MessageAction.getPermaLink(message._id);
				await navigator.clipboard.writeText(permalink);
				dispatchToastMessage({ type: 'success', message: TAPi18n.__('Copied') });
			} catch (e) {
				dispatchToastMessage({ type: 'error', message: e });
			}
		},
		condition({ subscription }) {
			return !!subscription;
		},
		order: 4,
		group: 'menu',
	});
	 */

	MessageAction.addButton({
		id: 'copy',
		icon: 'copy',
		label: 'Copy',
		// classes: 'clipboard',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		async action(_, props) {
			const { message = messageArgs(this).msg } = props;
			const msgText = getMainMessageText(message).msg;
			await navigator.clipboard.writeText(msgText);
			dispatchToastMessage({ type: 'success', message: TAPi18n.__('Copied') });
		},
		condition({ subscription }) {
			return !!subscription;
		},
		order: 5,
		group: 'menu',
	});

	/**
	MessageAction.addButton({
		id: 'edit-message',
		icon: 'edit',
		label: 'Edit',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		async action(_, props) {
			const { message = messageArgs(this).msg, chat } = props;
			await chat?.messageEditing.editMessage(message);
		},
		condition({ message, subscription, settings, room }) {
			if (subscription == null) {
				return false;
			}
			if (isRoomFederated(room)) {
				return message.u._id === Meteor.userId();
			}
			const canEditMessage = hasAtLeastOnePermission('edit-message', message.rid);
			const isEditAllowed = settings.Message_AllowEditing;
			const editOwn = message.u && message.u._id === Meteor.userId();
			if (!(canEditMessage || (isEditAllowed && editOwn))) {
				return false;
			}
			const blockEditInMinutes = settings.Message_AllowEditing_BlockEditInMinutes as number;
			const bypassBlockTimeLimit = hasPermission('bypass-time-limit-edit-and-delete');

			if (!bypassBlockTimeLimit && blockEditInMinutes) {
				let msgTs;
				if (message.ts != null) {
					msgTs = moment(message.ts);
				}
				let currentTsDiff;
				if (msgTs != null) {
					currentTsDiff = moment().diff(msgTs, 'minutes');
				}
				return (!!currentTsDiff || currentTsDiff === 0) && currentTsDiff < blockEditInMinutes;
			}
			return true;
		},
		order: 6,
		group: 'menu',
	});
*/

	MessageAction.addButton({
		id: 'delete-message',
		icon: 'trash',
		label: 'Recall',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		color: 'alert',
		async action(this: unknown, _, { message = messageArgs(this).msg, chat }) {
			await chat?.flows.requestMessageDeletion(message);
		},
		condition({ message, subscription, room, chat }) {
			if (!subscription) {
				return false;
			}
			if (isRoomFederated(room)) {
				return message.u._id === Meteor.userId();
			}
			const isLivechatRoom = roomCoordinator.isLivechatRoom(room.t);
			if (isLivechatRoom) {
				return false;
			}

			return chat?.data.canDeleteMessage(message) ?? false;
		},
		order: 18,
		group: 'menu',
	});

	/*
	MessageAction.addButton({
		id: 'report-message',
		icon: 'report',
		label: 'Report',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		color: 'alert',
		action(this: unknown, _, { message = messageArgs(this).msg }) {
			imperativeModal.open({
				component: ReportMessageModal,
				props: {
					message: getMainMessageText(message),
					onClose: imperativeModal.close,
				},
			});
		},
		condition({ subscription, room }) {
			const isLivechatRoom = roomCoordinator.isLivechatRoom(room.t);
			if (isLivechatRoom) {
				return false;
			}
			return Boolean(subscription);
		},
		order: 17,
		group: 'menu',
	});

	MessageAction.addButton({
		id: 'reaction-list',
		icon: 'emoji',
		label: 'Reactions',
		context: ['message', 'message-mobile', 'threads'],
		action(this: unknown, _, { message: { reactions = {} } = messageArgs(this).msg }) {
			imperativeModal.open({
				component: ReactionList,
				props: { reactions, onClose: imperativeModal.close },
			});
		},
		condition({ message: { reactions } }) {
			return !!reactions;
		},
		order: 18,
		group: 'menu',
	});
	 */

	MessageAction.addButton({
		id: 'forward',
		icon: 'forward',
		label: 'Forward',
		// classes: 'clipboard',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		action(_, props) {
			const { message = messageArgs(this).msg } = props;

			imperativeModal.open({
				component: ForwardMessage,
				props: {
					onClose: imperativeModal.close,
					msgIds: [message._id],
				},
			});
		},
		condition({ message, subscription }) {
			if (message.msgType === 'forwardMergeMessage') {
				return true;
			}
			return !message.msgType && !!subscription;
		},
		order: 6,
		group: 'menu',
	});
	MessageAction.addButton({
		id: 'forward-multi-one-by-one',
		icon: 'forward_one_by_one',
		label: 'Forward_one-by-one',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		action(_, props) {
			const { message = messageArgs(this).msg } = props;
			$('.bm-forward-container').show();
			$('.rc-message-box.footer').hide();
			$('.bm_forward_type').text('逐条转发');
			selectedMessageStore.setIsSelecting(true);
			selectedMessageStore.toggle(message._id);
		},
		condition({ message, subscription }) {
			return !message.msgType && !!subscription;
		},
		order: 8,
		group: 'menu',
	});

	MessageAction.addButton({
		id: 'forward-multi-combine',
		icon: 'forward_combine',
		label: 'Forward_combine',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		action(_, props) {
			const { message = messageArgs(this).msg } = props;
			$('.bm-forward-container').show();
			$('.rc-message-box.footer').hide();
			$('.bm_forward_type').text('合并转发');
			selectedMessageStore.setIsSelecting(true);
			selectedMessageStore.toggle(message._id);
		},
		condition({ message, subscription }) {
			return !message.msgType && !!subscription;
		},
		order: 9,
		group: 'menu',
	});
});
