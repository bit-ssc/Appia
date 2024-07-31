/* eslint-disable react/display-name */
import type { IMessage, IRoom, ISubscription } from '@rocket.chat/core-typings';
// import { isDirectMessageRoom, isMultipleDirectMessageRoom, isOmnichannelRoom, isVideoConfMessage } from '@rocket.chat/core-typings';
import { isOmnichannelRoom, isVideoConfMessage } from '@rocket.chat/core-typings';
// import { Badge, Sidebar, SidebarItemAction, SidebarItemActions, Margins } from '@rocket.chat/fuselage';
import { SidebarItemAction, SidebarItemActions, Margins, Box } from '@rocket.chat/fuselage';
import { Subscriptions } from '@rocket.chat/models';
import type { useTranslation } from '@rocket.chat/ui-contexts';
import { useLayout } from '@rocket.chat/ui-contexts';
import DOMPurify from 'dompurify';
import type { AllHTMLAttributes, ComponentType, ReactElement, ReactNode, CSSProperties } from 'react';
import React, { memo, useCallback, useMemo, useState } from 'react';

import { ChatSubscription } from '../../../app/models/client';
import { useOmnichannelPriorities } from '../../../ee/client/omnichannel/hooks/useOmnichannelPriorities';
import { PriorityIcon } from '../../../ee/client/omnichannel/priorities/PriorityIcon';
// import { RoomIcon } from '../../components/RoomIcon';
import { roomCoordinator } from '../../lib/rooms/roomCoordinator';
import { selectedMessageStore } from '../../views/room/providers/SelectedMessagesProvider';
import RoomMenu from '../RoomMenu';
import type { useAvatarTemplate } from '../hooks/useAvatarTemplate';
import { normalizeSidebarMessage } from './normalizeSidebarMessage';

const getMessage = (room: IRoom, lastMessage: IMessage | undefined, t: ReturnType<typeof useTranslation>): string | undefined => {
	if (!lastMessage) {
		return t('No_messages_yet');
	}
	if (isVideoConfMessage(lastMessage)) {
		return t('Call_started');
	}

	if (lastMessage.msgType === 'meeting_room') {
		return normalizeSidebarMessage(lastMessage, t);
	}

	let prefix = '';
	if (lastMessage.u) {
		if (lastMessage.u?.username !== room.u?.username) {
			const name = lastMessage.u.name || lastMessage.u.username;

			if (!lastMessage.msg && lastMessage.attachments?.find((attachment) => attachment.appiaSummary)) {
				prefix = t('__user__Send_Message', { user: name });
			} else {
				prefix = `${name}: `;
			}
		}
	}

	if (lastMessage.msgType === 'forwardMergeMessage') {
		return `${prefix}[${t('Chat_record')}]`;
	}

	return `${prefix}${normalizeSidebarMessage(lastMessage, t)}`;
	/**
	if (!lastMessage.u) {
		return normalizeSidebarMessage(lastMessage, t);
	}
	if (lastMessage.u?.username === room.u?.username) {
		return `${t('You')}: ${normalizeSidebarMessage(lastMessage, t)}`;
	}
	if (isDirectMessageRoom(room) && !isMultipleDirectMessageRoom(room)) {
		return normalizeSidebarMessage(lastMessage, t);
	}
	return `${lastMessage.u.name || lastMessage.u.username}: ${normalizeSidebarMessage(lastMessage, t)}`;
	 */
};

type RoomListRowProps = {
	extended: boolean;
	t: ReturnType<typeof useTranslation>;
	SideBarItemTemplate: ComponentType<
		{
			icon: ReactNode;
			title: ReactNode;
			avatar: ReactNode;
			actions: unknown;
			href: string;
			time?: Date;
			menu?: ReactNode;
			menuOptions?: unknown;
			subtitle?: ReactNode;
			titleIcon?: string;
			badges?: ReactNode;
			threadUnread?: boolean;
			unread?: boolean;
			selected?: boolean;
			is?: string;
			unReadCount?: number;
			showUnreadCount?: boolean;
			todoCount?: number;
		} & AllHTMLAttributes<HTMLElement>
	>;
	AvatarTemplate: ReturnType<typeof useAvatarTemplate>;
	openedRoom?: string;
	// sidebarViewMode: 'extended';
	isAnonymous?: boolean;

	room: ISubscription & IRoom;
	id?: string;
	/* @deprecated */
	style?: AllHTMLAttributes<HTMLElement>['style'];

	selected?: boolean;

	sidebarViewMode?: unknown;
	videoConfActions?: {
		[action: string]: () => void;
	};
	draft?: string;
	isSecondary?: boolean;
};

function SideBarItemTemplateWithData({
	room,
	id,
	selected,
	style,
	extended,
	SideBarItemTemplate,
	AvatarTemplate,
	t,
	isAnonymous,
	videoConfActions,
	draft,
	isSecondary,
}: RoomListRowProps): ReactElement {
	const { sidebar } = useLayout();

	const href = roomCoordinator.getRouteLink(room.t, room) || '';
	const title = roomCoordinator.getRoomName(room.t, room) || '';

	const {
		lastMessage,
		hideUnreadStatus,
		hideMentionStatus,
		unread = 0,
		// isRoomToDo,
		alert,
		userMentions,
		groupMentions,
		tunread = [],
		// tunreadUser = [],
		rid,
		t: type,
		cl,
		federated,
		todoCount,
		highTodoCount,
		showAppiaTag,
	} = room;

	const highlighted = Boolean(!hideUnreadStatus && (alert || unread));

	// 控制鼠标移开后菜单显示
	const [menuVisible, setMenuVisible] = useState<boolean>(true);

	/**
	const icon = (
		// TODO: Remove icon='at'
		<Sidebar.Item.Icon highlighted={highlighted} icon='at'>
			<RoomIcon room={room} placement='sidebar' isIncomingCall={Boolean(videoConfActions)} />
		</Sidebar.Item.Icon>
	);
	 */

	const actions = useMemo(
		() =>
			videoConfActions && (
				<SidebarItemActions>
					<SidebarItemAction onClick={videoConfActions.acceptCall} secondary success icon='phone' />
					<SidebarItemAction onClick={videoConfActions.rejectCall} secondary danger icon='phone-off' />
				</SidebarItemActions>
			),
		[videoConfActions],
	);

	const isQueued = isOmnichannelRoom(room) && room.status === 'queued';
	const { enabled: isPriorityEnabled } = useOmnichannelPriorities();

	let message = extended && getMessage(room, lastMessage, t);
	let lastMessageNode: ReactNode | undefined;
	let mentionMeNode: ReactNode | undefined;

	if (lastMessage && 'msgType' in lastMessage && lastMessage.msgType === 'oncall' && message) {
		if (lastMessage.u.username === room.u.username) {
			message = t('Voice_Call');
		} else {
			message = `${lastMessage.u.name}: ${t('Voice_Call')}`;
		}

		lastMessageNode = (
			<span
				className='message-body--unstyled'
				style={{ overflow: 'hidden', marginRight: '5px', textOverflow: 'ellipsis' }}
				dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message) }}
			/>
		);
	} else {
		lastMessageNode = message ? (
			<span
				className='message-body--unstyled'
				style={{ overflow: 'hidden', marginRight: '5px', textOverflow: 'ellipsis' }}
				dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message) }}
			/>
		) : null;
	}

	// if(isRoomToDo){
	// 	subtitle = <span style={{ color: '#F5455C' }}>{`[${t('Todos_room')}]`}{subtitle}</span>;
	// }

	const threadUnread = tunread.length > 0;
	const isUnread = unread > 0 || threadUnread;
	const showBadge = !hideUnreadStatus || (!hideMentionStatus && Boolean(userMentions));

	let unreadCount = unread + tunread?.length;
	if (unreadCount > 0 && !hideUnreadStatus && showBadge && isUnread) {
		/* 		let label = t("Todos_count")
		let count = todoCount
		if(highTodoCount !== undefined && highTodoCount > 0){
			label = t("Todos_hight_count")
			count = highTodoCount
		}
		todoNode =(<span style={{ color: '#F5455C' }}>{`[${count + label}]`}</span>); */

		if (unreadCount > 99) {
			unreadCount = 99;
		}
		messageBagdeNode = (
			<Box
				height='x16'
				borderRadius='x8'
				backgroundColor='#3677F2'
				fontSize='x10'
				lineHeight='x16'
				color='#fff'
				padding='0 5px'
				style={{
					marginLeft: 'auto',
					flexShrink: 0,
					marginRight: 0,
				}}
			>
				{unreadCount}
			</Box>
		);
	}

	(userMentions && userMentions > 0) || (groupMentions && groupMentions > 0) ? (
		<span style={{ color: '#F5455C' }}>[{t('Be_mentioned')}] </span>
	) : null;

	const draftNode = draft ? (
		<span>
			<span style={{ color: '#F5455C' }}>[{t('Draft')}]</span>
			{draft}
		</span>
	) : null;

	const subtitle: ReactNode | undefined = useMemo(() => {
		const styleInLine: CSSProperties = { display: 'flex', flexDirection: 'row', alignItems: 'center', overflow: 'hidden' };

		return (
			<div style={styleInLine}>
				{draftNode || mentionMeNode}
				{draftNode ? null : lastMessageNode}
				{/* {messageBagdeNode} */}
			</div>
		);
	}, [lastMessageNode, mentionMeNode, draftNode]);

	// const variant =
	// 	((userMentions || tunreadUser.length) && 'danger') || (threadUnread && 'primary') || (groupMentions && 'warning') || 'ghost';

	// const roomWithFavoriteOrTodo = room.f || (room.todoCount !== undefined && room.todoCount > 0) || room.isRoomToDo

	const badges = () => {
		let messageBagdeNode: ReactNode | undefined;
		let unreadCount = unread + tunread?.length;
		if (unreadCount > 0 && !hideUnreadStatus && showBadge && isUnread) {
			//  		let label = t("Todos_count")
			// let count = todoCount
			// if(highTodoCount !== undefined && highTodoCount > 0){
			// 	label = t("Todos_hight_count")
			// 	count = highTodoCount
			// }
			// todoNode =(<span style={{ color: '#F5455C' }}>{`[${count + label}]`}</span>);

			if (unreadCount > 99) {
				unreadCount = 99;
			}
			messageBagdeNode = (
				<Box
					height='x16'
					borderRadius='x8'
					backgroundColor='#3677F2'
					fontSize='x10'
					lineHeight='x16'
					color='#fff'
					padding='0 5px'
					style={{
						marginLeft: 'auto',
						flexShrink: 0,
						marginRight: 0,
					}}
				>
					{unreadCount}
				</Box>
			);
		}
		// console.info('badges', unreadCount, !hideUnreadStatus, showBadge, isUnread);
		return messageBagdeNode;
	};

	const sliderClick: () => void = useCallback(async () => {
		!selected && sidebar.toggle();
		selectedMessageStore.setIsSelecting(false);
		selectedMessageStore.clearStore();
		if (id?.includes('search')) {
			localStorage.setItem(`${room.rid}-searchTs`, new Date().getTime().toString());
			// await ChatSubscription.update(
			// 	{
			// 		'rid': room.rid,
			// 		'u._id': Meteor.userId(),
			// 	},
			// 	{
			// 		$set: {
			// 			searchTs: new Date(),
			// 			fname: '哈哈哈',
			// 		},
			// 	},
			// );
			//	await Subscriptions.updateOne({ 'rid': room.rid, 'u._id': Meteor.userId() }, { $set: { searchTs: new Date(), fname: '哈哈哈' } });
			// const result = await Subscriptions.find({});
			// console.info('result', result);
		}
	}, [id, room]);

	const setVisibleCallback: (value: boolean) => void = useCallback((value) => {
		setMenuVisible(value);
	}, []);
	// ['appia-sidebar-item', room.f && 'appia-sidebar-favorite-item'].filter(Boolean).join(' ')
	return (
		<div className={!isSecondary ? 'appia-sidebar-item' : 'appia-sidebar-item-secondary'}>
			<SideBarItemTemplate
				is='a'
				id={id}
				data-qa='sidebar-item'
				aria-level={2}
				unread={highlighted}
				selected={selected}
				href={href}
				onClick={sliderClick}
				federated={federated}
				showAppiaTag={showAppiaTag}
				containIcon={type !== 'd'}
				aria-label={title}
				title={title}
				time={lastMessage?.ts || room?.ts || room._updatedAt}
				subtitle={subtitle}
				// icon={icon}
				style={style}
				badges={badges()}
				unReadCount={todoCount || 0}
				showUnreadCount={todoCount && todoCount > 0}
				hideUnreadStatus={hideUnreadStatus}
				avatar={AvatarTemplate && <AvatarTemplate {...room} />}
				actions={actions}
				menu={
					!isAnonymous &&
					menuVisible &&
					(!isQueued || (isQueued && isPriorityEnabled)) &&
					((): ReactElement => (
						<RoomMenu
							// isRoomTodo={!!isRoomToDo}
							alert={alert}
							threadUnread={threadUnread}
							rid={rid}
							unread={!!unread}
							roomOpen={false}
							type={type}
							cl={cl}
							name={title}
							setVisibleCallback={setVisibleCallback}
							hideDefaultOptions={isQueued}
						/>
					))
				}
			/>
		</div>
	);
}

function safeDateNotEqualCheck(a: Date | string | undefined, b: Date | string | undefined): boolean {
	if (!a || !b) {
		return a !== b;
	}
	return new Date(a).toISOString() !== new Date(b).toISOString();
}

const keys: (keyof RoomListRowProps)[] = [
	'id',
	'style',
	'extended',
	'selected',
	'SideBarItemTemplate',
	'AvatarTemplate',
	't',
	'sidebarViewMode',
	'videoConfActions',
	'draft',
];

// eslint-disable-next-line react/no-multi-comp
export default memo(SideBarItemTemplateWithData, (prevProps, nextProps) => {
	if (keys.some((key) => prevProps[key] !== nextProps[key])) {
		return false;
	}

	if (prevProps.room === nextProps.room) {
		return true;
	}

	if (prevProps.room._id !== nextProps.room._id) {
		return false;
	}
	if (prevProps.room._updatedAt?.toISOString() !== nextProps.room._updatedAt?.toISOString()) {
		return false;
	}
	if (safeDateNotEqualCheck(prevProps.room.lastMessage?._updatedAt, nextProps.room.lastMessage?._updatedAt)) {
		return false;
	}
	if (prevProps.room.alert !== nextProps.room.alert) {
		return false;
	}
	if (isOmnichannelRoom(prevProps.room) && isOmnichannelRoom(nextProps.room) && prevProps.room?.v?.status !== nextProps.room?.v?.status) {
		return false;
	}
	if (prevProps.room.teamMain !== nextProps.room.teamMain) {
		return false;
	}

	if (prevProps.room.federated !== nextProps.room.federated) {
		return false;
	}

	if (
		isOmnichannelRoom(prevProps.room) &&
		isOmnichannelRoom(nextProps.room) &&
		prevProps.room.priorityWeight !== nextProps.room.priorityWeight
	) {
		return false;
	}

	return true;
});
