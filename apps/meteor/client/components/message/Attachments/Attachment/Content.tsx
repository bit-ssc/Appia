import { Box } from '@rocket.chat/fuselage';
import type { ComponentProps, FC } from 'react';
import React from 'react';

const Content: FC<ComponentProps<typeof Box>> = ({ ...props }) => <Box rcx-attachment__content width='full' mb='x4' {...props} />;

export default Content;
