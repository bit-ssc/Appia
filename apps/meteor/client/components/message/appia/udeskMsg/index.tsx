import type { IMessage } from '@rocket.chat/core-typings';
import React, { useMemo } from 'react';

import { Faq } from './faq';
import { Survey } from './survey';
import { TopAsk } from './topAsk';

const UdeskMsg: React.FC<{ msg: IMessage }> = ({ msg }) => {
	const { msgData } = msg;

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

	return <div>{msg.msg}</div>;
};

export default UdeskMsg;
