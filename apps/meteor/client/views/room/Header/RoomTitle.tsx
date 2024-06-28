import type { IRoom } from '@rocket.chat/core-typings';
import { Header } from '@rocket.chat/ui-client';
import type { ReactElement } from 'react';
import React from 'react';

// import HeaderIconWithRoom from './HeaderIconWithRoom';
import { Tag } from '../../../components/AppiaUI';

type RoomTitleProps = {
	room: IRoom;
};

const RoomTitle = ({ room }: RoomTitleProps): ReactElement => (
	<>
		{/* <HeaderIconWithRoom room={room} />*/}
		<Header.Title is='h1'>{room.name}</Header.Title>
		{room.federated ? <Tag color='blue'>外部</Tag> : null}
	</>
);

export default RoomTitle;
