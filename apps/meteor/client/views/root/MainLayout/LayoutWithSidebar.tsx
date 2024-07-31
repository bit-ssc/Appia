import { Box } from '@rocket.chat/fuselage';
import { useLayout, useCurrentRoute, useRoutePath, useSetting, useCurrentModal, useRoute } from '@rocket.chat/ui-contexts';
import { PaletteStyleTag } from '@rocket.chat/ui-theming/src/PaletteStyleTag';
import { SidebarPaletteStyleTag } from '@rocket.chat/ui-theming/src/SidebarPaletteStyleTag';
import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';

import Sidebar from '../../../sidebar';
import MenuBar from '../MenuBar/MenuBar';

const list = ['/contact', '/embed'];

const LayoutWithSidebar = ({ children }: { children: ReactNode }): ReactElement => {
	const { isEmbedded: embeddedLayout } = useLayout();
	const [currentRouteName = '', currentParameters = {}] = useCurrentRoute();

	const modal = useCurrentModal();
	const currentRoutePath = useRoutePath(currentRouteName, currentParameters);
	const channelRoute = useRoute('channel');
	const removeSidenav = embeddedLayout && !currentRoutePath?.startsWith('/admin');
	const readReceiptsEnabled = useSetting('Message_Read_Receipt_Store_Users');

	const firstChannelAfterLogin = useSetting('First_Channel_After_Login');

	const redirected = useRef(false);

	const ua = navigator.userAgent;

	useEffect(() => {
		const needToBeRedirect = currentRoutePath && ['/', '/home'].includes(currentRoutePath);

		if (!needToBeRedirect) {
			return;
		}

		if (!firstChannelAfterLogin || typeof firstChannelAfterLogin !== 'string') {
			return;
		}

		if (redirected.current) {
			return;
		}
		redirected.current = true;

		channelRoute.push({ name: firstChannelAfterLogin });
	}, [channelRoute, currentRoutePath, firstChannelAfterLogin]);

	return (
		<Box className='main-wrapper'>
			{!/Rocket/.test(ua) && <MenuBar />}
			<Box
				bg='surface-light'
				id='rocket-chat'
				className={[embeddedLayout ? 'embedded-view' : undefined, 'menu-nav'].filter(Boolean).join(' ')}
				aria-hidden={Boolean(modal)}
			>
				<PaletteStyleTag />
				<SidebarPaletteStyleTag />
				{!removeSidenav ? <Sidebar /> : null}
				<div className={['rc-old', 'main-content', readReceiptsEnabled ? 'read-receipts-enabled' : undefined].filter(Boolean).join(' ')}>
					{children}
				</div>
			</Box>
		</Box>
	);
};

export default LayoutWithSidebar;
