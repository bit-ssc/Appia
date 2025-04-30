import type { IRoom, IUser } from '@rocket.chat/core-typings';
import { useTranslation, usePermission } from '@rocket.chat/ui-contexts';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import React, { memo, useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';

import { ChatMessage } from '../../../../../app/models/client';
import { MessageTypes } from '../../../../../app/ui-utils/lib/MessageTypes';
import { APIClient } from '../../../../../app/utils/client';
import { message } from '../../../../components/AppiaUI';
import ForwardMessage from '../../../../components/ForwardMessage';
import {
	CombineBigIcon,
	DiscussionStartBigIcon,
	ForwordBigIcon,
	CloseForwordIcon,
	EmailForwardBigIcon,
	RecallBatchMessagesIcon,
	AnnouncementBigIcon,
} from '../../../../components/SvgIcons';
import { useNormalizedMessageFactory } from '../../../../components/message/hooks/useNormalizedMessage';
import { useEndpointActionExperimental } from '../../../../hooks/useEndpointActionExperimental';
import { imperativeModal } from '../../../../lib/imperativeModal';
import { goToRoomById } from '../../../../lib/utils/goToRoomById';
import { useEndpointActionExperimental } from '../../../../hooks/useEndpointActionExperimental';
import type { IRoom } from '@rocket.chat/core-typings';
import { useNormalizedMessageFactory } from '../../../../components/message/hooks/useNormalizedMessage';
import { MessageTypes } from '../../../../../app/ui-utils/lib/MessageTypes';
import { isRoomFederated } from '@rocket.chat/core-typings';
import { roomCoordinator } from '../../../../lib/rooms/roomCoordinator';
import { APPIA_TAG, hasPermission } from '../../../../../lib/utils/permission';
import { useChat } from '../../../../views/room/contexts/ChatContext';
import { useRoomSubscription } from '../../contexts/RoomContext';
import { ORDERED_NUMBERS } from '@rocket.chat/gazzodown';

interface IRoomForwordViewProps {
	selectedMessageCount: number;
	selectedMessageStore: any;
	prid: string;
	room: IRoom;
}

const getLocaleUsername = (username: string | undefined) => {
	if (username?.includes(':')) {
		return username.split(':')[0];
	}

	return username || '';
}

const RoomForwordView = memo(({ selectedMessageCount, selectedMessageStore, prid, room }: IRoomForwordViewProps) => {
	const t = useTranslation();
	const saveAction = useEndpointActionExperimental('POST', 'v1/rooms.saveRoomSettings');
	const recallMessages = useEndpointActionExperimental('POST', '/v1/message.batch.recall', null, false);
	const canSetAnnouncement = usePermission('edit-team-channel', room._id) && room.t !== 'd';
	const getNormalizedMessage = useNormalizedMessageFactory();
	const chat = useChat();
	const subscription = useRoomSubscription();
	const [isAllowedToRecall, setIsAllowedToRecall] = useState(false);

	useEffect(() => {
		const messageIds = selectedMessageStore.getSelectedMessages();
		if (!messageIds.length) {
			setIsAllowedToRecall(false);
			return;
		}

		// 获取所有选中消息的详细信息
		const messages = messageIds.map((id) => ChatMessage.findOne(id)).filter(Boolean);

		getCanDeleteStatus(messages);
	}, [selectedMessageStore.getSelectedMessages(), room, chat]);

	const getCanDeleteStatus = async (messages) => {
		try {
			for (const message of messages) {
				if (!subscription) {
					console.log('No subscription, cannot delete');
					setIsAllowedToRecall(false);
					return;
				}

				if (MessageTypes.isSystemMessage(message) && !MessageTypes.isAnnoucementMessage(message)) {
					console.log('System message (non-announcement), cannot delete');
					setIsAllowedToRecall(false);
					return;
				}

				const localMessage = !message.u.username.includes(':');
				// @ts-ignore
				if (Meteor.user()?.isManager && localMessage && hasPermission(room.showAppiaTag, APPIA_TAG.external)) {
					continue; // 继续检查下一条消息
				}

				if (isRoomFederated(room)) {
					const isAuthor = message.u._id === Meteor.userId();
					if (!isAuthor) {
						console.log('Federated room, user is not message author');
						setIsAllowedToRecall(false);
						return;
					}
					continue; // 继续检查下一条消息
				}

				const isLivechatRoom = roomCoordinator.isLivechatRoom(room.t);
				if (isLivechatRoom) {
					console.log('Livechat room, cannot delete');
					setIsAllowedToRecall(false);
					return;
				}

				const canDelete = (await chat?.data.canDeleteMessage(message)) ?? false;
				if (!canDelete) {
					console.log('Cannot delete message');
					setIsAllowedToRecall(false);
					return;
				}
			}

			// 如果所有消息都通过检查
			console.log('All messages can be deleted');
			setIsAllowedToRecall(true);
		} catch (error) {
			console.error('Error checking delete permissions:', error);
			setIsAllowedToRecall(false);
		}
	};

	const mdStringify = (normalizedMessage) => {
		const mentionMap: Record<string, (Pick<IUser, '_id' | 'username' | 'name'>)>= {};

		normalizedMessage.mentions?.forEach((mention: Pick<IUser, '_id' | 'username' | 'name'>) => {
			mentionMap[mention.username as string] = mention;
		});
		const flattenMDValues = (values: any[], isTopLevel: boolean = true, parent?: any): string => {
			let result = '';
			values.forEach((item, index) => {
				// 处理列表项
				if (item.type === 'LIST_ITEM') {
					// 添加列表标识符
					if (parent.type === 'UNORDERED_LIST') {
						if (parent.level > 0) {
							result += new Array(parent.level).fill('    ').join('');
						}
						result += '- ';
					} else if (parent.type === 'ORDERED_LIST' && item.number) {
						const ordered = ORDERED_NUMBERS[(parent.level || 0) % ORDERED_NUMBERS.length];
						if (parent.level > 0) {
							result += new Array(parent.level).fill('    ').join('');
						}
						result += `${ordered[(item.number ? item.number - 1 : 0) % ordered.length]}. `;
					}
				}

				// 如果item本身是字符串，则直接拼接
				if (typeof item === 'string') {
					result += item;
				} else if (Array.isArray(item)) {
					// 如果item是数组，就递归处理每一项，并标记为非顶层
					result += flattenMDValues(item, false, parent);
				} else if (item && typeof item === 'object') {
					// 处理代码块的特殊情况
					if (item.type === 'CODE_LINE' && item.value?.type === 'PLAIN_TEXT') {
						result += item.value.value;
					}
					// 处理链接
					else if (item.type === 'LINK' && item.value?.label) {
						result += flattenMDValues(item.value.label, false, item);
					}
					else if (item.type === 'MENTION_USER') {
						const mention = mentionMap[item.value?.value];
						let name = '';

						if (mention) {
							name = mention.name ? mention.name : getLocaleUsername(mention.username);
						} else {
							name = getLocaleUsername(item.value?.value);
						}

						if (name) {
							result += `\u0000@${name}`;
						}
					}
					// 处理有序列表和无序列表
					else if (item.type === 'UNORDERED_LIST' || item.type === 'ORDERED_LIST') {
						result += flattenMDValues(item.value, false, item);
					}
					// 如果存在value属性，并且value是数组，则递归
					else if (Array.isArray(item.value)) {
						result += flattenMDValues(item.value, false, item);
					} else if (typeof item.value === 'string') {
						// 如果value是字符串，直接拼接
						result += item.value;
					}
				}

				// 处理换行
				if (isTopLevel && index < values.length - 1) {
					// 顶层元素之间的换行
					result += '\n';
				} else if (!isTopLevel && parent.type && item.type === 'LIST_ITEM' && index < values.length - 1) {
					// 列表项之间的换行
					result += '\n';
				}
			});

			return result;
		};

		return flattenMDValues(normalizedMessage.md)
			.replace(/^\u0000@/gi, '@')
			.replace(/(\s+)\u0000@/gi, '$1@')
			.replace(/\u0000@/gi, ' @');
	}

	const createNewDiscussion = async () => {
		const messageIds = selectedMessageStore.getSelectedMessages();
		if (!messageIds.length) {
			message.error(t('Please_select_a_message'));
			return;
		}

		selectedMessageStore.setIsSelecting(false);
		selectedMessageStore.clearStore();

		const messageId = messageIds[0];
		const message = ChatMessage.findOne({ _id: messageId });
		const { discussion } = await APIClient.post('/v1/rooms.createDiscussion', {
			prid,
			t_name: message?.msg.replace(/^\s*\[.*?\]\s*\(.*?\)\s*/, '') || TAPi18n.__('Untitled_Topic'),
			pmid: messageIds.join(','),
			all: true,
		});
		goToRoomById(discussion._id);
	};

	const findTitleUrl = (message) => {
		function recursiveSearch(attachments) {
			// 如果 attachments 不是数组或者长度为0，返回空字符串
			if (!Array.isArray(attachments) || attachments.length === 0) {
				return '';
			}
			// 取第一个附件
			const firstAttachment = attachments[0];
			// 检查第一个附件的 type 和 title_url
			if (firstAttachment.type && firstAttachment.title_link) {
				return firstAttachment.title_link;
			}
			// 如果第一个附件中有新的 attachments，递归搜索
			if (firstAttachment.attachments) {
				return recursiveSearch(firstAttachment.attachments);
			}
			// 如果第一个附件不满足条件并且没有新的 attachments，继续搜索剩下的 attachments
			return recursiveSearch(attachments.slice(1));
		}

		// 检查 map 中是否包含 attachments 并且长度大于 0
		if (message.attachments && message.attachments.length > 0) {
			return recursiveSearch(message.attachments);
		}
		// 如果 map 中不包含 attachments 或者长度为 0，返回空字符串
		return '';
	};

	const handleAttachmentUrl = (url) => {
		if (url.length === 0 || url.startsWith('http://') || url.startsWith('https://')) {
			return url;
		}
		return `https://${window.location.host}${url.replace(new RegExp('/file-upload'), '/file-proxy')}`;
	};

	const handleEmailForward = () => {
		const messageIds = selectedMessageStore.getSelectedMessages();
		const messages = messageIds.map((id) => ChatMessage.findOne({ _id: id }));
		if (!messages.length) {
			message.error(t('Please_select_a_message'));
			return;
		}

		const firstMessage = messages[0];

		const msgTitles = messages.map((msg) => msg.msg).join('\n');

		const attachments = messages.map((msg) => handleAttachmentUrl(findTitleUrl(msg))).join('\n\n');

		const email = '';
		const subject = encodeURIComponent(firstMessage.msg);
		const body = encodeURIComponent(`${msgTitles}${attachments}`);
		const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
		window.location.href = mailtoLink;

		selectedMessageStore.setIsSelecting(false);
		selectedMessageStore.clearStore();
	};

	const handleSetAsAnnouncement = async () => {
		const messageIds = selectedMessageStore.getSelectedMessages();
		if (!messageIds.length) {
			message.error(t('Please_select_a_message'));
			return;
		}

		const messages = messageIds.map((id) => ChatMessage.findOne({ _id: id }));

		try {
			let successCount = 0;
			let skippedCount = 0;
			// 串行处理每条消息，因为后端可能没有设计为支持并发操作
			for (const msg of messages) {
				if (!msg) {
					console.log('Skipping null message');
					continue;
				}

				// 检查消息是否已经是公告
				if (MessageTypes.isAnnoucementMessage(msg) || msg.msgType) {
					console.log('Skipping announcement message:', msg._id);
					skippedCount++;
					continue;
				}

				const normalizedMessage = getNormalizedMessage(msg);
				const flatText = normalizedMessage.md ? mdStringify(normalizedMessage) : '';
				const roomAnnouncementData = {
					message: flatText,
					files:
						msg.attachments
							?.map((attachment) => {
								// 如果attachment没有title或title_link，则返回null
								if (!attachment.title || !attachment.title_link) {
									return null;
								}
								return {
									fileName: attachment.title,
									fileUrl: handleAttachmentUrl(attachment.title_link),
								};
							})
							.filter((attachment): attachment is NonNullable<typeof attachment> => attachment !== null) || [],
				};

				try {
					const rid = room ? room._id : msg.rid;
					const result = await saveAction({
						rid,
						roomAnnouncementData,
					});
					if (result) successCount++;
				} catch (error) {
					console.error('Error saving announcement:', error);
					console.error('Error details:', {
						name: error.name,
						message: error.message,
						stack: error.stack,
						response: error.response,
					});
				}
			}

			if (successCount > 0) {
				const totalMessages = messages.length;
				if (skippedCount > 0) {
					message.success(
						t('Announcement_set_successfully_with_skipped', {
							success: successCount,
							skipped: skippedCount,
							total: totalMessages,
						}),
					);
				} else {
					message.success(t('Announcement_set_successfully'));
				}
			} else {
				message.error(t('Failed_to_set_announcement'));
			}
		} catch (error) {
			console.error('Error in handleSetAsAnnouncement:', error);
			message.error(t('Failed_to_set_announcement'));
		} finally {
			selectedMessageStore.setIsSelecting(false);
			selectedMessageStore.clearStore();
		}
	};

	const handleRecallBatchMessages = async () => {
		const messageIds = selectedMessageStore.getSelectedMessages();
		if (!messageIds.length) {
			message.error(t('Please_select_a_message'));
			return;
		}

		try {
			// 先获取所有消息的内容并缓存
			const messagesCache = {};
			for (const messageId of messageIds) {
				const message = ChatMessage.findOne({ _id: messageId });
				if (message) {
					messagesCache[messageId] = message;

					// 在撤回前获取DOM元素的富文本内容
					const $msg = document.getElementById(`j-message-content-${messageId}`);
					if ($msg) {
						// 保存DOM元素的innerHTML到消息缓存中
						messagesCache[messageId]._htmlContent = $msg.innerHTML.replace(/<span class=['"]edit-message-mark['"][^>]*>.*?<\/span>/, '');

						// 保存@提及信息
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
							console.error('Error saving mentions:', error);
						}
					}
				}
			}

			// 执行撤回操作
			const result = await recallMessages({ ids: messageIds });

			// 只保存成功撤回的消息
			if (result.message === 'Messages_recalled_successfully' || result.message === 'Messages_recalled_partially') {
				const successIds = result.successIds || [];

				// 使用缓存的消息数据保存成功撤回的消息内容
				for (const messageId of successIds) {
					if (messagesCache[messageId]) {
						saveMessageContentFromCache(messageId, messagesCache[messageId]);
					}
				}

				if (result.message === 'Messages_recalled_successfully') {
					message.success(t('Messages_recalled_successfully'));
				} else {
					message.warning(t('Messages_recalled_partially'));
				}
			} else {
				message.error(t('Failed_to_recall_messages'));
			}
		} catch (error) {
			message.error(t('Failed_to_recall_messages'));
		} finally {
			selectedMessageStore.setIsSelecting(false);
			selectedMessageStore.clearStore();
		}
	};

	// 从缓存中保存消息内容的辅助函数
	const saveMessageContentFromCache = (messageId: string, cachedMessage: any) => {
		const fileDesc = cachedMessage?.attachments?.length > 0 ? cachedMessage.attachments[0]?.description ?? '' : '';
		// 使用预先保存的HTML内容，而不是尝试从DOM获取
		let msgContent = cachedMessage._htmlContent || '';

		if (!msgContent) {
			// 如果没有预先保存的HTML内容，尝试从DOM获取
			const $msg = document.getElementById(`j-message-content-${messageId}`);
			if ($msg) {
				msgContent = $msg.innerHTML.replace(/<div class=['"]edit-message-mark['"][^>]*>.*?<\/div>/, '');
			}
		}

		// 改进的附件判断逻辑
		const hasAttachments = Array.isArray(cachedMessage.attachments) && cachedMessage.attachments.length > 0;
		const hasFile =
			cachedMessage.hasOwnProperty('file') ||
			cachedMessage.msgType === 'docCloud' ||
			cachedMessage.msgType === 'forwardMergeMessage' ||
			hasAttachments;

		// 从多个可能的位置获取文件信息
		let fileData = undefined;
		if (cachedMessage.file) {
			fileData = cachedMessage.file;
		} else if (hasAttachments && cachedMessage.attachments[0].file) {
			fileData = cachedMessage.attachments[0].file;
		} else if (hasAttachments) {
			// 如果附件中没有file对象，但有其他信息，创建一个包含附件关键信息的对象
			const attachment = cachedMessage.attachments[0];
			fileData = {
				_id: attachment._id || messageId,
				name: attachment.title || '',
				type: attachment.type || 'file',
			};
		}

		// 保存消息内容到localStorage
		localStorage.setItem(
			`rollback_${messageId}`,
			JSON.stringify({
				msg: msgContent || cachedMessage.msg || fileDesc,
				ts: Date.now(),
				isFile: hasFile,
				file: fileData,
				// 保存完整的附件信息，以便更好地恢复
				attachments: hasAttachments ? cachedMessage.attachments : undefined,
			}),
		);

		// 详细日志
		// console.log(`保存消息 ${messageId} 的内容到localStorage:`, {
		// 	hasFile,
		// 	hasAttachments,
		// 	fileData,
		// 	messageType: cachedMessage.msgType,
		// 	hasFileProperty: cachedMessage.hasOwnProperty('file'),
		// 	attachmentsInfo: hasAttachments ? {
		// 		count: cachedMessage.attachments.length,
		// 		firstAttachmentType: cachedMessage.attachments[0]?.type
		// 	} : 'none'
		// });
	};

	return (
		<div className='bm-forward-container'>
			<div className='bm-forward-bg'>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<span className='bm_forward_selected_msgs' style={{ fontSize: 'middle', marginBottom: '48px' }}>
						{t('Selected__count__msgs', { count: selectedMessageCount })}
					</span>
				</div>
				<div style={{ display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
					<div
						style={{ marginRight: '25px', cursor: 'pointer' }}
						onClick={() => {
							const messageIds = selectedMessageStore.getSelectedMessages();
							if (!messageIds.length) {
								message.error(t('Please_select_a_message'));
								return;
							}

							imperativeModal.open({
								component: ForwardMessage,
								props: {
									onClose: imperativeModal.close,
									msgIds: selectedMessageStore.getSelectedMessages(),
									isMerged: false,
								},
							});
						}}
					>
						<ForwordBigIcon />
						<div style={{ textAlign: 'center', color: '#1D2129' }}>{t('forward_msg_by_msg')}</div>
					</div>
					<div
						style={{ marginRight: '25px', cursor: 'pointer' }}
						onClick={() => {
							const messageIds = selectedMessageStore.getSelectedMessages();
							if (!messageIds.length) {
								message.error(t('Please_select_a_message'));
								return;
							}

							imperativeModal.open({
								component: ForwardMessage,
								props: {
									onClose: imperativeModal.close,
									msgIds: selectedMessageStore.getSelectedMessages(),
									isMerged: true,
								},
							});
						}}
					>
						<CombineBigIcon />
						<div style={{ textAlign: 'center', color: '#1D2129' }}>{t('Merge_forward')}</div>
					</div>
					{canSetAnnouncement && (
						<div
							style={{ marginRight: '25px', cursor: 'pointer' }}
							onClick={() => {
								handleSetAsAnnouncement();
							}}
						>
							<AnnouncementBigIcon />
							<div style={{ textAlign: 'center', color: '#1D2129' }}>{t('Set_as_announcement')}</div>
						</div>
					)}
					<div
						style={{ marginRight: '25px', cursor: 'pointer' }}
						onClick={() => {
							handleEmailForward();
						}}
					>
						<EmailForwardBigIcon />
						<div style={{ textAlign: 'center', color: '#1D2129' }}>{t('Email_Forword')}</div>
					</div>
					<div
						style={{ marginRight: '25px', cursor: 'pointer' }}
						onClick={() => {
							createNewDiscussion();
						}}
					>
						<DiscussionStartBigIcon />
						<div style={{ textAlign: 'center', color: '#1D2129' }}>{t('Discussion_start')}</div>
					</div>
					<div
						style={{
							marginRight: '25px',
							cursor: isAllowedToRecall ? 'pointer' : 'not-allowed',
							opacity: isAllowedToRecall ? 1 : 0.5,
						}}
						onClick={() => {
							if (isAllowedToRecall) {
								handleRecallBatchMessages();
							}
						}}
					>
						<RecallBatchMessagesIcon />
						<div style={{ textAlign: 'center', color: isAllowedToRecall ? '#1D2129' : '#999999' }}>{t('Batch_Recall')}</div>
					</div>
				</div>
				<div
					style={{ marginBottom: '40px', cursor: 'pointer' }}
					onClick={() => {
						selectedMessageStore.setIsSelecting(false);
						selectedMessageStore.clearStore();
					}}
				>
					<CloseForwordIcon />
				</div>
			</div>
		</div>
	);
});

RoomForwordView.displayName = 'RoomForwordView';
export default RoomForwordView;
