import { Box } from '@rocket.chat/fuselage';
import type { FC, ComponentProps } from 'react';
import React from 'react';

const AttachmentDetails: FC<ComponentProps<typeof Box>> = ({ ...props }) => (
<<<<<<< HEAD
	<Box rcx-attachment__details fontScale='p2' color='hint' bg='surface-tint' padding={16} {...props} />
=======
	<Box rcx-attachment__details fontScale='p2' color='hint' bg='#FFFFFF' {...props} />
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
);

export default AttachmentDetails;
