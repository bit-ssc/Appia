import { Box } from '@rocket.chat/fuselage';
import type { ComponentProps, FC, ReactNode } from 'react';
import React from 'react';

type FieldProps = {
	short?: boolean;
	title: ReactNode;
	value: ReactNode;
} & Omit<ComponentProps<typeof Box>, 'title' | 'value'>;

// TODO: description missing color token
const Field: FC<FieldProps> = ({ title, value, ...props }) => (
	<Box mb='x4' pi='x4' width='full' flexBasis={100} flexShrink={0} color='default' {...props}>
		<Box fontScale='p2m'>{title}</Box>
		{value}
	</Box>
);

export default Field;
