import type { IMessage, IRoom, ISubscription, ITranslatedMessage } from '@rocket.chat/core-typings';
import { isThreadMessage, isRoomFederated } from '@rocket.chat/core-typings';
import { MessageToolboxWrapper } from '@rocket.chat/fuselage';
import { useUser, useSettings, useTranslation, useLayout } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React, { useRef, memo, useMemo, useEffect } from 'react';

import type { MessageActionContext, MessageActionConfig } from '../../../../app/ui-utils/client/lib/MessageAction';
import { MessageAction } from '../../../../app/ui-utils/client/lib/MessageAction';
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
	PictureIcon,
	DeploymentUnitIcon,
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

const fontSize = 20;

const icons = {
	forward: <ForwardIcon fontSize={fontSize} />,
	forward_combine: <ForwardCombineIcon fontSize={fontSize} />,
	set_todo: <SetToDo fontSize={fontSize} />,
	// set_hight_todo: <SetHightToDo fontSize={fontSize} />,
	completed_todo: <CompletedToDo fontSize={fontSize} />,
	file_download: <FileDownload fontSize={fontSize} />,
	delete_message: <RecallMsgIcon fontSize={fontSize} />,
	discussion_start: <NewGroupIcon fontSize={fontSize} />,
	quote_msg: <ReplyIcon fontSize={fontSize} />,
	imageSummaryOn: <DeploymentUnitIcon fontSize={fontSize} />,
	imageSummaryOff: <PictureIcon fontSize={fontSize} />,
	more: <MoreIcon fontSize={fontSize} />,
	like: <img src='images/custom_like.png' width={14} height={14} />,
	ok: <img src='images/custom_ok.png' width={21} height={12} />,
};

const leftMenusOriginal = [
	{
		id: 'Emoji_Like',
		label: 'Emoji_Like',
		icon: 'like',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		group: 'menu',
		canClick: true,
	},
	{
		id: 'Emoji_OK',
		label: 'Emoji_OK',
		icon: 'ok',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		group: 'menu',
		canClick: true,
	},
	{
		id: 'image_summary_on',
		icon: 'imageSummaryOn',
		label: 'Image_Summary',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		order: 0,
		group: 'menu',
		canClick: false,
	},
];

const notAllMenus = [
	{
		id: 'quote-message',
		icon: 'quote_msg',
		label: 'Quote',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		order: -5,
		group: ['message', 'menu'],
		canClick: false,
	},
	{
		id: 'completed_todo',
		icon: 'completed_todo',
		label: 'Completed_todo',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		order: -4,
		group: 'menu',
		canClick: false,
	},
	{
		id: 'set_todo',
		icon: 'set_todo',
		label: 'Set_todo',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		order: -3,
		group: 'menu',
		canClick: false,
	},
	{
		id: 'forward_combine',
		icon: 'forward_combine',
		label: 'Multi_Select',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		order: 1,
		group: 'menu',
		canClick: false,
	},
	{
		id: 'delete-message',
		icon: 'delete_message',
		label: 'Recall',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		color: 'alert',
		order: 3,
		group: 'menu',
		canClick: false,
	},
];

type MessageActionConfigOption = Omit<MessageActionConfig, 'condition' | 'context' | 'order' | 'action'> & {
	action: (event: UIEvent) => void;
};

type ToolboxProps = {
	message: IMessage & Partial<ITranslatedMessage>;
	messageContext?: MessageActionContext;
	room: IRoom;
	subscription?: ISubscription;
	showActionMenu?: boolean;
};

// eslint-disable-next-line react/display-name
export const MemoizedElement = React.memo(
	({ option }: { option: MessageActionConfigOption; updateVisible?: (visible: boolean) => void }) => {
		const t = useTranslation();
		const moreLeaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

		useEffect(() => {
			return () => {
				if (moreLeaveRef.current) {
					clearTimeout(moreLeaveRef.current);
				}
			};
		}, []);

		const clickActions = (option: MessageActionConfigOption, e: UIEvent) => {
			option.action(e);
		};

		const icon = icons[option.icon];
		return !['more'].includes(option.id) ? (
			<Tooltip title={t(option.label)} key={option.id} mouseEnterDelay={0.03} mouseLeaveDelay={0.03}>
				<div
					className={`rcx-message-action ${option.canClick ? '' : 'rcx-message-action-disabled'}`}
					onClick={(e) => clickActions(option, e)}
				>
					{icon}
				</div>
			</Tooltip>
		) : (
			<div className={'rcx-message-action'} key={option.id} onClick={(e) => clickActions(option, e)}>
				{icon}
			</div>
		);
	},
);

// eslint-disable-next-line react/no-multi-comp
const Toolbox = ({ message, messageContext, room, subscription }: ToolboxProps): ReactElement | null => {
	const { showImageSummary } = useLayout();

	const settings = useSettings();
	const user = useUser();

	const context = getMessageContext(message, room, messageContext);

	const mapSettings = useMemo(() => Object.fromEntries(settings.map((setting) => [setting._id, setting.value])), [settings]);

	const chat = useChat();

	const toolbox = useToolboxContext();

	const actionsQueryResult = useQuery(['rooms', room._id, 'messages', message._id, 'actions', showImageSummary] as const, async () => {
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
			const targetMenus = actionsQueryResult.data.menu
				.filter((item) => {
					if (!message.appiaTodo) {
						return item.id !== 'completed_todo';
					}
					if (message.appiaTodo?.status === 0) {
						return item.id !== 'set_todo';
					}
					return item.id !== 'set_todo' && item.id !== 'completed_todo';
				})
				.map((action) => ({
					...action,
					action: (e): void => action.action(e, { message, tabbar: toolbox, room, chat, autoTranslateOptions }),
				}));

			const allData = notAllMenus.filter((item) => {
				if (!message.appiaTodo) {
					return item.id !== 'completed_todo';
				}
				if (message.appiaTodo?.status === 0) {
					return item.id !== 'set_todo';
				}
				return item.id !== 'set_todo' && item.id !== 'completed_todo';
			});

			const resultMenus = allData.map((item) => {
				const result = targetMenus.find((target) => target.id === item.id);
				if (result) {
					return {
						...result,
						canClick: true,
					};
				}

				return item;
			});

			return resultMenus.reverse();
		}

		return [];
	};

	const leftMenus = useMemo(() => {
		if (actionsQueryResult?.data?.menu?.length) {
			const targetMenus = actionsQueryResult.data.menu.map((action) => ({
				...action,
				action: (e): void => action.action(e, { message, tabbar: toolbox, room, chat, autoTranslateOptions }),
			}));

			const resultMenus = leftMenusOriginal.map((item) => {
				const result = targetMenus.find((target) => target.id === item.id);
				if (result) {
					return {
						...result,
						canClick: true,
					};
				}
				if (item.id === 'Emoji_Like') {
					return {
						...item,
						action: () => {
							Meteor.call('setReaction', `:custom_like:`, message._id);
						},
					};
				}

				if (item.id === 'Emoji_OK') {
					return {
						...item,
						action: () => {
							Meteor.call('setReaction', `:custom_ok:`, message._id);
						},
					};
				}

				return item;
			});

			return resultMenus;
		}

		return [];
	}, [actionsQueryResult?.data?.menu]);

	const selecting = useIsSelecting();

	const autoTranslateOptions = useAutoTranslate(subscription);

	if (selecting) {
		return null;
	}

	return (
		<div className='rcx-message-actions-containers'>
			<MessageToolboxWrapper className='rcx-message-actions-container'>
				{leftMenus.map((option) => {
					return <MemoizedElement option={option} key={option.id} />;
				})}
			</MessageToolboxWrapper>

			<MessageToolboxWrapper className={'rcx-message-actions-container'}>
				{getOptions().map((option) => {
					return <MemoizedElement option={option} key={option.id} />;
				})}
			</MessageToolboxWrapper>
		</div>
	);
};

export default memo(Toolbox);
