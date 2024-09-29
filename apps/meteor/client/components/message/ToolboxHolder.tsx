import type { IMessage } from '@rocket.chat/core-typings';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React, { memo, useRef, useEffect } from 'react';

import type { MessageActionContext } from '../../../app/ui-utils/client/lib/MessageAction';
import { useChat } from '../../views/room/contexts/ChatContext';
import { useIsVisible } from '../../views/room/hooks/useIsVisible';
import Toolbox from './toolbox/Toolbox';

type ToolboxHolderProps = {
	message: IMessage;
	context?: MessageActionContext;
	tab?: boolean;
	showActionMenu?: boolean;
};

const ToolboxHolder = ({ message, context, showActionMenu }: ToolboxHolderProps): ReactElement => {
	const ref = useRef(null);
	const [visible] = useIsVisible(ref); // 让被遮住的消息显示工具栏

	const chat = useChat();

	const [showAll, setShowAll] = useState(false);

	const getData = async () => {
		const room = await chat?.data.findRoom();
		const subscription = await chat?.data.findSubscription();
		return {
			room,
			subscription,
		};
	};

	const depsQueryResult = useQuery(['toolbox', message._id, context, message.attachments], getData);

	useEffect(() => {
		return () => {
			// 在组件卸载时取消订阅和异步任务
			if (depsQueryResult.cancel) {
				depsQueryResult.cancel();
			}
		};
	}, [depsQueryResult]);

	useEffect(() => {
		setShowAll(false);
	}, [showActionMenu]);

	return (
		<div className={`rcx-message-toolbox-override${showAll ? ' show-all' : ''}`} ref={ref}>
			{visible && depsQueryResult.isSuccess && depsQueryResult.data.room && (
				<Toolbox
					message={message}
					messageContext={context}
					room={depsQueryResult.data.room}
					subscription={depsQueryResult.data.subscription}
					showActionMenu={showActionMenu}
					callback={(showAll) => {
						setShowAll(showAll);
					}}
				/>
			)}
		</div>
	);
};

export default memo(ToolboxHolder);
