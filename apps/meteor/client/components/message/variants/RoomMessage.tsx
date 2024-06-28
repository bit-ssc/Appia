import type { IMessage, IRoom } from '@rocket.chat/core-typings';
import { Box, Message, MessageLeftContainer, MessageContainer, CheckBox } from '@rocket.chat/fuselage';
import { useToggle } from '@rocket.chat/fuselage-hooks';
import { useUserId } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useRef, memo } from 'react';

import type { MessageActionContext } from '../../../../app/ui-utils/client/lib/MessageAction';
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
import StatusIndicators from '../StatusIndicators';
import ToolboxHolder from '../ToolboxHolder';
import { appiaMessageStyle } from '../appia/appia-style';
import MessageAvatar from '../header/MessageAvatar';
import RoomMessageContent from './room/RoomMessageContent';

import { UploadState } from '/client/lib/chats/Upload';

type RoomMessageProps = {
	message: IMessage & { ignored?: boolean };
	showUserAvatar: boolean;
	sequential: boolean;
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
	all,
	mention,
	unread,
	context,
	ignoredUser,
	searchText,
	room,
	tab,
}: RoomMessageProps): ReactElement => {
	const uid = useUserId();
	const editing = useIsMessageHighlight(message._id);
	const [displayIgnoredMessage, toggleDisplayIgnoredMessage] = useToggle(false);
	const ignored = (ignoredUser || message.ignored) && !displayIgnoredMessage;
	const chat = useChat();
	const messageRef = useRef(null);
	// const [showActionMenu, setShowActionMenu] = useState(false);

	const selecting = useIsSelecting();
	const toggleSelected = useToggleSelect(message._id);
	const selected = useIsSelectedMessage(message._id);
	const uploading = message?.fileData && message?.fileData?.uploadState === UploadState.uploading;

	useCountSelected();

	useJumpToMessage(message._id, messageRef);
	const federated = Boolean(message?.u?.username.includes(':'));
	// onMouseEnter={() => setShowActionMenu(true)} onMouseLeave={() => setShowActionMenu(false)}
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
				<MessageLeftContainer>
					{!sequential && message.u.username && !selecting && showUserAvatar && (
						<MessageAvatar
							emoji={message.emoji}
							avatarUrl={message.avatar}
							username={message.u.username}
							size='x36'
							{...(chat?.userCard &&
								!federated && {
									onClick: chat?.userCard.open(message.u.username),
									style: { cursor: 'pointer' },
								})}
						/>
					)}
					{selecting && !uploading && <CheckBox checked={selected} onChange={toggleSelected} />}
					{sequential && <StatusIndicators message={message} />}
				</MessageLeftContainer>

				<MessageContainer>
					<div>
						{!sequential && <MessageHeader message={message} context={context} />}

						<div className='appia-body-wrapper'>
							{ignored ? (
								<IgnoredContent onShowMessageIgnored={toggleDisplayIgnoredMessage} />
							) : (
								<div className='rcx-message-content-container'>
									<RoomMessageContent room={room} message={message} unread={unread} mention={mention} all={all} searchText={searchText} />
									{context !== 'search' && !message.private && !uploading && (
										<ToolboxHolder message={message} context={context} tab={tab} />
									)}
								</div>
							)}
						</div>
					</div>
				</MessageContainer>
			</Message>
		</Box>
	);
};

export default memo(RoomMessage);
