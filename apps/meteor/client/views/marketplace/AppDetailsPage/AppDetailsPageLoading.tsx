import { Box, Skeleton } from '@rocket.chat/fuselage';
import type { FC } from 'react';
import React from 'react';

const AppDetailsPageLoading: FC = () => (
	<Box display='flex' flexDirection='row' mbe='x20' w='full'>
		<Skeleton variant='rect' w='x120' h='x120' mie='x32' />
		<Box display='flex' flexDirection='column' justifyContent='space-between' flexGrow={1}>
			<Skeleton variant='rect' w='full' h='x32' />
			<Skeleton variant='rect' w='full' h='x32' />
			<Skeleton variant='rect' w='full' h='x32' />
		</Box>
	</Box>
);

export default AppDetailsPageLoading;
