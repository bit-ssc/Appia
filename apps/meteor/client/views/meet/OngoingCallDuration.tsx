import { Box } from '@rocket.chat/fuselage';
import type { FC } from 'react';
import React, { useEffect, useState } from 'react';

type OngoingCallDurationProps = {
	counter: number;
};

const OngoingCallDuration: FC<OngoingCallDurationProps> = ({ counter: defaultCounter = 0 }) => {
	const [counter, setCounter] = useState(defaultCounter);
	useEffect(() => {
		setTimeout(() => setCounter(counter + 1), 1000);
	}, [counter]);

	return (
		<Box color='white' textAlign='center'>
			{new Date(counter * 1000).toISOString().substr(11, 8)}
		</Box>
	);
};

export default OngoingCallDuration;
