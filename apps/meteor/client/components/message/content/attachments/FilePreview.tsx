import { Modal, Throbber } from '@rocket.chat/fuselage';
import { useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { useState, useEffect } from 'react';

import { ModalCloseIcon } from '../../../AppiaIcon';
// import { useUser } from '../../../contexts/UserContext';

interface IProps {
	url: string;
	fileName?: string;
	fileSize?: number;
	onClose: () => void;
}

const styles = {
	loadingBox: {
		marginTop: '160px',
	},
	errorText: {
		marginTop: '160px',
		textAlign: 'center',
		fontSize: '20px',
		fontWeight: 600,
	},
};

export const FilePreview: FC<IProps> = ({ url, fileName, fileSize, onClose }) => {
	const shimoServerUrl = useSetting('Shimo_Api_Url') as string;
	const shimoWebUrl = useSetting('Shimo_Web_Url') as string;
	const companyId = useSetting('Enterprise_ID') as string;
	const t = useTranslation();
	// const user = useUser();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [filePath, setFilePath] = useState('');
	const [docHeight, setDocHeight] = useState(0);

	const fetchError = (): void => {
		console.log('文件下载失败');
		setLoading(false);
		setError(true);
	};

	const checkDownloadUrl = (url: string) => {
		let mUrl = url.replace(new RegExp('/file-upload'), '/file-proxy');
		mUrl = mUrl.startsWith('https') ? mUrl : `https://${window.location.host}${mUrl}`;
		return mUrl;
	};

	const getFilePath = async (): Promise<void> => {
		const token = localStorage['Meteor.loginToken'] || '';
		const userId = localStorage['Meteor.userId'] || '';
		const org = companyId?.toLowerCase();
		try {
			const response = await fetch(`${shimoServerUrl}/api/v1/rpc/file/view/create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'a-doc-source': 'appia',
					'a-doc-token': token,
					// 'a-doc-username': user?.username || '',
					'a-doc-username': userId,
					'a-doc-org': org,
				},
				body: JSON.stringify({
					format: url.split('.').pop(), // 文件后缀 如：doc、docx
					downloadUrl: checkDownloadUrl(url),
					fileName,
					fileSize,
				}),
			});
			if (!response.ok) {
				return fetchError();
			}
			const res = await response.json();
			if (res.code !== '0' || !res?.data?.fileId) {
				return fetchError();
			}
			// @ts-ignore
			const newUrl = `${shimoWebUrl}/clouddocument/${res?.data?.fileId}?source=appia&type=preview&org=${org}&token=${token}&userId=${userId}`;
			setFilePath(newUrl);
			setLoading(false);
		} catch {
			fetchError();
		}
	};

	const onResize = (): void => {
		setDocHeight(document.body.clientHeight - document.body.clientHeight * 0.1);
	};

	const handleMessage = (e: any): void => {
		const msg = e.data;
		if (msg.type === 'onDocHeightChanged') {
			setDocHeight(msg.height);
		}
	};

	useEffect(() => {
		getFilePath();
		window.addEventListener('message', handleMessage);
		window.addEventListener('resize', onResize);
		return (): void => {
			window.removeEventListener('message', handleMessage);
			window.removeEventListener('resize', onResize);
		};
	}, []);

	const iframeHeight = docHeight || document.body.clientHeight - document.body.clientHeight * 0.1;
	return (
		<Modal width='90%' height='90%' maxWidth='100%' padding={0}>
			<div style={{ position: 'relative' }}>
				<a style={{ position: 'absolute', top: '-4px', right: '-32px' }} onClick={onClose}>
					<ModalCloseIcon />
				</a>
				{loading && (
					<div style={styles.loadingBox}>
						<Throbber elevation='0' />
					</div>
				)}
				{error && <div style={styles.errorText}>{t('Load_Error')}</div>}
				{filePath && <iframe width='100%' height={iframeHeight} frameBorder={0} src={filePath}></iframe>}
			</div>
		</Modal>
	);
};

export default FilePreview;
