import type { IAuditLog } from '@rocket.chat/core-typings';
import { Box, TableCell, TableRow } from '@rocket.chat/fuselage';
import { useMediaQuery } from '@rocket.chat/fuselage-hooks';
import type { ReactElement } from 'react';
import React, { memo, useMemo } from 'react';

import UserAvatar from '../../../../../client/components/avatar/UserAvatar';
import { useFormatDateAndTime } from '../../../../../client/hooks/useFormatDateAndTime';
import AuditFiltersDisplay from './AuditFiltersDisplay';

type AuditLogEntryProps = { value: IAuditLog };

const AuditLogEntry = ({ value: { u, results, ts, _id, fields } }: AuditLogEntryProps): ReactElement => {
	const formatDateAndTime = useFormatDateAndTime();

	const { username, name, avatarETag } = u;

	const { msg, users, room, startDate, endDate } = fields;

	const when = useMemo(() => formatDateAndTime(ts), [formatDateAndTime, ts]);

	const mediaQuery = useMediaQuery('(min-width: 1024px)');

	return (
		<TableRow key={_id} tabIndex={0} role='link'>
			<TableCell withTruncatedText>
				<Box display='flex' alignItems='center'>
					{username && <UserAvatar size={mediaQuery ? 'x28' : 'x40'} title={username} username={username} etag={avatarETag} />}
					<Box display='flex' withTruncatedText marginInline={8}>
						<Box display='flex' flexDirection='column' alignSelf='center' withTruncatedText>
							<Box fontScale='p2m' withTruncatedText color='default'>
								{name || username}
							</Box>
							{name && (
								<Box fontScale='p2' color='hint' withTruncatedText>
									{' '}
									{`@${username}`}{' '}
								</Box>
							)}
						</Box>
					</Box>
				</Box>
			</TableCell>
			<TableCell fontScale='p2m' color='hint' withTruncatedText>
				{msg}
			</TableCell>
			<TableCell withTruncatedText>{when}</TableCell>
			<TableCell withTruncatedText>{results}</TableCell>
			<TableCell fontScale='p2' color='hint' withTruncatedText>
				<AuditFiltersDisplay users={users} room={room} startDate={startDate} endDate={endDate} />
			</TableCell>
		</TableRow>
	);
};

export default memo(AuditLogEntry);
