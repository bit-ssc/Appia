import { CloseOutlined } from '@ant-design/icons';
import { Box } from '@rocket.chat/fuselage';
import type { FC } from 'react';
import React, { useState } from 'react';

import { footerStyles, headerStyles, styles } from './appia-style';
import { useStateContext, useContactContext } from './context';
import Organization from './organization';
import Selected from './selected';
import { Button, Space } from '../AppiaUI';

const ModalHeader: FC<{ onClose: () => void }> = ({ onClose, children }) => (
	<Box className={headerStyles}>
		<div className='title'>{children}</div>
		<div className='close' onClick={onClose}>
			<CloseOutlined />
		</div>
	</Box>
);

const ModalFooter: FC = ({ children }) => (
	<Box className={footerStyles}>
		<Space>{children}</Space>
	</Box>
);

const Content: React.FC = () => {
	const { onClose, onOk, selected, title } = useStateContext();
	const { getUsersByIds } = useContactContext();
	const [state, setState] = useState<boolean>();

	const onOkHandler = async () => {
		setState(true);

		try {
			onOk && (await onOk(getUsersByIds(Array.from(selected))));
			onClose();
		} finally {
			setState(false);
		}
	};

	return (
		<Box className={styles}>
			<ModalHeader onClose={onClose}>{title}</ModalHeader>
			<div className='modal-contacts-body'>
				<Organization />
				<Selected />
			</div>
			<ModalFooter>
				<Button onClick={onClose}>取消</Button>
				<Button type='primary' loading={state} disabled={!selected.size} onClick={onOkHandler}>
					确定
				</Button>
			</ModalFooter>
		</Box>
	);
};

export default Content;
