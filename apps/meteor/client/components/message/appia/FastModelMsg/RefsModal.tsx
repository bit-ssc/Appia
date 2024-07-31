import { css } from '@rocket.chat/css-in-js';
import { Modal, Skeleton } from '@rocket.chat/fuselage';
import { useEndpoint, useTranslation } from '@rocket.chat/ui-contexts';
import DOMPurify from 'dompurify';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';

interface IRefsModal {
	botId?: string;
	docId: string;
	onClose: () => void;
}

const styles = {
	titleIcon: {
		width: '4px',
		height: '16px',
		margin: 0,
		background: 'linear-gradient(180deg, #2878FF 0%, rgba(40, 120, 255, 0.4) 100%)',
		borderRadius: '2px 0px',
	},
};

const headerStyle = css`
	.rcx-modal__header-inner {
		align-items: center;
	}
`;

const RefsModal = ({ botId, docId, onClose }: IRefsModal): ReactElement => {
	const t = useTranslation();
	const [origin, setOrigin] = useState('');
	const [loading, setLoading] = useState(false);
	const getOrigin = useEndpoint('GET', 'v1/bot.docs');

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const { result } = await getOrigin({ botId, docId });
				setLoading(false);
				await setOrigin(result.text);
			} catch (e) {
				setLoading(false);
				console.log('请求原文失败', e);
			}
		})();
	}, []);

	const renderContent = () => {
		if (loading) {
			return <Skeleton type='rect' w='full' h='x120' />;
		}

		return (
			<Modal.Content>
				<span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(origin).replace(/\n/g, '<br />') }}></span>
			</Modal.Content>
		);
	};
	return (
		<Modal style={{ maxWidth: '30vw', maxHeight: '50vh' }}>
			<Modal.Header className={headerStyle} style={{ margin: '20px 20px 10px 32px' }}>
				<span style={styles.titleIcon}></span>
				<Modal.Title style={{ fontSize: '16px' }}>{t('Ref')}</Modal.Title>
				<Modal.Close onClick={onClose} />
			</Modal.Header>
			{renderContent()}
		</Modal>
	);
};

export default RefsModal;
