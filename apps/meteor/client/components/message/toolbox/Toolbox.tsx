import type { IMessage, IRoom, ISubscription, ITranslatedMessage } from '@rocket.chat/core-typings';
import { isThreadMessage, isRoomFederated } from '@rocket.chat/core-typings';
import { MessageToolboxWrapper } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useUser, useSettings, useTranslation } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React, { useRef, memo, useMemo, useState, useEffect } from 'react';

import type { MessageActionContext, MessageActionConfig } from '../../../../app/ui-utils/client/lib/MessageAction';
import { MessageAction } from '../../../../app/ui-utils/client/lib/MessageAction';
import { MessageTypes } from '../../../../app/ui-utils/server';
import { useIsSelecting } from '../../../views/room/MessageList/contexts/SelectedMessagesContext';
import { useAutoTranslate } from '../../../views/room/MessageList/hooks/useAutoTranslate';
import { useChat } from '../../../views/room/contexts/ChatContext';
import { useToolboxContext } from '../../../views/room/contexts/ToolboxContext';
import { Tooltip } from '../../AppiaUI';
import {
	ForwardCombineIcon,
	ForwardIcon,
	SetToDo,
	CompletedToDo,
	FileDownload,
	RecallMsgIcon,
	NewGroupIcon,
	ReplyIcon,
	MoreIcon,
} from '../../SvgIcons';

const getMessageContext = (message: IMessage, room: IRoom, context?: MessageActionContext): MessageActionContext => {
	if (context) {
		return context;
	}

	if (message.t === 'videoconf') {
		return 'videoconf';
	}

	if (isRoomFederated(room)) {
		return 'federated';
	}

	if (isThreadMessage(message)) {
		return 'threads';
	}

	return 'message';
};

const icons = {
	forward: <ForwardIcon fontSize={20} />,
	forward_combine: <ForwardCombineIcon fontSize={20} />,
	set_todo: <SetToDo fontSize={20} />,
	// set_hight_todo: <SetHightToDo fontSize={20} />,
	completed_todo: <CompletedToDo fontSize={20} />,
	file_download: <FileDownload fontSize={20} />,
	delete_message: <RecallMsgIcon fontSize={20} />,
	discussion_start: <NewGroupIcon fontSize={20} />,
	quote_msg: <ReplyIcon fontSize={20} />,
	more: <MoreIcon fontSize={20} />,
};

type MessageActionConfigOption = Omit<MessageActionConfig, 'condition' | 'context' | 'order' | 'action'> & {
	action: (event: UIEvent) => void;
};

type ToolboxProps = {
	message: IMessage & Partial<ITranslatedMessage>;
	messageContext?: MessageActionContext;
	room: IRoom;
	subscription?: ISubscription;
	updateAllVisible: (visible: boolean) => void;
};

// eslint-disable-next-line react/display-name
export const MemoizedElement = React.memo(
	({
		option,
		updateVisible,
		onlyMoreOption,
	}: {
		option: MessageActionConfigOption;
		updateVisible?: (visible: boolean) => void;
		onlyMoreOption?: boolean;
	}) => {
		const t = useTranslation();
		const moreLeaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

		useEffect(() => {
			return () => {
				if (moreLeaveRef.current) {
					clearTimeout(moreLeaveRef.current);
				}
			};
		}, []);

		const handleMouseEnter = () => {
			updateVisible?.(true);
		};

		const handleMouseLeave = () => {
			if (moreLeaveRef.current) {
				clearTimeout(moreLeaveRef.current);
			}
			moreLeaveRef.current = setTimeout(() => {
				updateVisible?.(false);
			}, 100);
		};

		const clickActions = (option: MessageActionConfigOption, e: UIEvent) => {
			option.action(e);
		};

		const icon = icons[option.icon];
		return option.id !== 'more' ? (
			<Tooltip
				title={t(option.label)}
				key={option.id}
				mouseEnterDelay={0.03}
				mouseLeaveDelay={0.03}
				// defaultOpen={option.id === 'quote-message'}
			>
				<div className='rcx-message-action' onClick={(e) => clickActions(option, e)}>
					{icon}
				</div>
			</Tooltip>
		) : (
			<div
				className={'rcx-message-action'}
				key={option.id}
				onClick={(e) => clickActions(option, e)}
				onMouseEnter={onlyMoreOption ? handleMouseEnter : undefined}
				onMouseLeave={onlyMoreOption ? handleMouseLeave : undefined}
			>
				{icon}
			</div>
		);
	},
);

const Toolbox = ({ message, messageContext, room, subscription, updateAllVisible }: ToolboxProps): ReactElement | null => {
	// const [visible, setVisible] = useState(false);

	const toggleVisible = () => updateAllVisible(false);

	const settings = useSettings();
	const user = useUser();

	const context = getMessageContext(message, room, messageContext);

	const mapSettings = useMemo(() => Object.fromEntries(settings.map((setting) => [setting._id, setting.value])), [settings]);

	const chat = useChat();

	const handleUpdateVisible = (visible: boolean) => {
		console.info('handleUpdateVisible=======');
		updateAllVisible(visible);
	};

	const actionsQueryResult = useQuery(['rooms', room._id, 'messages', message._id, 'actions'] as const, async () => {
		const messageActions = await MessageAction.getButtons(
			{ message, room, user: user ?? undefined, subscription, settings: mapSettings, chat },
			context,
			'message',
		);
		const menuActions = await MessageAction.getButtons(
			{ message, room, user: user ?? undefined, subscription, settings: mapSettings, chat },
			context,
			'menu',
		);

		return { message: messageActions, menu: menuActions };
	});

	const getOptions = () => {
		if (actionsQueryResult?.data?.menu?.length) {
			const targetMenus = actionsQueryResult.data.menu.filter((item) => {
				if (!message.appiaTodo) {
					return item.id !== 'completed_todo';
				}
				if (message.appiaTodo?.status === 0) {
					return item.id !== 'set_todo';
				}
				return item.id !== 'set_todo' && item.id !== 'completed_todo';
			});

			targetMenus.splice(0, 0, {
				id: 'more',
				icon: 'more',
				label: 'More',
				action: (e) => {
					toggleVisible();
				},
			});

			return targetMenus
				.map((action) => ({
					...action,
					action: (e): void => action.action(e, { message, tabbar: toolbox, room, chat, autoTranslateOptions }),
				}))
				.reverse();
		}

		return [];
	};

	const toolbox = useToolboxContext();

	const selecting = useIsSelecting();

	const autoTranslateOptions = useAutoTranslate(subscription);

	if (selecting) {
		return null;
	}

	// const options = getOptions() as MessageActionConfigOption[];
	// if (MessageTypes.isSystemMessage(message)) {
	// 	return null;
	// }

	return (
		<>
			<MessageToolboxWrapper
				className='rcx-message-actions-container'
				onMouseEnter={() => {
					// console.info('onMouseEnter--parent', message.msg);
					updateAllVisible(true);
				}}
				onMouseLeave={() => {
					// console.info('onMouseLeave--parent', message.msg);
					updateAllVisible(false);
				}}
			>
				{getOptions().map((option) => {
					return <MemoizedElement option={option} key={option.id} />;
				})}
			</MessageToolboxWrapper>
		</>
	);
};

export default memo(Toolbox);
