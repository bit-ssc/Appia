import { useSetting, useRoute } from '@rocket.chat/ui-contexts';
import React, { useCallback, useMemo } from 'react';

interface IRoomSideMenuButtonProps {
	rid?: string;
}

const RoomSideMenuStaffServiceButton: React.FC<IRoomSideMenuButtonProps> = ({ rid }) => {
	const directRoute = useRoute('direct');
	const clickHandler = useCallback(
		() =>
			directRoute.push({
				rid: 'staffService.bot',
			}),
		[],
	);
	const rids = useSetting('Appia_Room_Side_Menu_StaffServiceButton') as string;
	const rooms = useMemo(() => new Set((rids || 'GENERAL').split(',')), [rids]);

	if (rid && rooms.has(rid)) return <div onClick={clickHandler} className='appia-side-staff-service-button-wrapper'></div>;

	return null;
};

export default RoomSideMenuStaffServiceButton;
