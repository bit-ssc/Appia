import { Box } from '@rocket.chat/fuselage';
import type { ComponentProps, FC } from 'react';
import React from 'react';

const AuthorName: FC<ComponentProps<typeof Box>> = (props) => <Box withTruncatedText fontScale='p2m' mi='x8' {...props} />;

export default AuthorName;
