import { Box } from '@rocket.chat/fuselage';
import { useSessionDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';
import type { FC } from 'react';
import React, { useEffect, useState } from 'react';

import { getIconByName, getMenuNameByType } from './MenuIcon';
import { useLogoSquare } from '../../../hooks/useAssets';
import UserAvatarButton from '../../../sidebar/header/UserAvatarButton';

enum Menu {
	home = 'home',
	channel = 'channel',
	contact = 'contact',
	workspace = 'workspace',
	document = 'document',
}

const menuMap = new Map<Menu, string>([
	// [Menu.channel, '/home?type=channel'],
	[Menu.contact, '/contact'],
	[Menu.workspace, '/embed?url=/appia_fe/workspace'],
	[Menu.document, '/embed?url=/appia_fe/docs'],
]);

// const displayColor = (current: Menu, active: Menu): string => (current === active ? '#1276e9' : '#7d7d7d');
let lastOtherRoom: string;
let lastChannelRoom: string;
const MenuBar: FC = () => {
	const [menu, setMenu] = useState<Menu>(Menu.home);
	const [unread, setUnread] = useState<number>(0);
	const [unreadChannel, setUnreadChannel] = useState<number>(0);
	const logoSquare = useLogoSquare();
	const setMenuState = useSessionDispatch('menu');
	const t = useTranslation();
	const handleClick = (menu: Menu) => (): void => {
		const lastRoom = menu === Menu.channel ? lastChannelRoom : lastOtherRoom;
		if (location.pathname.startsWith('/direct/') || location.pathname.startsWith('/group/')) {
			lastOtherRoom = `${location.pathname}?menu=home`;
		} else if (location.pathname.startsWith('/channel/')) {
			lastChannelRoom = `${location.pathname}?menu=channel`;
		}
		if (menu === Menu.home || menu === Menu.channel) {
			if (lastRoom) {
				FlowRouter.go(lastRoom);
			} else {
				FlowRouter.redirect(`/home?menu=${menu}`);
			}
		} else {
			FlowRouter.go(menuMap.get(menu) || '/home');
		}
		setMenuState(menu);
	};
	useEffect(() => {
		const map = new Map();
		menuMap.forEach((value, key) => {
			map.set(value, key);
		});
		const timer = setInterval(() => {
			const { pathname, search } = window.location;
			const path = `${pathname}${search}`;
			let activeMenu = map.get(path) || Menu.home;

			if (activeMenu === Menu.home) {
				menuMap.set(Menu.home, FlowRouter.current().path);
				const isChannel = location.pathname.startsWith('/channel/') || FlowRouter.getQueryParam('menu') === Menu.channel;
				if (isChannel && activeMenu !== Menu.channel) {
					activeMenu = Menu.channel;
					setMenuState(activeMenu);
				} else if (!isChannel && activeMenu === Menu.home) {
					setMenuState(menu);
				}
			}

			setMenu(activeMenu);

			setUnread(Session.get('unreadOther') || 0);
			setUnreadChannel(Session.get('unreadChannel') || 0);
		}, 50);

		return (): void => {
			clearInterval(timer);
		};
	}, []);

	return (
		<div className='menubar-wrapper'>
			<div className='menubar-logo'>
				<Box is='img' w={56} h={56} src={logoSquare} />
			</div>

			<div className='menubar'>
				<div
					className={`menubar-icon ${Menu.home === menu ? 'menubar-icon-active' : ''}`}
					style={{
						position: 'relative',
					}}
					onClick={handleClick(Menu.home)}
					data-placement='right-middle'
					title={t('Appia_Discussion_Info')}
				>
					{getIconByName('chat', Menu.home === menu)}
					<div className='menubar-name'>{getMenuNameByType('chat')}</div>
					{unread > 0 && (
						<Box
							style={{ position: 'absolute', top: '5px', right: '3px' }}
							position='absolute'
							height='x16'
							borderRadius='x8'
							backgroundColor='#d91f1b'
							fontSize='x10'
							lineHeight='x16'
							color='#fff'
							padding='0 5px'
						>
							{unread > 99 ? '99+' : unread}
						</Box>
					)}
				</div>
				<div
					className={`menubar-icon ${Menu.channel === menu ? 'menubar-icon-active' : ''}`}
					style={{
						position: 'relative',
					}}
					onClick={handleClick(Menu.channel)}
					data-placement='right-middle'
					title={t('Appia_Channel_Info')}
				>
					{getIconByName('channel', Menu.channel === menu)}
					<div className='menubar-name'>{getMenuNameByType('channel')}</div>
					{unreadChannel > 0 && (
						<Box
							style={{ position: 'absolute', top: '5px', right: '3px' }}
							position='absolute'
							height='x16'
							borderRadius='x8'
							backgroundColor='#d91f1b'
							fontSize='x10'
							lineHeight='x16'
							color='#fff'
							padding='0 5px'
						>
							{unreadChannel > 99 ? '99+' : unreadChannel}
						</Box>
					)}
				</div>
				<div
					className={`menubar-icon ${Menu.workspace === menu ? 'menubar-icon-active' : ''}`}
					onClick={handleClick(Menu.workspace)}
					title={getMenuNameByType('workspace') as unknown as string}
					data-placement='right-middle'
				>
					{getIconByName('workspace', Menu.workspace === menu)}
					<div className='menubar-name'>{getMenuNameByType('workspace')}</div>
				</div>
				<div
					className={`menubar-icon ${Menu.contact === menu ? 'menubar-icon-active' : ''}`}
					onClick={handleClick(Menu.contact)}
					title={t('Appia_Contact_Info')}
					data-placement='right-middle'
				>
					{getIconByName('contact', Menu.contact === menu)}
					<div className='menubar-name'>{getMenuNameByType('contact')}</div>
				</div>
			</div>

			<div className='menubar-avatar'>
				<UserAvatarButton />
			</div>
		</div>
	);
};

export default MenuBar;
