import type { IRoom } from '@rocket.chat/core-typings';
import { Header } from '@rocket.chat/ui-client';
import { useContacts, useTranslation, useUser } from '@rocket.chat/ui-contexts';
import { Tooltip } from 'antd';
import type { FC } from 'react';
import React, { useEffect, useState } from 'react';

import { IdCardIcon } from '../../../components/AppiaIcon';
import RoomAvatar from '../../../components/avatar/RoomAvatar';
import { useRoomContext } from '../contexts/RoomContext';
import { useToolboxContext } from '../contexts/ToolboxContext';
import AnnouncementPanel from './AnnouncementPanel';
import DepartmentName from './Appia/DepartmentName';
import ParentTeam from './ParentTeam';
import RoomTitle from './RoomTitle';
import ToDoPanel from './ToDoPanel';
import ToolBox from './ToolBox';
import Encrypted from './icons/Encrypted';
import Translate from './icons/Translate';
import './style/styles.css';

export type RoomHeaderProps = {
	room: IRoom;
	topic?: string;
	slots: {
		start?: unknown;
		preContent?: unknown;
		insideContent?: unknown;
		posContent?: unknown;
		end?: unknown;
		toolbox?: {
			pre?: unknown;
			content?: unknown;
			pos?: unknown;
		};
	};
};

const RoomHeader: FC<RoomHeaderProps> = ({ room, slots = {} }) => {
	const t = useTranslation();
	const user = useUser();
	const toolbox = useToolboxContext();
	const { getUserByUsername } = useContacts();
	const { setIsAnnouncementOpen, isAnnouncementOpen } = useRoomContext();
	const [isOpen, setIsOpen] = useState(true);

	let username: string | undefined = '';

	if (room.t === 'd' && user) {
		username = room?.usernames?.find((name) => name !== user.username);
	}
	const userStaff = getUserByUsername(username);
	useEffect(() => {
		setIsOpen(Boolean(toolbox && toolbox.activeTabBar && toolbox.activeTabBar.id !== '' && toolbox.activeTabBar.id !== 'todos'));
	}, [toolbox]);

	const headerOnClick = () => {
		if (isOpen) {
			toolbox.close();
		} else if (room.t === 'd') {
			toolbox.openRoomInfo(username);
		} else if (room.t === 'c') {
			toolbox.open('chanel-info', { room });
		} else if (room.t === 'p') {
			toolbox.open('team-info', { room });
		}
	};

	return (
		<div className='room_header'>
			{slots?.start}
			<div style={{ display: 'flex', flexDirection: 'row', width: '68%', height: '100%' }}>
				<ToDoPanel
					room={room}
					isOpen={isOpen}
					showTodosClick={() => {
						if (toolbox && toolbox.activeTabBar && toolbox.activeTabBar.id === 'todos') {
							toolbox.close();
						} else {
							toolbox.open('todos', { room });
						}
					}}
				/>
				{room.t !== 'd' && (
					<AnnouncementPanel
						room={room}
						showAnnouncementsClick={() => {
							setIsAnnouncementOpen && setIsAnnouncementOpen(!isAnnouncementOpen);
						}}
					/>
				)}
			</div>
			<Header.Avatar style={{ paddingLeft: 20 }}>
				<RoomAvatar room={room} roomHeader={true} style={{ cursor: 'pointer' }} onClick={headerOnClick} />
			</Header.Avatar>
			{slots?.preContent}
			<Header.Content>
				<Header.Content.Row>
					<RoomTitle
						room={room}
						onClick={() => {
							headerOnClick();
						}}
					/>
					{userStaff && userStaff.jobName ? (
						<Tooltip title={userStaff?.jobName}>
							<div className='department-item'>
								<IdCardIcon />
								{userStaff?.jobName}
							</div>
						</Tooltip>
					) : null}
				</Header.Content.Row>
				<Header.Content.Row>
					{room.teamId && !room.teamMain && <ParentTeam room={room} />}
					{username ? <DepartmentName username={username} /> : null}
					<Encrypted room={room} />
					<Translate room={room} />
					{slots?.insideContent}
				</Header.Content.Row>
			</Header.Content>
			{slots?.posContent}
			<Header.ToolBox aria-label={t('Toolbox_room_actions')} style={{ paddingRight: '10px' }}>
				{slots?.toolbox?.pre}
				{slots?.toolbox?.content || <ToolBox room={room} />}
				{slots?.toolbox?.pos}
			</Header.ToolBox>
			{slots?.end}
		</div>
	);
};

export default RoomHeader;
