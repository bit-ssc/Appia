import { useEndpoint } from '@rocket.chat/ui-contexts';
import { useEffect, useState } from 'react';

export const useRoomInfo = (rid: string) => {
	const [roomInfo, setRoomInfo] = useState(null);
	const fetch = useEndpoint('GET', `/v1/room/${rid}/info`);

	useEffect(() => {
		(async () => {
			const { data } = await fetch();

			setRoomInfo(data);
		})();
	}, []);

	return roomInfo;
};
