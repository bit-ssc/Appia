import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';

import RoomEdit from './RoomEdit';
import { FormSkeleton } from '../../../components';
import { useOmnichannelRoomInfo } from '../../../hooks/useOmnichannelRoomInfo';
import { useVisitorInfo } from '../../../hooks/useVisitorInfo';

type RoomEditWithDataProps = {
	id: string;
	reload?: () => void;
	reloadInfo?: () => void;
	onClose: () => void;
};

function RoomEditWithData({ id: roomId, reload, reloadInfo, onClose }: RoomEditWithDataProps) {
	const t = useTranslation();

	const { data: room, isLoading: isRoomLoading, isError: isRoomError } = useOmnichannelRoomInfo(roomId);
	const { _id: visitorId } = room?.v ?? {};

	const {
		data: visitor,
		isInitialLoading: isVisitorLoading,
		isError: isVisitorError,
	} = useVisitorInfo(visitorId, { enabled: !!visitorId });

	if (isRoomLoading || isVisitorLoading) {
		return <FormSkeleton />;
	}

	if (isRoomError || !room) {
		return <Box mbs='x16'>{t('Room_not_found')}</Box>;
	}

	if (isVisitorError || !visitor) {
		return <Box mbs='x16'>{t('Visitor_not_found')}</Box>;
	}

	return <RoomEdit room={room} visitor={visitor} reload={reload} reloadInfo={reloadInfo} onClose={onClose} />;
}

export default RoomEditWithData;
