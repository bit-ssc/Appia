import { useRoute, useRouteParameter } from '@rocket.chat/ui-contexts';
import type { ReactElement, ReactNode } from 'react';
import React, { Suspense, useEffect } from 'react';

import MarketPlaceSidebar from './MarketplaceSidebar';
import PageSkeleton from '../../components/PageSkeleton';
import SidebarPortal from '../../sidebar/SidebarPortal';

const MarketplaceRouter = ({ children }: { children?: ReactNode }): ReactElement => {
	const currentContext = useRouteParameter('context') || 'all';
	const marketplaceRoute = useRoute('marketplace');

	useEffect(() => {
		const initialize = async () => {
			// The currentContext === 'all' verification is for users who bookmarked
			// the old marketplace
			// TODO: Remove the all verification in the future;
			if (currentContext === 'all') {
				marketplaceRoute.replace({ context: 'explore', page: 'list' });
			}
		};

		initialize();
	}, [currentContext, marketplaceRoute]);

	return children ? (
		<>
			<Suspense fallback={<PageSkeleton />}>{children}</Suspense>
			<SidebarPortal>
				<MarketPlaceSidebar />
			</SidebarPortal>
		</>
	) : (
		<PageSkeleton />
	);
};

export default MarketplaceRouter;