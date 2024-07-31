import type { IconProps } from '@rocket.chat/fuselage';
import { Box, Sidebar, Icon, IconButton } from '@rocket.chat/fuselage';
import { useMutableCallback, usePrefersReducedMotion } from '@rocket.chat/fuselage-hooks';
import type { VFC } from 'react';
import React, { memo, useState } from 'react';

import { hasPermission, APPIA_TAG } from '../../../lib/utils/permission';
import { FederationIcon, GroupIcon } from '../../components/AppiaIcon';
import { useShortTimeAgo } from '../../hooks/useTimeAgo';
import { appiaRoomItemStyle } from './appia-style';

type ExtendedProps = {
	icon?: IconProps['name'];
	title?: React.ReactNode;
	avatar?: React.ReactNode | boolean;
	actions?: React.ReactNode;
	href?: string;
	time?: any;
	menu?: () => React.ReactNode;
	subtitle?: React.ReactNode;
	badges?: React.ReactNode;
	unread?: boolean;
	selected?: boolean;
	menuOptions?: any;
	titleIcon?: React.ReactNode;
	threadUnread?: boolean;
	hideUnreadStatus?: boolean;
	showAppiaTag?: number;
	unReadCount?: number;
	showUnreadCount?: boolean;
};

const Extended: VFC<ExtendedProps> = ({
	icon,
	title = '',
	avatar,
	actions,
	href,
	time,
	menu,
	menuOptions: _menuOptions,
	subtitle = '',
	hideUnreadStatus,
	titleIcon: _titleIcon,
	badges,
	threadUnread: _threadUnread,
	unread,
	unReadCount,
	showUnreadCount,
	selected,
	showAppiaTag,
	containIcon,
	...props
}) => {
	const formatDate = useShortTimeAgo();
	const [menuVisibility, setMenuVisibility] = useState(!!window.DISABLE_ANIMATION);

	const isReduceMotionEnabled = usePrefersReducedMotion();

	const handleMenu = useMutableCallback((e) => {
		setMenuVisibility(e.target.offsetWidth > 0 && Boolean(menu));
	});

	const handleMenuEvent = {
		[isReduceMotionEnabled ? 'onMouseEnter' : 'onTransitionEnd']: handleMenu,
	};

	return (
		<Sidebar.Item aria-selected={selected} selected={selected} highlighted={unread} {...props} {...({ href } as any)} clickable={!!href}>
			{avatar ? (
				<div style={{ position: 'relative' }}>
					<Sidebar.Item.Avatar>{avatar}</Sidebar.Item.Avatar>
					{showUnreadCount && unReadCount !== undefined && unReadCount > 0 ? (
						<Box
							style={{ position: 'absolute', top: 0, right: -3 }}
							position='absolute'
							height='x14'
							borderRadius='x4'
							backgroundColor='#E34D59'
							fontSize='x8'
							lineHeight='x14'
							color='#fff'
							padding='0 4px'
						>
							{unReadCount > 99 ? '99+' : unReadCount}
						</Box>
					) : null}
				</div>
			) : null}
			<Sidebar.Item.Content>
				<Sidebar.Item.Content>
					<Sidebar.Item.Wrapper>
						{icon}
						<Sidebar.Item.Title
							data-qa='sidebar-item-title'
							style={{ display: 'flex' }}
							className={(unread && 'rcx-sidebar-item--highlighted') as string}
						>
							<div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
							{containIcon ? <GroupIcon style={{ marginLeft: 5, flexShrink: 0 }} /> : null}
							{/* {hasPermission(showAppiaTag, APPIA_TAG.external) ? <FederationIcon style={{ marginLeft: 5, flexShrink: 0 }} /> : null} */}
						</Sidebar.Item.Title>
						{time && <Sidebar.Item.Time>{formatDate(time)}</Sidebar.Item.Time>}
					</Sidebar.Item.Wrapper>
				</Sidebar.Item.Content>
				<Sidebar.Item.Content>
					<Sidebar.Item.Wrapper>
						<Sidebar.Item.Subtitle className={(unread && 'rcx-sidebar-item--highlighted') as string}>{subtitle}</Sidebar.Item.Subtitle>
						{menu && (
							<Sidebar.Item.Menu {...handleMenuEvent}>
								{menuVisibility ? menu() : <IconButton mini rcx-sidebar-item__menu icon='kebab' />}
							</Sidebar.Item.Menu>
						)}

						{/* 显示 PriorityIcon，badge已经注释  */}
						{badges ? <Sidebar.Item.Badge>{badges}</Sidebar.Item.Badge> : null}
						{hideUnreadStatus && <Icon style={{ marginRight: '2px' }} name='bell-off' size={18} color='#9ca2a8' />}
					</Sidebar.Item.Wrapper>
				</Sidebar.Item.Content>
			</Sidebar.Item.Content>
			{actions && <Sidebar.Item.Container>{<Sidebar.Item.Actions>{actions}</Sidebar.Item.Actions>}</Sidebar.Item.Container>}
		</Sidebar.Item>
	);
};

const ExtendedWrapper: VFC<ExtendedProps> = (props) => (
	<Box className={appiaRoomItemStyle}>
		<Extended {...props} />
	</Box>
);

export default memo(ExtendedWrapper);
