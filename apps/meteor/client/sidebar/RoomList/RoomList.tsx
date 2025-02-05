import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import type { IRoom, ISubscription } from '@rocket.chat/core-typings';
import { css } from '@rocket.chat/css-in-js';
import { Box } from '@rocket.chat/fuselage';
import { useResizeObserver } from '@rocket.chat/fuselage-hooks';
import { useUserPreference, useUserId, useTranslation, useEndpoint } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useMemo, useEffect, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { useOpenedRoom } from '../../lib/RoomManager';
import { useDraft } from '../../views/root/contexts/DraftsProvider';
import { useMenuBarContext, EMenu } from '../../views/root/contexts/MenuBar';
import { useAvatarTemplate } from '../hooks/useAvatarTemplate';
import { usePreventDefault } from '../hooks/usePreventDefault';
import { useRoomList } from '../hooks/useRoomList';
import { useShortcutOpenMenu } from '../hooks/useShortcutOpenMenu';
import { useTemplateByViewMode } from '../hooks/useTemplateByViewMode';
import RoomListRow from './RoomListRow';
import ScrollerWithCustomProps from './ScrollerWithCustomProps';
import { appiaRoomsListStyle } from './appia-style';

const computeItemKey = (index: number, room: IRoom) => room._id || index;

export interface IBot {
	_id: string;
	_updatedAt: string;
	enable: boolean;
	fastModelApiKey: string;
	fastModelBotId: string;
	robotId: string;
	robotName: string;
	welcomeMsg: string;
	fname: string;
	name: string;
	bot: boolean;
	search: boolean;
	t: string;
}

type Room = Partial<
	IRoom &
		ISubscription &
		IBot & {
			tabTitle?: 'Todo' | 'Message' | 'HostChannel' | 'LikeChannel' | 'CommonChannel';
		}
>;

const RoomList = (): ReactElement => {
	const t = useTranslation();
	const isAnonymous = !useUserId();
	const rooms = useRoomList();
	const { menu } = useMenuBarContext();
	const draftContext = useDraft();
	const roomsList = useMemo(
		() =>
			rooms.filter((a) => {
				if (menu === EMenu.bot) {
					return a.bot;
				}

				if (menu === EMenu.channel) {
					return a.t === 'c';
				}

				return a.t !== 'c' && !a.bot;
			}),
		[menu, rooms],
	);
	const [bots, setBots] = useState<IBot[]>([]);
	const [allList, setAllList] = useState<Array<Room>>(roomsList);
	const [todoRoomVisible, setTodoRoomVisible] = useState(true);
	const [msgRoomVisible, setMsgRoomVisible] = useState(true);
	const [hostChannelVisible, setHostChannelVisible] = useState(true);
	const [likeChannelVisible, setLikeChannelVisible] = useState(true);
	const [commonChannelVisible, setCommonChannelVisible] = useState(true);

	const { todoRooms, msgRooms, todoRoomsDisplay, msgRoomsDisplay, todoAllCount, hostChannels, likeChannels, commonChannels } =
		useMemo(() => {
			const todoRooms: Room[] = [];
			const msgRooms: Room[] = [];
			let todoAllCount = 0;

			const roomSort = (a: Room, b: Room) => {
				const aTimeStamp = new Date(a.lastMessage?.ts || a.ts || a._updatedAt).getTime();
				const bTimeStamp = new Date(b.lastMessage?.ts || b.ts || b._updatedAt).getTime();

				const aDraft = localStorage.getItem(a.rid);
				const bDraft = localStorage.getItem(b.rid);

				const aSearchTs = localStorage.getItem(`${a.rid}-searchTs`);
				const bSearchTs = localStorage.getItem(`${b.rid}-searchTs`);

				if (aDraft && !bDraft) {
					return -1;
				}

				if (bDraft && !aDraft) {
					return 1;
				}

				if (aSearchTs && !bSearchTs && Number(aSearchTs) > bTimeStamp) {
					return -1;
				}

				if (bSearchTs && !aSearchTs && Number(bSearchTs) > aTimeStamp) {
					return 1;
				}

				return bTimeStamp - aTimeStamp;
			};

			const hostChannels: Room[] = [];
			const likeChannels: Room[] = [];
			const commonChannels: Room[] = [];

			if (allList.length > 0) {
				allList.sort(roomSort);
				allList.forEach((li) => {
					if (li.todoCount !== undefined && li.todoCount > 0) {
						todoRooms.push(li);
						todoAllCount += li.todoCount;
					} else if (li.t === 'c') {
						if (li.roles?.includes('owner')) {
							hostChannels.push(li);
						} else if (li.like) {
							likeChannels.push(li);
						} else {
							commonChannels.push(li);
						}
					} else {
						msgRooms.push(li);
					}
				});

				/* 			todoRooms.sort((a: Room, b: Room) => {
				// @ts-ignore
				if (a.highTodoCount > 0 && !b.highTodoCount) {
					return -1; // a应该排在b前面
				}

				// @ts-ignore
				if (b.highTodoCount > 0 && !a.highTodoCount) {
					return 1; // b应该排在a前面
				}
				// 其他情况不排序
				return 0;
			}); */
			}

			let todoRoomsDisplay: Room[] = [];
			let msgRoomsDisplay: Room[] = [];

      if (todoRooms.length > 0) {
        todoRoomsDisplay = [{ tabTitle: 'Todo' }, ...todoRooms];
        if (!todoRoomVisible && todoRooms.length > 2) {
          todoRoomsDisplay = todoRoomsDisplay.slice(0, 3);
        }
      }
			
			// if (msgRooms.length > 0) {
			if (menu === EMenu.channel) {
				if (msgRoomVisible) {
					msgRoomsDisplay = [
						{ tabTitle: 'Message' },
						...(hostChannels.length > 0 ? [{ tabTitle: 'HostChannel' }] : []),
						...(hostChannelVisible ? hostChannels : []),
						...(likeChannels.length > 0 ? [{ tabTitle: 'LikeChannel' }] : []),
						...(likeChannelVisible ? likeChannels : []),
						...(commonChannels.length > 0 ? [{ tabTitle: 'CommonChannel' }] : []),
						...(commonChannelVisible ? commonChannels : []),
					];
				} else {
					msgRoomsDisplay = [{ tabTitle: 'Message' }];
				}
			} else {
				msgRoomsDisplay = msgRoomVisible ? [{ tabTitle: 'Message' }, ...msgRooms] : [{ tabTitle: 'Message' }];
			}
			// }
			return {
				todoRooms,
				msgRooms,
				todoRoomsDisplay,
				msgRoomsDisplay,
				todoAllCount,
				hostChannels,
				likeChannels,
				commonChannels,
			};
		}, [allList, todoRoomVisible, msgRoomVisible, hostChannelVisible, likeChannelVisible, commonChannelVisible, draftContext.flag]);
	// @ts-ignore
	const getDepartment = useEndpoint('GET', '/v1/robot.findAll');

	useEffect(() => {
		(async () => {
			if (menu === 'bot') {
				try {
					// @ts-ignore
					const botArr = await getDepartment();
					// @ts-ignore
					setBots(botArr?.data);
				} catch (e) {
					console.log('robot.findAll', e);
				}
			}
		})();
	}, [getDepartment, menu]);

	useEffect(() => {
		if (menu === 'bot' && bots && bots.length > 0) {
			let arrBots: IBot[];
			if (roomsList && roomsList.length > 0) {
				arrBots = bots?.filter((item: IBot) => !roomsList.some((chat) => chat && chat?.name === item?.robotId));
			} else {
				arrBots = bots;
			}
			arrBots = arrBots.map((item) => ({
				...item,
				fname: item.robotName,
				name: item.robotId,
				t: 'd',
				bot: true,
				search: true,
				_id: item.robotId,
			}));
			// @ts-ignore
			setAllList([...roomsList, ...arrBots]);
		} else {
			setAllList(roomsList as unknown as Array<Room>);
		}
	}, [bots, menu, roomsList]);

	const avatarTemplate = useAvatarTemplate();
	const sideBarItemTemplate = useTemplateByViewMode();
	const { ref } = useResizeObserver({ debounceDelay: 100 });
	const openedRoom = useOpenedRoom() ?? '';
	const sidebarViewMode = useUserPreference<'extended' | 'medium' | 'condensed'>('sidebarViewMode') || 'extended';

	const extended = sidebarViewMode === 'extended';
	const itemData = useMemo(
		() => ({
			extended,
			t,
			SideBarItemTemplate: sideBarItemTemplate,
			AvatarTemplate: avatarTemplate,
			openedRoom,
			sidebarViewMode,
			isAnonymous,
		}),
		[avatarTemplate, extended, isAnonymous, openedRoom, sideBarItemTemplate, sidebarViewMode, t],
	);

	usePreventDefault(ref);
	useShortcutOpenMenu(ref);

	const roomsListStyle = css`
		position: relative;

		display: flex;
		flex-direction: column;

		overflow-x: hidden;
		overflow-y: hidden;

		flex: 1 1 auto;

		height: 100%;

		.tabTitle {
			padding: 0 8px 4px 8px;
			margin: 0 12px;
			color: #86909c;
			font-size: 14px;
			line-height: 22px;
			font-weight: 400;
			cursor: pointer;
		}

		.tabSecondTitle {
			margin: 5px 12px 0 20px;
		}

		.tabTitleTodo {
			padding: 0 8px 4px 8px;
			margin: 0 12px;
			cursor: pointer;
			display: flex;
			align-items: center;
		}

		.tabTitleTodoName {
			color: #86909c;
			font-size: 14px;
			line-height: 22px;
			font-weight: 400;
		}

		.allTodoCount {
			height: 14px;
			border-radius: 4px;
			background-color: #e34d59;
			font-size: 8px;
			line-height: 14px;
			color: #fff;
			padding: 0 4px;
			margin-left: 5px;
			display: inline-block;
		}

		.tabFold {
			font-size: 14px;
			line-height: 22px;
			color: #1b5bff;
			cursor: pointer;
			margin-left: 20px;
			marin-top: 20px;
		}

		.count {
			margin-left: 8px;
		}

		.badge {
			margin-right: 8px;
		}

		&--embedded {
			margin-top: 2rem;
		}

		&__list:not(:last-child) {
			margin-bottom: 22px;
		}

		&__type {
			display: flex;

			flex-direction: row;

			padding: 0 var(--sidebar-default-padding) 1rem var(--sidebar-default-padding);

			color: var(--rooms-list-title-color);

			font-size: var(--rooms-list-title-text-size);
			align-items: center;
			justify-content: space-between;

			&-text--livechat {
				flex: 1;
			}
		}

		&__empty-room {
			padding: 0 var(--sidebar-default-padding);

			color: var(--rooms-list-empty-text-color);

			font-size: var(--rooms-list-empty-text-size);
		}

		&__toolbar-search {
			position: absolute;
			z-index: 10;
			left: 0;

			overflow-y: scroll;

			height: 100%;

			background-color: var(--sidebar-background);

			padding-block-start: 12px;
		}

		@media (max-width: 400px) {
			padding: 0 calc(var(--sidebar-small-default-padding) - 4px);

			&__type,
			&__empty-room {
				padding: 0 calc(var(--sidebar-small-default-padding) - 4px) 0.5rem calc(var(--sidebar-small-default-padding) - 4px);
			}
		}
	`;

	return (
		<Box
			className={[roomsListStyle, appiaRoomsListStyle, 'sidebar--custom-colors'].filter(Boolean)}
			aria-label={t('Channels')}
			role='region'
		>
			<Box w='full' h='full' ref={ref}>
				<Virtuoso
					totalCount={todoRoomsDisplay.length + msgRoomsDisplay.length}
					data={[...todoRoomsDisplay, ...msgRoomsDisplay] as IRoom[]}
					components={{ Scroller: ScrollerWithCustomProps }}
					computeItemKey={computeItemKey}
					itemContent={(_, data): ReactElement => {
						if ((data as Room).tabTitle === 'Todo') {
							return (
								<div className='tabTitleTodo' onClick={() => setTodoRoomVisible(!todoRoomVisible)}>
									{todoRooms.length > 2 ? <span className='badge'>{todoRoomVisible ? <MinusOutlined /> : <PlusOutlined />}</span> : null}
									<span className='tabTitleTodoName'>{t((data as Room).tabTitle)}</span>
									{/* <span className='allTodoCount'>{todoAllCount}</span> */}
								</div>
							);
						}

						if ((data as Room).tabTitle === 'Message') {
							return (
                <>
								{
										todoRoomsDisplay.length > 0 ? <div
										style={{
											position:"relative",
											borderTop:'1px solid #E7E7E7',
											margin:"10px 0 14px 0",
											width: "calc(100% - 40px)",
											left: "20px"}}
										/> : null
								}
									<div className='tabTitle' onClick={() => setMsgRoomVisible(!msgRoomVisible)}>
										{<span className='badge'>{msgRoomVisible ? <MinusOutlined /> : <PlusOutlined />}</span>}
										<span>{t((data as Room).tabTitle)}</span>
									</div>
                </>
							);
						}

						if ((data as Room).tabTitle === 'HostChannel') {
							return (
								<div className='tabTitle tabSecondTitle' onClick={() => setHostChannelVisible(!hostChannelVisible)}>
									<span className='badge'>{hostChannelVisible ? <MinusOutlined /> : <PlusOutlined />}</span>
									<span className='tabTitleTodoName'>{`${t((data as Room).tabTitle)}（${hostChannels.length}）`}</span>
								</div>
							);
						}

						if ((data as Room).tabTitle === 'LikeChannel') {
							return (
								<div className='tabTitle tabSecondTitle' onClick={() => setLikeChannelVisible(!likeChannelVisible)}>
									<span className='badge'>{likeChannelVisible ? <MinusOutlined /> : <PlusOutlined />}</span>
									<span className='tabTitleTodoName'>{`${t((data as Room).tabTitle)}（${likeChannels.length}）`}</span>
								</div>
							);
						}

						if ((data as Room).tabTitle === 'CommonChannel') {
							return (
								<div className='tabTitle tabSecondTitle' onClick={() => setCommonChannelVisible(!commonChannelVisible)}>
									<span className='badge'>{commonChannelVisible ? <MinusOutlined /> : <PlusOutlined />}</span>
									<span className='tabTitleTodoName'>{`${t((data as Room).tabTitle)}（${commonChannels.length}）`}</span>
								</div>
							);
						}

						return (
							<RoomListRow
								data={itemData}
								item={data as IRoom & ISubscription & IBot}
								isSecondary={(menu === EMenu.channel && !data.todoCount}
							/>
						);
					}}
				/>
			</Box>
		</Box>
	);
};

export default RoomList;
