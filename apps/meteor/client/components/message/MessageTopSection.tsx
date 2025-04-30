import type { IMessage } from '@rocket.chat/core-typings';
import { Box, CheckBox } from '@rocket.chat/fuselage';
import { useUserId } from '@rocket.chat/ui-contexts';
import { Space, Badge } from 'antd';
import React from 'react';

import type { MessageActionContext } from '../../../app/ui-utils/client/lib/MessageAction';
import MessageHeader from './MessageHeader';
import StatusIndicators from './StatusIndicators';
import MessageAvatar from './header/MessageAvatar';

interface IMessageTopSectionProps {
	message: IMessage;
	context?: MessageActionContext;
	sequential: boolean;
	selecting: boolean;
	showUserAvatar: boolean;
	selected: boolean;
	toggleSelected: () => void;
	uploading: boolean | undefined;
	chat: any;
	federated: boolean;
	style?: React.CSSProperties;
	showMessageTopSection?: boolean;
}

export const MessageTopSection = ({
	message,
	context,
	sequential,
	selecting,
	showUserAvatar,
	selected,
	toggleSelected,
	uploading,
	chat,
	federated,
	style,
	showMessageTopSection,
}: IMessageTopSectionProps) => {
	const uid = useUserId();
	return (
		<div
			className='rcx-message-top-section'
			style={{
				backgroundColor: message.u._id === uid ? '#BFDAFF' : '#F2F3F5',
				borderRadius: '8px',
				padding: '0 4px',
				height: '20px',
				display: 'inline-flex',
				alignItems: 'center',
				width: 'fit-content',
				gap: '4px',
				marginTop: '0.5px',
				visibility: !sequential ? 'visible' : 'hidden',
			}}
		>
			{message.u.username && showUserAvatar && (
				<>
					{/* <Badge
            offset={[-2, 14]}
            count={<ReactiveUserStatus className="reactive-user-status" uid={message.u._id} />}
          > */}
					<MessageAvatar
						emoji={message.emoji}
						avatarUrl={message.avatar}
						username={message.u.username}
						size='x16'
						{...(chat?.userCard &&
							!federated && {
								onClick: chat?.userCard.open(message.u.username, message.roomSender),
								style: { cursor: 'pointer', paddingLeft: '0.5px', paddingTop: '0.5px' },
							})}
						roomSender={message?.roomSender}
					/>
					{/* </Badge> */}
				</>
			)}
			{/* {selecting && !uploading && <CheckBox checked={selected} onChange={toggleSelected} />} */}
			{/* {sequential && <StatusIndicators message={message} />} */}
			<MessageHeader message={message} context={context} />
		</div>
	);
};

export default MessageTopSection;
