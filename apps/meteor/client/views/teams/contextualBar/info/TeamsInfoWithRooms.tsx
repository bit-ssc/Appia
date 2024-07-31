import type { IRoom } from '@rocket.chat/core-typings';
import { Callout } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { useState, useMemo } from 'react';

import TeamsInfoWithData from './TeamsInfoWithData';
import VerticalBar from '../../../../components/VerticalBar';
import { AsyncStatePhase } from '../../../../hooks/useAsyncState';
import { useEndpointData } from '../../../../hooks/useEndpointData';
import EditChannelWithData from '../../../room/contextualBar/Info/EditRoomInfo';

type TeamsInfoWithRoomsProps = {
	rid: IRoom['_id'];
};

const TeamsInfoWithRooms = ({ rid }: TeamsInfoWithRoomsProps) => {
	const [editing, setEditing] = useState(false);
	const onClickBack = useMutableCallback(() => setEditing(false));
	const t = useTranslation();

	const params = useMemo(() => ({ roomId: rid }), [rid]);
	const { phase, value, error } = useEndpointData('/v1/rooms.info', { params });

	if (phase === AsyncStatePhase.LOADING) {
		return <VerticalBar.Skeleton />;
	}

	if (error) {
		return (
			<VerticalBar>
				<VerticalBar.Header>
					<VerticalBar.Icon name='info-circled' />
					<VerticalBar.Text>{t('Team_Info')}</VerticalBar.Text>
					<VerticalBar.Close />
				</VerticalBar.Header>
				<VerticalBar.ScrollableContent>
					<Callout type='danger'>{JSON.stringify(error)}</Callout>
				</VerticalBar.ScrollableContent>
			</VerticalBar>
		);
	}

	return editing ? (
		<EditChannelWithData onClickBack={onClickBack} rid={rid} />
	) : (
		<TeamsInfoWithData openEditing={setEditing} room={value.room} />
	);
};

export default TeamsInfoWithRooms;
