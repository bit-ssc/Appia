import React, { useMemo } from 'react';

import ForwardMultiHistory from './ForwardMultiHistory';
import { t } from '../../../../../app/utils/client';
import { imperativeModal } from '../../../../lib/imperativeModal';
import { normalizeSidebarMessage } from '../../../../sidebar/RoomList/normalizeSidebarMessage';
import type { IAppiaContentProps } from '../IAppia';
import '../appia.css';

export const getMessage = (user: any, lastMessage: any, t: (key: any) => void) => {
	if (!lastMessage) {
		return t('No_messages_yet');
	}
	if (!lastMessage.u) {
		return normalizeSidebarMessage(lastMessage, t);
	}
	if (lastMessage.u?.username === user?.username) {
		return `${t('You')}: ${normalizeSidebarMessage(lastMessage, t)}`;
	}
	return `${lastMessage.u.name || lastMessage.u.username}: ${normalizeSidebarMessage(lastMessage, t)}`;
};

export const getForwardMsgTitle = (msgData?: string): string => {
	if (!msgData) {
		return '';
	}
	const data = JSON.parse(msgData as string);
	let title = t('Chat_record');
	const names = data.originRoom?.names;
	if (names && names.length > 0) {
		title = names.length === 2 ? t('Chat_record_title_users', names) : t('Chat_record_title', { title: names[0] });
	} else if (data.originRoom?.name) {
		title = t('Chat_record_title', { title: data.originRoom.name });
	}
	return title;
};

const ForwardMsg: React.FC<IAppiaContentProps> = ({ msg, user = {}, room = {}, settings = {}, subscription }) => {
	const { msgData } = msg;
	const { messages, originRoom } = useMemo(() => {
		try {
			return JSON.parse(msgData as string);
		} catch (e) {
			return {};
		}
	}, [msgData]);

	let title = t('Chat_record');
	const names = originRoom?.names;
	if (names && names.length > 0) {
		title = names.length === 2 ? t('Chat_record_title_users', names) : t('Chat_record_title', { title: names[0] });
	} else if (originRoom?.name) {
		title = t('Chat_record_title', { title: originRoom.name });
	}
	const msgs = messages?.filter((_, i) => i < 2) || [];

	const openHistory = () => {
		imperativeModal.open({
			component: ForwardMultiHistory,
			props: {
				messages,
				title,
				room,
				settings,
				user,
				subscription,
				onClose: imperativeModal.close,
			},
		});
	};

	return (
		<div className='appia-approval-wrapper appia-approval-hover' onClick={openHistory}>
			<div className='appia-approval-header'>{title}</div>
			<div className='appia-approval-body'>
				{msgs.map((msg: any) => (
					<div key={msg._id} className='appia-approval-item'>
						{getMessage(user, msg, t)}
					</div>
				))}
			</div>
			<div className='appia-approval-footer'>
				<span>{t('Chat_record')}</span>
			</div>
		</div>
	);
};

export default ForwardMsg;
