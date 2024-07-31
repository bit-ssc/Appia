import type { IRoom } from '@rocket.chat/core-typings';
import { Box, TableRow, TableCell, Avatar } from '@rocket.chat/fuselage';
import React from 'react';

import MarkdownText from '../../../../../components/MarkdownText';
import { RoomIcon } from '../../../../../components/RoomIcon';
import { useFormatDate } from '../../../../../hooks/useFormatDate';
import { roomCoordinator } from '../../../../../lib/rooms/roomCoordinator';
import RoomTags from '../../../RoomTags';

type TeamsTableRowProps = {
	onClick: (name: IRoom['name'], type: IRoom['t']) => (e: React.KeyboardEvent | React.MouseEvent) => void;
	team: IRoom & { roomsCount: number };
	mediaQuery: boolean;
};

const TeamsTableRow = ({ onClick, team, mediaQuery }: TeamsTableRowProps) => {
	const formatDate = useFormatDate();
	const { _id, ts, t, name, fname, topic, roomsCount } = team;
	const avatarUrl = roomCoordinator.getRoomDirectives(t).getAvatarPath(team);

	return (
		<TableRow key={_id} onKeyDown={onClick(name, t)} onClick={onClick(name, t)} tabIndex={0} role='link' action>
			<TableCell>
				<Box display='flex'>
					<Box flexGrow={0}>{avatarUrl && <Avatar size='x40' title={fname || name} url={avatarUrl} />}</Box>
					<Box flexGrow={1} mi='x8' withTruncatedText>
						<Box display='flex' alignItems='center'>
							<RoomIcon room={team} />
							<Box fontScale='p2m' mi='x4'>
								{fname || name}
							</Box>
							<RoomTags room={team} />
						</Box>
						{topic && <MarkdownText variant='inlineWithoutBreaks' fontScale='p2' color='hint' withTruncatedText content={topic} />}
					</Box>
				</Box>
			</TableCell>
			<TableCell fontScale='p2' color='hint' withTruncatedText>
				{roomsCount}
			</TableCell>
			{mediaQuery && ts && (
				<TableCell fontScale='p2' color='hint' withTruncatedText>
					{formatDate(ts)}
				</TableCell>
			)}
		</TableRow>
	);
};

export default TeamsTableRow;
