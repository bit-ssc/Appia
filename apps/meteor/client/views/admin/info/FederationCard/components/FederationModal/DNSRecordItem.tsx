import { Box } from '@rocket.chat/fuselage';
import type { FC } from 'react';
import React from 'react';

import type { DNSRecord } from './Types';
import { SectionStatus } from '../Section';
import getStatusIcon from '../SectionStatusIcon';

export const DNSRecordItem: FC<{
	record: DNSRecord;
}> = ({ record: { status, title, expectedValue, value, hideErrorString } }) => (
	<Box display='flex' alignItems='flex-start'>
		{getStatusIcon(status)}
		<Box flexDirection='column' fontSize='x12'>
			<b>{title}</b>: {expectedValue} {!hideErrorString && status === SectionStatus.FAILED ? `(${value || '?'})` : ''}
		</Box>
	</Box>
);
