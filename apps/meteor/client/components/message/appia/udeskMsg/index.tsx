import type { IMessage } from '@rocket.chat/core-typings';
import DOMPurify from 'dompurify';
import { Random } from 'meteor/random';
import React, { useMemo, useRef, useEffect } from 'react';

import { callWithErrorHandling } from '../../../../lib/utils/callWithErrorHandling';
import { Faq } from './faq';
import { Survey } from './survey';
import { TopAsk } from './topAsk';
import { useRoom } from '../../../../views/room/contexts/RoomContext';

import { APIClient } from '/app/utils';

const UdeskMsg: React.FC<{ msg: IMessage }> = ({ msg }) => {
	const { msgData } = msg;
	const wrapperRef = useRef<HTMLDivElement>(null);
	const room = useRoom();

	useEffect(() => {
		const clickHandler = async (event: MouseEvent) => {
			const target = event.target as HTMLElement;

			if (target?.classList?.contains('km-bind-click-event') && room?.rid) {
				const content = target.getAttribute('data-content');
				const messageType = target.getAttribute('data-message-type');
				const invalid = target.getAttribute('data-invalid-transfer');

				if (content) {
					callWithErrorHandling('sendMessage', { _id: Random.id(), rid: room.rid, msg: content });
				} else if (messageType === '2' && !(invalid === 'true')) {
					await APIClient.post('/v1/robot/staffService/agent', {
						rid: room.rid,
					});
				}
			}
		};

		wrapperRef.current?.addEventListener('click', clickHandler, false);

		return () => {
			wrapperRef.current?.removeEventListener('click', clickHandler, false);
		};
	}, [room?.rid]);

	const {
		messages,
		assign_type: assignType,
		assign_info: assignInfo,
	} = useMemo(() => {
		try {
			return JSON.parse(msgData as string);
		} catch (e) {
			return {};
		}
	}, [msgData]);

	if (assignType === 'urobot') {
		if (assignInfo?.topAsk?.length) {
			return <TopAsk msg={msg} assignInfo={assignInfo} />;
		}

		if (messages?.ansType === 3) {
			return <Faq msg={msg} messageData={messages} />;
		}
	}

	const message = messages?.[0];

	if (message?.type === 'survey') {
		return <Survey msg={msg} messageData={message} />;
	}

	if (message?.type === 'image' && msg.msg) {
		return <img className='gallery-item' style={{ maxHeight: 360, maxWidth: 360 }} data-src={msg.msg as string} src={msg.msg as string} />;
	}

	return (
		<div ref={wrapperRef} className='udesk-content-wrapper' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.msg as string) }} />
	);
};

export default UdeskMsg;
