import type { ReactElement } from 'react';
import React from 'react';

import { VoipInfo } from './VoipInfo';
import { useVoipRoom } from '../../../../room/contexts/RoomContext';

// Contextual Bar for room view
const VoipInfoWithData = ({ tabBar: { close } }: any): ReactElement => {
	const room = useVoipRoom();

	return <VoipInfo room={room} onClickClose={close} />;
};

export default VoipInfoWithData;
