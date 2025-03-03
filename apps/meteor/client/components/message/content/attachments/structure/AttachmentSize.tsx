import type { Box } from '@rocket.chat/fuselage';
import type { ComponentProps, FC } from 'react';
import React from 'react';

import Title from './AttachmentTitle';
import { useFormatMemorySize } from '../../../../../hooks/useFormatMemorySize';

const AttachmentSize: FC<ComponentProps<typeof Box> & { size: number; wrapper?: boolean }> = ({ size, wrapper = false, ...props }) => {
	const format = useFormatMemorySize();

	const formattedSize = wrapper ? `(${format(size)})` : format(size);

	return (
		<Title flexShrink={0} {...props}>
			{formattedSize}
		</Title>
	);
};

export default AttachmentSize;
