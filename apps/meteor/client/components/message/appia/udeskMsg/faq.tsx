import type { IMessage } from '@rocket.chat/core-typings';
import { Random } from 'meteor/random';
import React, { useCallback } from 'react';

import { callWithErrorHandling } from '../../../../lib/utils/callWithErrorHandling';

import './styles.css';

export interface IProps {
	messageData: {
		ansContent: string;
		suggestQuestionList: { content: string }[];
	};
	msg: IMessage;
}

export const Faq: React.FC<IProps> = ({ messageData, msg }) => {
	const onSend = useCallback(
		async (value: string) => {
			await callWithErrorHandling('sendMessage', { _id: Random.id(), rid: msg.rid, msg: value });
		},
		[msg.rid],
	);

	return (
		<div className='udesk-faq-wrapper'>
			<div className='udesk-faq-title'>{messageData.ansContent}</div>
			{messageData.suggestQuestionList?.length ? (
				<div className='udesk-faq-body-wrapper'>
					<ul className='udesk-faq-list'>
						{messageData.suggestQuestionList.map(({ content }) => (
							<li key={content} onClick={() => onSend(content)}>
								{content}
							</li>
						))}
					</ul>
				</div>
			) : null}
		</div>
	);
};
