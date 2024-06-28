import { useUserRoom } from '@rocket.chat/ui-contexts';
import React from 'react';

import EditChannel from './EditChannel';
import { useTabBarClose } from '../../../contexts/ToolboxContext';

function EditChannelWithData({ rid, onClickBack }) {
	const room = useUserRoom(rid);
	const onClickClose = useTabBarClose();

	return <EditChannel onClickClose={onClickClose} onClickBack={onClickBack} room={{ type: room?.t, ...room }} />;
}

export default EditChannelWithData;
