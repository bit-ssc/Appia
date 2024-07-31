import type { App } from '@rocket.chat/core-typings';
import { Box, Pagination } from '@rocket.chat/fuselage';
import type { PaginatedResult } from '@rocket.chat/rest-typings';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';

import FeaturedAppsSections from './FeaturedAppsSections';
import type { AsyncState } from '../../../lib/asyncState';
import AppsList from '../AppsList';

type AppsPageContentBodyProps = {
	isMarketplace: boolean;
	isFiltered: boolean;
	appsResult: AsyncState<
		{ items: App[] } & { shouldShowSearchText: boolean } & PaginatedResult & { allApps: App[] } & { totalAppsLength: number }
	>;
	itemsPerPage: 25 | 50 | 100;
	current: number;
	onSetItemsPerPage: React.Dispatch<React.SetStateAction<25 | 50 | 100>>;
	onSetCurrent: React.Dispatch<React.SetStateAction<number>>;
	paginationProps: {
		itemsPerPageLabel: () => string;
		showingResultsLabel: (context: { count: number; current: number; itemsPerPage: 25 | 50 | 100 }) => string;
	};
	noErrorsOcurred: boolean;
};

const AppsPageContentBody = ({
	isMarketplace,
	isFiltered,
	appsResult,
	itemsPerPage,
	current,
	onSetItemsPerPage,
	onSetCurrent,
	paginationProps,
	noErrorsOcurred,
}: AppsPageContentBodyProps) => {
	const t = useTranslation();

	return (
		<>
			<Box display='flex' flexDirection='column' overflow='hidden' height='100%' pi='x24'>
				{noErrorsOcurred && (
					<Box overflowY='scroll' height='100%'>
						{isMarketplace && !isFiltered && <FeaturedAppsSections appsResult={appsResult?.value?.allApps || []} />}
						<AppsList apps={appsResult?.value?.items || []} title={isMarketplace ? t('All_Apps') : ''} />
					</Box>
				)}
			</Box>
			{Boolean(appsResult?.value?.count) && (
				<Pagination
					divider
					current={current}
					itemsPerPage={itemsPerPage}
					count={appsResult?.value?.total || 0}
					onSetItemsPerPage={onSetItemsPerPage}
					onSetCurrent={onSetCurrent}
					bg='light'
					{...paginationProps}
				/>
			)}
		</>
	);
};

export default AppsPageContentBody;
