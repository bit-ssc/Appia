import { Box } from '@rocket.chat/fuselage';
import type { FC, ComponentProps } from 'react';
import React from 'react';

const AttachmentDetails: FC<ComponentProps<typeof Box>> = ({ ...props }) => (
	<Box rcx-attachment__details fontScale='p2' color='hint' bg='#FFFFFF' {...props} />
);

export default AttachmentDetails;
