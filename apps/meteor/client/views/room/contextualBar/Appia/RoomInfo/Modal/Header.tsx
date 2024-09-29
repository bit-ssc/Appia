import { CloseOutlined } from '@ant-design/icons';
import { Box } from '@rocket.chat/fuselage';
import type { FC } from 'react';
import React from 'react';

import { headerStyles } from './appia-style';

interface IProps {
	onClose?: () => void;
	title: string;
}

const ModalHeader: FC<IProps> = ({ onClose, title, children }) => (
	<Box className={headerStyles}>
		<div className='title'>{title || children}</div>
		{onClose ? (
			<div className='close' onClick={onClose}>
				<CloseOutlined />
			</div>
		) : null}
	</Box>
);

export default ModalHeader;
