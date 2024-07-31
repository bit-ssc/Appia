import { Box } from '@rocket.chat/fuselage';
import type { FC, ComponentProps } from 'react';
import React from 'react';

const Row: FC<ComponentProps<typeof Box>> = (props) => (
	<Box mi='neg-x2' mbe='x2' rcx-message-attachment-bm display='flex' alignItems='center' {...props} />
);

export default Row;
