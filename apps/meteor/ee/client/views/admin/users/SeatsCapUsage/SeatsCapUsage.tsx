import { ProgressBar, Box } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

type SeatsCapUsageProps = {
	limit: number;
	members: number;
};

const SeatsCapUsage = ({ limit, members }: SeatsCapUsageProps): ReactElement => {
	const t = useTranslation();
	const percentage = Math.max(0, Math.min((100 / limit) * members, 100));
	const closeToLimit = percentage >= 80;
	const reachedLimit = percentage >= 100;
	const seatsLeft = Math.max(0, limit - members);

	return (
		<Box display='flex' flexDirection='column' minWidth='x180'>
			<Box
				color={reachedLimit ? 'status-font-on-danger' : 'default'}
				display='flex'
				flexDirection='row'
				justifyContent='space-between'
				fontScale='c1'
				mb='x8'
			>
				<div role='status'>{t('Seats_Available', { seatsLeft })}</div>
				<Box color={reachedLimit ? 'status-font-on-danger' : 'hint'}>{`${members}/${limit}`}</Box>
			</Box>
			<ProgressBar percentage={percentage} variant={closeToLimit ? 'danger' : 'success'} />
		</Box>
	);
};

export default SeatsCapUsage;
