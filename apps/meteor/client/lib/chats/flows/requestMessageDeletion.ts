import type { IMessage } from '@rocket.chat/core-typings';

import { t } from '../../../../app/utils/client';
import GenericModal from '../../../components/GenericModal';
import { imperativeModal } from '../../imperativeModal';
import { dispatchToastMessage } from '../../toast';
import type { ChatAPI } from '../ChatAPI';

export const requestMessageDeletion = async (chat: ChatAPI, message: IMessage): Promise<void> => {
	console.log("message>>>",message)
	if (!(await chat.data.canDeleteMessage(message))) {
		dispatchToastMessage({ type: 'error', message: t('Message_deleting_blocked') });
		return;
	}

	const room = message.drid ? await chat.data.getDiscussionByID(message.drid) : undefined;

	await new Promise<void>((resolve, reject) => {
		const onConfirm = async (): Promise<void> => {
			try {
				if (!(await chat.data.canDeleteMessage(message))) {
					dispatchToastMessage({ type: 'error', message: t('Message_deleting_blocked') });
					return;
				}
				const fileDesc = message?.attachments?.length > 0 ? message.attachments[0]?.description ?? '' : '';
<<<<<<< HEAD
				localStorage.setItem(`rollback_${message._id}`, JSON.stringify({ msg: message.msg || fileDesc, ts: Date.now(),isFile:(message.hasOwnProperty("file")||message.msgType==="docCloud"||message.msgType==="forwardMergeMessage")}));
=======
				const $msg = document.getElementById(`j-message-content-${message._id}`);
				let msgContent = '';

				if ($msg) {
					msgContent = $msg.innerHTML
						.replace(/<div class=['"]edit-message-mark['"][^>]*>.*?<\/div>/, '')
						.replace(/<div class=['"]avatar-name['"][^>]*>.*?<\/div>/, ''); // 删除编辑的标志
					try {
						const rid = room ? room._id : message.rid;

						if (rid) {
							const $users = $msg.querySelectorAll('.mention-link--user');
							$users?.forEach(($user) => {
								const user = $user.getAttribute('data-lexical-beautiful-mention-data');
								if (user) {
									const { username, name } = JSON.parse(user);

									if (username && name) {
										appiaMentions.set(rid, username, name);
									}
								}
							});
						}
					} catch (error) {
						console.error(error);
					}
				}

				localStorage.setItem(
					`rollback_${message._id}`,
					JSON.stringify({
						msg: msgContent || message.msg || fileDesc,
						ts: Date.now(),
						isFile: message.hasOwnProperty('file') || message.msgType === 'docCloud' || message.msgType === 'forwardMergeMessage',
						file: message.file,
					}),
				);
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
				await chat.data.recallMessage(message._id);

				imperativeModal.close();

				if (chat.currentEditing?.mid === message._id) {
					chat.currentEditing.stop();
				}

				chat.composer?.focus();

				dispatchToastMessage({ type: 'success', message: t('Your_entry_has_been_deleted') });
				resolve();
			} catch (error) {
				dispatchToastMessage({ type: 'error', message: error });
				reject(error);
			}
		};

		const onCloseModal = async (): Promise<void> => {
			imperativeModal.close();

			if (chat.currentEditing?.mid === message._id) {
				chat.currentEditing.stop();
			}
			chat.composer?.focus();

			resolve();
		};

		imperativeModal.open({
			component: GenericModal,
			props: {
				title: t('Are_you_sure'),
				children: room ? t('The_message_is_a_discussion_you_will_not_be_able_to_recover') : t('You_will_not_be_able_to_recover'),
				variant: 'danger',
				confirmText: t('Yes_delete_it'),
				onConfirm,
				onClose: onCloseModal,
				onCancel: onCloseModal,
			},
		});
	});
};
