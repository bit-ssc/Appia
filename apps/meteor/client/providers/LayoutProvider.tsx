import { useBreakpoints } from '@rocket.chat/fuselage-hooks';
import { LayoutContext, useQueryStringParameter, useRoute, useSetting } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { useMemo, useState, useEffect } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { getUserPreference } from '../../app/utils/client/lib/getUserPreference';
import { useReactiveValue } from '../hooks/useReactiveValue';
import { createReactiveSubscriptionFactory } from '../lib/createReactiveSubscriptionFactory';

const getUserId = (): string | null => Meteor.userId();

function useUserPreference<T>(key: string, value: T): T {
	const userId = useReactiveValue(getUserId);

	const queryPreference = createReactiveSubscriptionFactory(
		<T,>(key: string, defaultValue?: T) => getUserPreference(userId, key, defaultValue) as T,
	);
	const [subscribe, getSnapshot] = useMemo(() => queryPreference(key, value), [queryPreference]);

	return useSyncExternalStore(subscribe, getSnapshot);
}

const LayoutProvider: FC = ({ children }) => {
	const showTopNavbarEmbeddedLayout = Boolean(useSetting('UI_Show_top_navbar_embedded_layout'));
	const [isCollapsed, setIsCollapsed] = useState(false);
	const layout = useQueryStringParameter('layout');

	const isEmbedded = layout === 'embedded';
	const breakpoints = useBreakpoints(); // ["xs", "sm", "md", "lg", "xl", xxl"]
	const appiaAvatarType = useUserPreference('appiaAvatarType', window.localStorage.getItem('appiaAvatarType') || 'normal');
	const showImageSummary = useUserPreference<boolean>('showImageSummary', true);
	const showDocumentSummary = useUserPreference<boolean>('showDocumentSummary', true);
	window.appiaAvatarType = appiaAvatarType;

	const isMobile = !breakpoints.includes('md');

	useEffect(() => {
		window.localStorage.setItem('appiaAvatarType', appiaAvatarType);
	}, [appiaAvatarType]);

	useEffect(() => {
		setIsCollapsed(isMobile);
	}, [isMobile]);

	const routeHome = useRoute('home');

	return (
		<LayoutContext.Provider
			children={children}
			value={useMemo(() => {
				console.log('dxd=============', breakpoints);
				return {
					isMobile,
					isEmbedded,
					showImageSummary,
					showDocumentSummary,
					showTopNavbarEmbeddedLayout,
					appiaAvatarType,
					sidebar: {
						isCollapsed,
						toggle: () => setIsCollapsed((isCollapsed) => !isCollapsed),
						collapse: () => setIsCollapsed(true),
						expand: () => setIsCollapsed(false),
						close: () => (isEmbedded ? setIsCollapsed(true) : routeHome.push()),
					},
					size: {
						sidebar: '240px',
						// eslint-disable-next-line no-nested-ternary
						// contextualBar: breakpoints.includes('sm') ? (breakpoints.includes('xl') ? '32%' : '320px') : '100%',
						contextualBar: '320px',
					},
					contextualBarExpanded: breakpoints.includes('sm'),
					// eslint-disable-next-line no-nested-ternary

					contextualBarPosition: 'absolute',
				};
			}, [
				isMobile,
				isEmbedded,
				showTopNavbarEmbeddedLayout,
				isCollapsed,
				breakpoints,
				routeHome,
				appiaAvatarType,
				showImageSummary,
				showDocumentSummary,
			])}
		/>
	);
};

export default LayoutProvider;
