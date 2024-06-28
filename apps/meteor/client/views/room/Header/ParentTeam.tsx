import type { IRoom } from '@rocket.chat/core-typings';
import { TEAM_TYPE } from '@rocket.chat/core-typings';
import { Header } from '@rocket.chat/ui-client';
import { useUserId, useEndpoint } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React from 'react';

import { goToRoomById } from '../../../lib/utils/goToRoomById';

type APIErrorResult = { success: boolean; error: string };

const ParentTeam = ({ room }: { room: IRoom }): ReactElement | null => {
	const { teamId } = room;
	const userId = useUserId();

	if (!teamId) {
		throw new Error('invalid rid');
	}

	if (!userId) {
		throw new Error('invalid uid');
	}

	const teamsInfoEndpoint = useEndpoint('GET', '/v1/teams.info');
	const userTeamsListEndpoint = useEndpoint('GET', '/v1/users.listTeams');

	const {
		data: teamInfoData,
		isLoading: teamInfoLoading,
		isError: teamInfoError,
	} = useQuery(['teamId', teamId], async () => teamsInfoEndpoint({ teamId }), {
		refetchOnWindowFocus: false,
		keepPreviousData: true,
		retry: (_, error) => (error as APIErrorResult)?.error === 'unauthorized' && false,
	});

	const { data: userTeams, isLoading: userTeamsLoading } = useQuery(['userId', userId], async () => userTeamsListEndpoint({ userId }));

	const userBelongsToTeam = userTeams?.teams?.find((team) => team._id === teamId) || false;
	const isTeamPublic = teamInfoData?.teamInfo.type === TEAM_TYPE.PUBLIC;

	const teamMainRoomHref = (): void => {
		const rid = teamInfoData?.teamInfo.roomId;

		if (!rid) {
			return;
		}

		goToRoomById(rid);
	};

	if (teamInfoLoading || userTeamsLoading) {
		return <Header.Tag.Skeleton />;
	}

	if (teamInfoError) {
		return null;
	}

	if (isTeamPublic || userBelongsToTeam) {
		return (
			<Header.Tag>
				<Header.Link onClick={teamMainRoomHref}>
					<Header.Tag.Icon icon={{ name: isTeamPublic ? 'team' : 'team-lock' }} />
					{teamInfoData?.teamInfo.name}
				</Header.Link>
			</Header.Tag>
		);
	}

	return (
		<Header.Tag>
			<Header.Tag.Icon icon={{ name: isTeamPublic ? 'team' : 'team-lock' }} />
			{teamInfoData?.teamInfo.name}
		</Header.Tag>
	);
};

export default ParentTeam;
