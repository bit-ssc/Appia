import type { IUser } from '@rocket.chat/core-typings';
import { useSetting } from '@rocket.chat/ui-contexts';
import type { VFC } from 'react';
import React from 'react';

import RoomForewordUsernameListItem from './RoomForewordUsernameListItem';
import { roomCoordinator } from '../../../../../lib/rooms/roomCoordinator';

type RoomForewordUsernameListProps = { usernames: Array<NonNullable<IUser['username']>> };

const RoomForewordUsernameList: VFC<RoomForewordUsernameListProps> = ({ usernames }) => {
	const useRealName = Boolean(useSetting('UI_Use_Real_Name'));
	return (
		<>
			{usernames.map((username) => (
				<RoomForewordUsernameListItem
					username={username}
					key={username}
					href={roomCoordinator.getRouteLink('d', { name: username }) || undefined}
					useRealName={useRealName}
				/>
			))}
		</>
	);
};

export default RoomForewordUsernameList;
