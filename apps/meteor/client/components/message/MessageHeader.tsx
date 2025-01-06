import type { IMessage } from '@rocket.chat/core-typings';
import {
	MessageHeader as FuselageMessageHeader,
	MessageName,
	MessageTimestamp,
	// MessageUsername,
	// MessageStatusPrivateIndicator,
	MessageNameContainer,
} from '@rocket.chat/fuselage';
// import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { memo } from 'react';

import { getUserDisplayName } from '../../../lib/getUserDisplayName';
import { useFormatMessageRecordDateAndTime } from '../../hooks/useFormatDateAndTime';
import { useFormatTime } from '../../hooks/useFormatTime';
import { useUserData } from '../../hooks/useUserData';
import type { UserPresence } from '../../lib/presence';
import { useChat } from '../../views/room/contexts/ChatContext';
import ToolboxHolder from './ToolboxHolder';
// import StatusIndicators from './StatusIndicators';
// import MessageRoles from './header/MessageRoles';
// import { useMessageRoles } from './header/hooks/useMessageRoles';
// import { useMessageListShowUsername, useMessageListShowRealName, useMessageListShowRoles } from './list/MessageListContext';
import { useMessageListShowUsername, useMessageListShowRealName } from './list/MessageListContext';
import { MessageTypes } from '../../../app/ui-utils/client';

import type { MessageActionContext } from '/app/ui-utils/client/lib/MessageAction';

type MessageHeaderProps = {
	message: IMessage;
	context?: MessageActionContext;
	uploading?: boolean;
	showActionMenu?: boolean;
};

const MessageHeader = ({ message, context, uploading, showActionMenu }: MessageHeaderProps): ReactElement => {
	// const t = useTranslation();
	const formatTime = useFormatTime();
	const formatMessageRecordDateAndTime = useFormatMessageRecordDateAndTime();

	const showRealName = useMessageListShowRealName();
	const user: UserPresence = { ...message.u, roles: [], ...useUserData(message.u._id) };
	const usernameAndRealNameAreSame = !user.name || user.username === user.name;
	const showUsername = useMessageListShowUsername() && showRealName && !usernameAndRealNameAreSame;

	// const showRoles = useMessageListShowRoles();
	// const roles = useMessageRoles(message.u._id, message.rid, showRoles);
	// const shouldShowRolesList = roles.length > 0;

	const chat = useChat();
	const federated = Boolean(message?.u?.username.includes(':'));

	return (
		<FuselageMessageHeader>
			<MessageNameContainer>
				<MessageName
					{...(!showUsername && { 'data-qa-type': 'username' })}
					title={!showUsername && !usernameAndRealNameAreSame ? `@${user.username}` : undefined}
					data-username={user.username}
					{...(user.username !== undefined &&
						!federated &&
						chat?.userCard && {
							onClick: chat?.userCard.open(message.u.username),
							style: { cursor: 'pointer' },
						})}
				>
					{message.alias || getUserDisplayName(user.name, user.username, true)}
				</MessageName>
			</MessageNameContainer>

			{/**
			{shouldShowRolesList && <MessageRoles roles={roles} isBot={message.bot} />}
			*/}
			<MessageTimestamp title={formatMessageRecordDateAndTime(message.ts)}>
				{['search', 'mentions'].includes(context || '') ? formatMessageRecordDateAndTime(message.ts) : formatTime(message.ts)}
			</MessageTimestamp>

			{!MessageTypes.isAnnoucementMessage(message) && !['search', 'mentions'].includes(context || '') && !message.private && !uploading && (
				<ToolboxHolder message={message} context={context} showActionMenu={showActionMenu} />
			)}
			{/**
			{message.private && <MessageStatusPrivateIndicator>{t('Only_you_can_see_this_message')}</MessageStatusPrivateIndicator>}
			<StatusIndicators message={message} />
			 */}
		</FuselageMessageHeader>
	);
};

export default memo(MessageHeader);
