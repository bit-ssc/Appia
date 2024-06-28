import { isThreadMessage } from '@rocket.chat/core-typings';
import { Modal } from '@rocket.chat/fuselage';
import { useUserPreference } from '@rocket.chat/ui-contexts';
import React, { Fragment } from 'react';

// import { t } from '../../../../utils/client';
import { MessageTypes } from '../../../../../app/ui-utils/client';
// import { useFormatDate } from '../../../../hooks/useFormatDate';
// import { isMessageFirstUnread } from '../../../../views/room/MessageList/lib/isMessageFirstUnread';
// import { isMessageNewDay } from '../../../../views/room/MessageList/lib/isMessageNewDay';
// import { isMessageSequential } from '../../../../views/room/MessageList/lib/isMessageSequential';
import { SelectedMessagesProvider } from '../../../../views/room/providers/SelectedMessagesProvider';
import RoomMessage from '../../variants/RoomMessage';
import SystemMessage from '../../variants/SystemMessage';
import ThreadMessagePreview from '../../variants/ThreadMessagePreview';
import type { IForwardMsgHistoryProps } from '../IAppia';

const ForwardMultiHistory = ({ title, messages, room, settings, user, subscription, onClose }: IForwardMsgHistoryProps) => {
	const showUserAvatar = !!useUserPreference<boolean>('displayAvatars');
	// const messageGroupingPeriod = Number(useSetting('Message_GroupingPeriod'));
	// const formatDate = useFormatDate();
	console.info(settings, user);
	const renderMsg = (message: any) => {
		const sequential = false;

		// const newDay = isMessageNewDay(message, previous);
		// const firstUnread = isMessageFirstUnread(subscription, message, previous);
		// const showDivider = newDay;

		// const shouldShowAsSequential = sequential && !newDay;

		const system = MessageTypes.isSystemMessage(message);
		const visible = !isThreadMessage(message) && !system;

		const unread = Boolean(subscription?.tunread?.includes(message._id));
		const mention = Boolean(subscription?.tunreadUser?.includes(message._id));
		const all = Boolean(subscription?.tunreadGroup?.includes(message._id));
		const ignoredUser = Boolean(subscription?.ignored?.includes(message.u._id));

		return (
			<Fragment key={message._id}>
				{/* {showDivider && <MessageDivider unreadLabel={undefined}>{newDay && formatDate(message.ts)}</MessageDivider>} */}

				{visible && (
					<RoomMessage
						message={message}
						showUserAvatar={true}
						sequential={false}
						unread={unread}
						mention={mention}
						all={all}
						ignoredUser={ignoredUser}
					/>
				)}

				{isThreadMessage(message) && (
					<ThreadMessagePreview
						data-mid={message._id}
						data-tmid={message.tmid}
						data-unread={false}
						data-sequential={sequential}
						sequential={false}
						message={message}
						showUserAvatar={showUserAvatar}
					/>
				)}

				{system && <SystemMessage room={room} showUserAvatar={showUserAvatar} message={message} />}
			</Fragment>
		);
	};

	return (
		<Modal style={{ maxWidth: '720px', maxHeight: '80%', marginTop: '5%' }}>
			<Modal.Header>
				<Modal.Title style={{ fontSize: '16px' }}>{title}</Modal.Title>
				<Modal.Close onClick={onClose} />
			</Modal.Header>
			<Modal.Content style={{ margin: '0 12px 20px 0' }}>
				{/* <div className='appia-approval-header'>{title}</div>
				<div className='appia-approval-body'> */}
				<SelectedMessagesProvider>
					{messages.map((msg: any) =>
						// <div key={msg._id} className='appia-approval-item'>
						// 	{getMessage(user, msg, room.t)}
						// </div>
						renderMsg(msg),
					)}
				</SelectedMessagesProvider>
				{/* </div> */}
			</Modal.Content>
		</Modal>
	);
};

export default ForwardMultiHistory;
