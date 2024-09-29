import type { Box } from '@rocket.chat/fuselage';
import type { ComponentProps, FC } from 'react';
import React from 'react';

import Title from './Title';
import { useFormatMemorySize } from '../../../../hooks/useFormatMemorySize';

const Size: FC<ComponentProps<typeof Box> & { size: number }> = ({ size, ...props }) => {
	const format = useFormatMemorySize();
	return (
		<Title flexShrink={0} {...props}>
			{format(size)}
		</Title>
	);
};

export default Size;
