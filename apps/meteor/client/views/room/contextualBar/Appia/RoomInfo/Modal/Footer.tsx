import { Box } from '@rocket.chat/fuselage';
import type { FC } from 'react';
import React from 'react';

import { footerStyles } from './appia-style';
import { Space } from '../../../../../../components/AppiaUI';

const ModalFooter: FC = ({ children }) => (
	<Box className={footerStyles}>
		<Space>{children}</Space>
	</Box>
);

export default ModalFooter;
