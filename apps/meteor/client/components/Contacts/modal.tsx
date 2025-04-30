/**
 * Created by haipeng<douhaipeng@live.com> on 2023/5/16.
 * @author haipeng<douhaipeng@live.com>
 */
import { CloseOutlined } from '@ant-design/icons';
import { Box } from '@rocket.chat/fuselage';
import type { FC } from 'react';
import React, { useState } from 'react';

import { Button, Space } from '../AppiaUI';
import { footerStyles, headerStyles, styles } from './appia-style';
import { useStateContext, useContactContext } from './context';
import Organization from './organization';
import Selected from './selected';
import { useTranslation } from '@rocket.chat/ui-contexts';

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
	const { onClose, onOk, selected, title, partners } = useStateContext();
	const { getUserById } = useContactContext();
	const [state, setState] = useState<boolean>();
	const t = useTranslation();

	const onOkHandler = async () => {
		setState(true);
		// const user = getUsersByIds(Array.from(selected));
		const user = Array.from(selected).map((item) => getUserById(item) || { username: item });
		const selectedPartnersUsername = Array.from(selected).filter((item) => item.includes(':'));
		const selectedPartners = partners.filter((item) => selectedPartnersUsername.some((username) => username === item.username));
		try {
			onOk && (await onOk([...user, ...selectedPartners]));
			setState(false);
			onClose();
		} catch (e) {
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
				<Button onClick={onClose}>{t('Cancel')}</Button>
				<Button type='primary' loading={state} disabled={!selected.size} onClick={onOkHandler}>
					{t('Confirm')}
				</Button>
			</ModalFooter>
		</Box>
	);
};

export default Content;
