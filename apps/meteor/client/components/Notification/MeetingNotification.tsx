import { Box, Icon } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { useCallback, useMemo, useState } from 'react';

import './Notification.css';
import { dispatchToastMessage } from '../../lib/toast';
import { useNotification } from '../../providers/NotificationProvider';
import { AppiaIcon, CloseIcon, PointerIcon, WorkspaceIcon, PotaIcon } from '../SvgIcons';
import type { IMsgData, IApprovalBtn } from '../message/appia/IAppia';

// eslint-disable-next-line import/order
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

const MeetingNotification = () => {
	const t = useTranslation();
	const { notification, show, updateShow } = useNotification();
	const data = useMemo(() => JSON.parse(notification?.msgData || '{}') as IMsgData, [notification]);
	const { textList, btnList, title, extraData } = data;

	const onBtnClick = useCallback(async (btn: IApprovalBtn) => {
		if (btn.type === 'copy') {
			if (btn.key) {
				await window.navigator.clipboard.writeText(btn.key);
				dispatchToastMessage({ type: 'success', message: TAPi18n.__('Copied') });
			}
			return;
		}

		if (btn.type === 'open') {
			if (btn.key) {
				window.open(btn.key, '_blank');
			}
		}
	}, []);

	if (!show || !data) return null;
	const renderMettingModal = () => {
		return (
			<div className='notification'>
				<div className='notification-header'>
					<button className='notification-close' onClick={() => updateShow(false)}>
						<Icon name={'cross'} />
					</button>
				</div>
				<div className='notification-content'>
					<div className='notification-title'>{`${title} ${t('About_to_Start')}`}</div>
					{textList?.map((item) => {
						if (!item?.label || !item.value) {
							return null;
						}
						return (
							<div>
								<span className='notification-label'>{item.label}</span>
								<span className='notification-value'>{item.value}</span>
							</div>
						);
					})}
					<div className='notification-footer'>
						{btnList?.map((btn, index) => (
							<Btn key={index} btn={btn} onClick={onBtnClick} />
						))}
					</div>
				</div>
			</div>
		);
	};

	const renderPotaWaringModal = () => {
		return (
			<Box className='notification-pota-modal'>
				<Box className='notification-pota-modal-container'>
					<div className='notification-pota-headerContainer'>
						<div className='notification-pota-header-title'>{t('POTA_Details')}</div>
						<div className='notification-pota-close' onClick={() => updateShow(false)}>
							<CloseIcon />
						</div>
					</div>
					<div className='notification-pota-reminder'>
						<div className='notification-pota-title'>{title}</div>
						<div className='notification-pota-section-title'>系统路径:</div>
						<div className='notification-pota-system-path'>
							<div className='notification-pota-path-item'>
								<div className='notification-pota-icon-container'>
									<AppiaIcon />
								</div>
								<span className='notification-pota-path-item-title'>APPIA</span>
							</div>
							<PointerIcon />
							<div className='notification-pota-path-item'>
								<div className='notification-pota-icon-container'>
									<WorkspaceIcon />
								</div>
								<span className='notification-pota-path-item-title'>劳动</span>
							</div>
							<PointerIcon />
							<div className='notification-pota-path-item'>
								<div className='notification-pota-icon-container'>
									<PotaIcon />
								</div>
								<span className='notification-pota-path-item-title'>POTA</span>
							</div>
						</div>

						<div className='notification-pota-warning'>
							<p>根据《TKP绩效管理制度》要求，逾期将不再可填写，未填写的POTA得分为50分！！</p>
						</div>
					</div>
				</Box>
			</Box>
		);
	};

	if (extraData.action === 'begin_info') {
		return renderMettingModal();
	}

	if (extraData.action === 'pota_warning') {
		return renderPotaWaringModal();
	}

	return <></>;
};

interface IBtnProps {
	btn: IApprovalBtn;
	onClick: (btn: IApprovalBtn) => Promise<void>;
}

const Btn: React.FC<IBtnProps> = (props) => {
	const { btn } = props;
	const [loading, setLoading] = useState(false);
	const onClick = useCallback(
		async (e) => {
			e.preventDefault();
			e.stopPropagation();
			setLoading(true);
			try {
				await props.onClick(props.btn);
			} catch (e) {
				console.log(e);
			}
			setLoading(false);
		},
		[props],
	);

	if (btn.key) {
		return (
			<button className='notification-button' disabled={loading} onClick={onClick}>
				{btn.name}
			</button>
		);
	}

	return <div>{btn.name}</div>;
};

export default MeetingNotification;
