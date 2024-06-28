import type { IMessage } from '@rocket.chat/core-typings';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React, { memo, useRef, useState } from 'react';

import type { MessageActionContext } from '../../../app/ui-utils/client/lib/MessageAction';
import { useChat } from '../../views/room/contexts/ChatContext';
import { useIsVisible } from '../../views/room/hooks/useIsVisible';
import Toolbox, { MemoizedElement } from './toolbox/Toolbox';

type ToolboxHolderProps = {
	message: IMessage;
	context?: MessageActionContext;
	tab?: boolean;
};

const ToolboxHolder = ({ message, context, tab }: ToolboxHolderProps): ReactElement => {
	const ref = useRef(null);
	const [visible] = useIsVisible(ref); // 让被遮住的消息显示工具栏

	const chat = useChat();
	const [allVisible, setAllVisible] = useState(false);

	const defaultOption = {
		id: 'more',
		icon: 'more',
		label: 'More',
		action: (e) => {
			setAllVisible(!allVisible);
		},
	};

	const depsQueryResult = useQuery(['toolbox', message._id, context], async () => {
		const room = await chat?.data.findRoom();
		const subscription = await chat?.data.findSubscription();
		return {
			room,
			subscription,
		};
	});

	const handleUpdateAllVisible = (visible: boolean) => {
		setAllVisible(visible);
	};

	return (
		<div
			className={tab ? 'rcx-message-toolbox rcx-message-toolbox-tab-right' : 'rcx-message-toolbox rcx-message-toolbox-nontab-right'}
			ref={ref}
		>
			{visible &&
				depsQueryResult.isSuccess &&
				depsQueryResult.data.room &&
				(allVisible ? (
					<Toolbox
						message={message}
						messageContext={context}
						room={depsQueryResult.data.room}
						subscription={depsQueryResult.data.subscription}
						updateAllVisible={handleUpdateAllVisible}
					/>
				) : (
					<div className='rcx-message-actions-container' key={'more'}>
						<MemoizedElement option={defaultOption} key={defaultOption.id} onlyMoreOption={true} updateVisible={handleUpdateAllVisible} />
					</div>
				))}
		</div>
	);
};

export default memo(ToolboxHolder);
