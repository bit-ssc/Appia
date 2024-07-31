import { useTranslation, useCurrentRoute, useRouteParameter } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import AppsPageContent from './AppsPageContent';
import Page from '../../../components/Page';
import MarketplaceHeader from '../components/MarketplaceHeader';

type AppsContext = 'explore' | 'installed' | 'enterprise' | 'private';

const AppsPage = (): ReactElement => {
	const t = useTranslation();

	const [currentRouteName] = useCurrentRoute();
	if (!currentRouteName) {
		throw new Error('No current route name');
	}
	const context = useRouteParameter('context');

	return (
		<Page background='tint'>
			<MarketplaceHeader title={t(`Apps_context_${context as AppsContext}`)} />
			<Page.Content paddingInline='0'>
				<AppsPageContent />
			</Page.Content>
		</Page>
	);
};

export default AppsPage;
