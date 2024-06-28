import { Badge, Skeleton } from '@rocket.chat/fuselage';
import React from 'react';

import { useAppRequestStats } from '../hooks/useAppRequestStats';

const MarketplaceRequestBadge = () => {
	const requestStatsResult = useAppRequestStats();

	if (requestStatsResult.isLoading)
		return requestStatsResult.fetchStatus !== 'idle' ? <Skeleton variant='circle' height='x16' width='x16' /> : null;

	if (requestStatsResult.isError) return null;

	if (!requestStatsResult.data.data.totalUnseen) {
		return null;
	}

	return <Badge variant='primary'>{requestStatsResult.data.data.totalUnseen}</Badge>;
};

export default MarketplaceRequestBadge;
