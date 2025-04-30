import type { IRoom } from '@rocket.chat/core-typings';
import { isThreadMessage } from '@rocket.chat/core-typings';
import { Box, MessageDivider } from '@rocket.chat/fuselage';
// import { useSetting, useTranslation, useUserPreference } from '@rocket.chat/ui-contexts';
import { useSetting, useUserPreference } from '@rocket.chat/ui-contexts';
import type { ReactElement, ComponentProps } from 'react';
import React, { Fragment, memo } from 'react';

import { appiaMessageList } from './appia-style';
import { useMessages } from './hooks/useMessages';
import { isMessageFirstUnread } from './lib/isMessageFirstUnread';
import { isMessageNewDay } from './lib/isMessageNewDay';
import { isMessageSequential } from './lib/isMessageSequential';
import MessageListProvider from './providers/MessageListProvider';
import { MessageTypes } from '../../../../app/ui-utils/client';
import RoomMessage from '../../../components/message/variants/RoomMessage';
import SystemMessage from '../../../components/message/variants/SystemMessage';
import ThreadMessagePreview from '../../../components/message/variants/ThreadMessagePreview';
import { useFormatDate } from '../../../hooks/useFormatDate';
import { useRoomSubscription } from '../contexts/RoomContext';
import { SelectedMessagesProvider } from '../providers/SelectedMessagesProvider';
import { appiaMessageList } from './appia-style';
import Broadcast from './broadcast';
import { useMessages } from './hooks/useMessages';
import { isMessageFirstUnread } from './lib/isMessageFirstUnread';
import { isMessageNewDay } from './lib/isMessageNewDay';
import { isMessageSequential } from './lib/isMessageSequential';
import { isMessageSequentialWithNext } from './lib/isMessageSequentialWithNext';
import { useTab } from '../contexts/ToolboxContext';
import MessageListProvider from './providers/MessageListProvider';

import ReminderMessage from '/client/components/message/variants/ReminderMessage';

type MessageListProps = {
	rid: IRoom['_id'];
	room: IRoom;
	scrollMessageList: ComponentProps<typeof MessageListProvider>['scrollMessageList'];
};

export const MessageList = ({ rid, room, scrollMessageList }: MessageListProps): ReactElement => {
	// const t = useTranslation();
	const messages = useMessages({ rid });
	const subscription = useRoomSubscription();
	const showUserAvatar = !!useUserPreference<boolean>('displayAvatars');
	const messageGroupingPeriod = Number(useSetting('Message_GroupingPeriod'));
	const formatDate = useFormatDate();

	const renderMsg = (
		visible: boolean,
		message: IMessage,
		shouldShowAsSequential: boolean,
		unread: boolean,
		mention: boolean,
		all: boolean,
		ignoredUser: boolean,
		isLastInSequence: boolean,
	) => {
		if (!visible) return null;
		// 群语音
		// const data = `{"initiatorMsg":"已取消","receiverMsg":"对方已取消","type":"cancel","channelId":"1711458962000","initiatorUsername":"chunjie.pei","receiverUsername":"haipeng.dou","roomType":"p","roomId":"65fbdffe6208809d9a1d9361"}`
		// if (Math.floor(Math.random()) * 10 < 5) {
		// 	return <Broadcast msgData={JSON.parse(data)} authorName={message.u.username} />
		// }
		// if ('msgType' in message && message.msgType === 'oncall' && (room.t === 'c' || (room.t === 'p' && 'msgData' in message))) {
		// 	// console.log(JSON.parse(message.msgData));

		// 	return <Broadcast msgData={JSON.parse(message.msgData)} authorName={message.u.name} />;
		// }
		// 正常消息
		return (
			<RoomMessage
				message={message}
				showUserAvatar={showUserAvatar}
				sequential={shouldShowAsSequential}
				isLastInSequence={isLastInSequence}
				unread={unread}
				mention={mention}
				all={all}
				room={room}
				ignoredUser={ignoredUser}
				tab={tab !== undefined}
			/>
		);
	};
	return (
		<MessageListProvider scrollMessageList={scrollMessageList}>
			<SelectedMessagesProvider>
				<Box className={appiaMessageList}>
					{messages.map((message, index, { [index - 1]: previous }) => {
						const sequential = isMessageSequential(message, previous, messageGroupingPeriod);
						const isLastInSequence = !isMessageSequentialWithNext(message, messages[index + 1], messageGroupingPeriod);

						const newDay = isMessageNewDay(message, previous);
						const firstUnread = isMessageFirstUnread(subscription, message, previous);
						const showDivider = newDay;

						const shouldShowAsSequential = sequential && !newDay;

						const system = MessageTypes.isSystemMessage(message);
						const visible = !isThreadMessage(message) && !system;

						const unread = Boolean(subscription?.tunread?.includes(message._id));
						const mention = Boolean(subscription?.tunreadUser?.includes(message._id));
						const all = Boolean(subscription?.tunreadGroup?.includes(message._id));
						const ignoredUser = Boolean(subscription?.ignored?.includes(message.u._id));

						return (
							<Fragment key={message._id}>
								{showDivider && <MessageDivider unreadLabel={undefined}>{newDay && formatDate(message.ts)}</MessageDivider>}

								{renderMsg(visible, message, shouldShowAsSequential, unread, mention, all, ignoredUser, isLastInSequence)}

								{/* {reminder && <ReminderMessage message={message} />} */}

								{isThreadMessage(message) && (
									<ThreadMessagePreview
										data-mid={message._id}
										data-tmid={message.tmid}
										data-unread={firstUnread}
										data-sequential={sequential}
										sequential={shouldShowAsSequential}
										message={message}
										showUserAvatar={showUserAvatar}
									/>
								)}

								{system && <SystemMessage room={room} showUserAvatar={showUserAvatar} message={message} />}
							</Fragment>
						);
					})}
				</Box>
			</SelectedMessagesProvider>
		</MessageListProvider>
	);
};

export default memo(MessageList);
