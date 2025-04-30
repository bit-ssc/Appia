import type { IMessage, IRoom } from '@rocket.chat/core-typings';
import { Box, Message, MessageLeftContainer, MessageContainer, CheckBox, MessageTimestamp } from '@rocket.chat/fuselage';
import { useToggle } from '@rocket.chat/fuselage-hooks';
import { useUserId } from '@rocket.chat/ui-contexts';
import { Space, Badge } from 'antd';
import type { ReactElement } from 'react';
import React, { useRef, memo } from 'react';

import type { MessageActionContext } from '../../../../app/ui-utils/client/lib/MessageAction';
import { MessageTypes } from '../../../../app/ui-utils/lib/MessageTypes';
import { useFormatHourMinute } from '../../../hooks/useFormatHourMinute';
import { useIsMessageHighlight } from '../../../views/room/MessageList/contexts/MessageHighlightContext';
import {
	useIsSelecting,
	useToggleSelect,
	useIsSelectedMessage,
	useCountSelected,
} from '../../../views/room/MessageList/contexts/SelectedMessagesContext';
import { useJumpToMessage } from '../../../views/room/MessageList/hooks/useJumpToMessage';
import { useChat } from '../../../views/room/contexts/ChatContext';
import IgnoredContent from '../IgnoredContent';
import MessageHeader from '../MessageHeader';
import MessageTopSection from '../MessageTopSection';
import StatusIndicators from '../StatusIndicators';
import ToolboxHolder from '../ToolboxHolder';
import { appiaMessageStyle } from '../appia/appia-style';
import MessageAvatar from '../header/MessageAvatar';

import { UploadState } from '/client/lib/chats/Upload';

import { useNormalizedMessage } from '../hooks/useNormalizedMessage';
import RoomMessageContent from './room/RoomMessageContent';

type RoomMessageProps = {
	message: IMessage & { ignored?: boolean };
	showUserAvatar: boolean;
	sequential: boolean;
	isLastInSequence: boolean;
	unread: boolean;
	mention: boolean;
	all: boolean;
	room: IRoom;
	context?: MessageActionContext;
	ignoredUser?: boolean;
	searchText?: string;
	tab?: boolean;
};

const RoomMessage = ({
	message,
	showUserAvatar,
	sequential,
	isLastInSequence,
	all,
	mention,
	unread,
	context,
	ignoredUser,
	searchText,
	room,
}: RoomMessageProps): ReactElement => {
	const uid = useUserId();
	const editing = useIsMessageHighlight(message._id);
	const [displayIgnoredMessage, toggleDisplayIgnoredMessage] = useToggle(false);
	const ignored = (ignoredUser || message.ignored) && !displayIgnoredMessage;
	const messageRef = useRef(null);
	const chat = useChat();
	const selecting = useIsSelecting();
	const toggleSelected = useToggleSelect(message._id);
	const selected = useIsSelectedMessage(message._id);
	const uploading = message?.fileData && message?.fileData?.uploadState === UploadState.uploading;
	useCountSelected();
	useJumpToMessage(message._id, messageRef);
	const federated = Boolean(message?.u?.username.includes(':'));
	const mdMessage = useNormalizedMessage(message).md;
	const isAnnoucementMessage = MessageTypes.isAnnoucementMessage(message);
	const showMessageTopSection =
		!sequential &&
		message.u.username &&
		!selecting &&
		showUserAvatar &&
		(message.msgType || isAnnoucementMessage || mdMessage.length === 0);
	const formatTime = useFormatHourMinute();
	const canSelect = !message.msgType;

	return (
		<Box className={appiaMessageStyle}>
			<Message
				ref={messageRef}
				id={message._id}
				onClick={selecting ? toggleSelected : undefined}
				isSelected={selected}
				isEditing={editing}
				isPending={message.temp}
				sequential={sequential}
				data-qa-editing={editing}
				data-qa-selected={selected}
				data-id={message._id}
				data-mid={message._id}
				data-unread={unread}
				data-sequential={sequential}
				data-own={message.u._id === uid}
				data-todo={message.appiaTodo?.status === 0}
				data-qa-type='message'
				aria-busy={message.temp}
			>
				{/* {selecting && !uploading && (
					<CheckBox
						style={{ margin: '0px 10px 0px 10px' }}
						opacity={canSelect ? 1 : 0.4}
						checked={selected}
						onChange={canSelect ? toggleSelected : undefined}
					/>
				)} */}

				<MessageLeftContainer>
					{selecting && !uploading && <CheckBox checked={selected} onChange={toggleSelected} />}
					<MessageTopSection
						message={message}
						context={context}
						sequential={sequential}
						selecting={selecting}
						showUserAvatar={showUserAvatar}
						selected={selected}
						toggleSelected={toggleSelected}
						uploading={uploading}
						chat={chat}
						federated={federated}
						showMessageTopSection={showMessageTopSection}
					/>
					{/* {sequential && <StatusIndicators message={message} />} */}
				</MessageLeftContainer>

				<MessageContainer>
					<div style={{ gap: '8px', marginBlock: '2px' }}>
						{!['search', 'mentions'].includes(context || '') && !message.private && !uploading && (
							<ToolboxHolder message={message} context={context} />
						)}

						{/* 						{showMessageTopSection && (
							<div style={{ display: 'block', width: '100%', marginTop: '2px' }}>
								<MessageTopSection
									message={message}
									context={context}
									sequential={sequential}
									selecting={selecting}
									showUserAvatar={showUserAvatar}
									selected={selected}
									toggleSelected={toggleSelected}
									uploading={uploading}
									chat={chat}
									federated={federated}
								/>
							</div>
						)}
 */}
						<div className='appia-body-wrapper' style={{ flex: 1 }}>
							{ignored ? (
								<IgnoredContent onShowMessageIgnored={toggleDisplayIgnoredMessage} />
							) : (
								<div className='rcx-message-content-container'>
									<RoomMessageContent
										room={room}
										context={context}
										message={message}
										unread={unread}
										mention={mention}
										all={all}
										searchText={searchText}
										showUserAvatar={showUserAvatar}
										selecting={selecting}
										sequential={sequential}
										selected={selected}
										toggleSelected={toggleSelected}
										uploading={uploading}
										federated={federated}
										isLastInSequence={isLastInSequence}
									/>
								</div>
							)}
						</div>

						{/* <div style={{ position: 'absolute', right: '0' }}>
							<MessageTimestamp title={formatTime(message.ts)}>
								{formatTime(message.ts)}
							</MessageTimestamp>
						</div> */}
					</div>
				</MessageContainer>
			</Message>
		</Box>
	);
};

export default memo(RoomMessage);
