import type { IMessage, IRoom } from '@rocket.chat/core-typings';
import {
	MessageSystem,
	MessageSystemBody,
	MessageSystemContainer,
	MessageSystemLeftContainer,
	MessageSystemBlock,
	MessageNameContainer,
} from '@rocket.chat/fuselage';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { memo, useRef } from 'react';

import { MessageTypes } from '../../../../app/ui-utils/client';
import { useFormatMessageRecordDateAndTime } from '../../../hooks/useFormatDateAndTime';
import { uploadFiles } from '../../../lib/chats/flows/uploadFiles';
import { useCountSelected } from '../../../views/room/MessageList/contexts/SelectedMessagesContext';
import { useJumpToMessage } from '../../../views/room/MessageList/hooks/useJumpToMessage';
import { useChat } from '../../../views/room/contexts/ChatContext';
import { ReactiveUserStatus } from '../../UserStatus';
import MessageHeader from '../MessageHeader';
import Attachments from '../content/Attachments';
import MessageActions from '../content/MessageActions';
import MessageAvatar from '../header/MessageAvatar';
import AnnouncementMsg from './AnnouncementMsg';

// import { useMessageListShowRealName, useMessageListShowUsername } from '../list/MessageListContext';
// import { useMessageListShowRealName } from '../list/MessageListContext';

type SystemMessageProps = {
	message: IMessage;
	room: IRoom;
	showUserAvatar: boolean;
};

const SystemMessage = ({ message, room }: SystemMessageProps): ReactElement => {
	const t = useTranslation();
	const formatTime = useFormatMessageRecordDateAndTime();
	const messageType = MessageTypes.getType(message);
	const chat = useChat();
	useCountSelected();

	const messageRef = useRef(null);
	useJumpToMessage(message._id, messageRef);

	let reeditMsg;
	const recallMessageStr = localStorage[`rollback_${message._id}`] || localStorage[`rollback_${message.delMsgId}`];
	if (message.t === 'rollback-message') {
		reeditMsg = (
			<div ref={messageRef} className='recall-message-timestamp'>
				{formatTime(message._updatedAt)}
			</div>
		);
		if (recallMessageStr) {
			try {
				const lastMessage = JSON.parse(recallMessageStr);
				const isTimeout = Date.now() - lastMessage.ts > 1000 * 60 * 3;
				const fileReEdit = !!lastMessage.file;
				const onReEdit = () => {
					// 消息文件的重新编辑处理
					if (fileReEdit) {
						// todo 打开文件编辑弹窗
						const file = {
							...lastMessage.file,
							url: `/file-upload/${lastMessage.file._id}/${encodeURIComponent(lastMessage?.file?.name)}`,
						};
						uploadFiles(chat, [], false, lastMessage.msg, file);
					} else {
						chat?.composer?.setText(lastMessage.msg);
					}
				};
				if (isTimeout) {
					localStorage.removeItem(`rollback_${message.delMsgId}`);
				} else {
					reeditMsg =
						lastMessage.msg !== '' || fileReEdit ? (
							<>
								<div className='recall-message-timestamp'>{formatTime(message._updatedAt)}</div>
								<span className='reedit-message' onClick={onReEdit}>
									{t('Re-edit')}
								</span>
							</>
						) : null;
				}
			} catch (e) {
				console.log('reedit-error', e);
			}
		}
	}

	const getAnnouncementMsg = (msg: string) => {
		if (!msg) {
			return null;
		}
		return (
			<>
				<MessageHeader message={message} />
				<AnnouncementMsg message={message} />
			</>
		);
	};

	const getContent = () => {
		return (
			messageType && (
				<MessageSystemBody
					data-qa-type='system-message-body'
					dangerouslySetInnerHTML={{
						__html: messageType.render
							? messageType.render(message, room)
							: t(messageType.message, messageType.data ? messageType.data(message) : {}),
					}}
				/>
			)
		);
	};

	const federated = Boolean(message?.u?.username.includes(':'));

	const getAnnouncementAvatar = () => {
		if (!message.msg) {
			return null;
		}
		return (
			MessageTypes.isAnnoucementMessage(message) && (
				<>
					<MessageAvatar
						emoji={message.emoji}
						avatarUrl={message.avatar}
						username={message.u.username}
						size='x36'
						{...(chat?.userCard &&
							!federated && {
								onClick: chat?.userCard.open(message.u.username, message.roomSender),
								style: { cursor: 'pointer' },
							})}
					/>
					<ReactiveUserStatus uid={message.u._id} style={{ position: 'relative', bottom: 5, right: -3 }} />
				</>
			)
		);
	};

	const announcementAvatar = getAnnouncementAvatar();

	return (
		<MessageSystem
			onClick={undefined}
			// isSelected={isSelected}
			// data-qa-selected={isSelected}
			data-qa='system-message'
			data-system-message-type={message.t}
		>
			{announcementAvatar ? <MessageSystemLeftContainer>{getAnnouncementAvatar()}</MessageSystemLeftContainer> : <></>}
			<MessageSystemContainer>
				{MessageTypes.isAnnoucementMessage(message) ? (
					getAnnouncementMsg(message.msg)
				) : (
					<MessageSystemBlock>
						<MessageNameContainer>
							{/**
						<MessageSystemName
							{...(user.username !== undefined &&
								chat?.userCard && {
									onClick: chat?.userCard.open(user.username),
									style: { cursor: 'pointer' },
								})}
						>
							{getUserDisplayName(user.name, user.username, showRealName)}
						</MessageSystemName>
						{showUsername && (
							<>
								{' '}
								<MessageUsername
									data-username={user.username}
									{...(user.username !== undefined &&
										chat?.userCard && {
											onClick: chat?.userCard.open(user.username),
											style: { cursor: 'pointer' },
										})}
								>
									@{user.username}
								</MessageUsername>
							</>
						)}
						 */}
						</MessageNameContainer>
						{getContent()}

						{reeditMsg}
						{/**
					<MessageSystemTimestamp title={formatDateAndTime(message.ts)}>{formatTime(message.ts)}</MessageSystemTimestamp>
					 */}
					</MessageSystemBlock>
				)}
				{message.attachments && (
					<MessageSystemBlock>
						<Attachments attachments={message.attachments} baseUrl={message.appiaBaseUrl} />
					</MessageSystemBlock>
				)}
				{message.actionLinks?.length && (
					<MessageActions
						message={message}
						actions={message.actionLinks.map(({ method_id: methodId, i18nLabel, ...action }) => ({
							methodId,
							i18nLabel: i18nLabel as TranslationKey,
							...action,
						}))}
					/>
				)}
			</MessageSystemContainer>
		</MessageSystem>
	);
};

export default memo(SystemMessage);
