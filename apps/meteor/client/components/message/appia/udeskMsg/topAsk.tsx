import type { IMessage } from '@rocket.chat/core-typings';
import { Random } from 'meteor/random';
import React, { useMemo, useState } from 'react';

import { callWithErrorHandling } from '../../../../lib/utils/callWithErrorHandling';
import './styles.css';
import { classNames } from '../utils';

interface IOption {
	question: string;
}

interface ITopAsk {
	questionType: string;
	optionsList: IOption[];
}

export interface IProps {
	assignInfo: {
		leadingWord: string;
		topAsk: ITopAsk[];
	};
	msg: IMessage;
}

export const TopAsk: React.FC<IProps> = ({ assignInfo, msg }) => {
	const [tab, setTab] = useState<string>(assignInfo.topAsk?.length ? assignInfo.topAsk[0].questionType || '' : '');
	const topAsk = useMemo(() => {
		const map: Record<string, IOption[]> = {};

		assignInfo.topAsk?.forEach((topAsk) => {
			map[topAsk.questionType] = topAsk.optionsList;
		});
		return map;
	}, [assignInfo.topAsk]);

	return (
		<div className='udesk-top-ask-wrapper'>
			<div className='udesk-top-ask-title'>{assignInfo.leadingWord}</div>
			{assignInfo.topAsk?.length ? (
				<div>
					<ul className='udesk-top-ask-tabs'>
						{assignInfo.topAsk.map(({ questionType }) => (
							<li className={classNames({ active: tab === questionType })} key={questionType} onClick={() => setTab(questionType)}>
								{questionType}
							</li>
						))}
					</ul>

					{topAsk[tab]?.length ? (
						<ol className='udesk-top-ask-list'>
							{topAsk[tab].map(({ question }) => (
								<li
									key={question}
									onClick={async () => {
										await callWithErrorHandling('sendMessage', { _id: Random.id(), rid: msg.rid, msg: question });
									}}
								>
									{question}
								</li>
							))}
						</ol>
					) : null}
				</div>
			) : null}
		</div>
	);
};
