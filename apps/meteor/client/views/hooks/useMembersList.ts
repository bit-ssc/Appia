import type { IUser } from '@rocket.chat/core-typings';
import { useEndpoint } from '@rocket.chat/ui-contexts';
import { useCallback, useMemo, useState } from 'react';

import { useScrollableRecordList } from '../../hooks/lists/useScrollableRecordList';
import { useComponentDidUpdate } from '../../hooks/useComponentDidUpdate';
import { RecordList } from '../../lib/lists/RecordList';
import { getConfig } from '../../lib/utils/getConfig';

type MembersListOptions = {
	rid: string;
	type: 'all' | 'online';
	limit: number;
	debouncedText: string;
	roomType: 'd' | 'p' | 'c';
};

const endpointsByRoomType = {
	d: '/v1/im.members',
	p: '/v1/groups.members',
	c: '/v1/channels.members',
} as const;

export const useMembersList = (
	options: MembersListOptions,
): {
	membersList: RecordList<IUser>;
	initialItemCount: number;
	reload: () => void;
	loadMoreItems: (start: number, end: number) => void;
} => {
	const getMembers = useEndpoint('GET', endpointsByRoomType[options.roomType]);
	const [membersList, setMembersList] = useState(() => new RecordList<IUser>());
	const reload = useCallback(() => setMembersList(new RecordList<IUser>()), []);

	useComponentDidUpdate(() => {
		options && reload();
	}, [options, reload]);

	const fetchData = useCallback(
		async (start, end) => {
			const { members, total } = await getMembers({
				roomId: options.rid,
				offset: start,
				count: end,
				...(options.debouncedText && { filter: options.debouncedText }),
				...(options.type !== 'all' && { status: [options.type] }),
			});

			return {
				items: members.map((members: any) => {
					members._updatedAt = new Date(members._updatedAt);
					return members;
				}),
				itemCount: total,
			};
		},
		[getMembers, options],
	);

	const { loadMoreItems, initialItemCount } = useScrollableRecordList(
		membersList,
		fetchData,
		useMemo(() => parseInt(`${getConfig('teamsChannelListSize', 30)}`), []),
	);

	return {
		reload,
		membersList,
		loadMoreItems,
		initialItemCount,
	};
};
