import './appia.css';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import type { IAppiaContentProps, IMsgData, IMsgTextListItem, IApprovalBtn } from './IAppia';
import { classNames } from './utils';
import { APIClient } from '../../../../app/utils/client';
import { dispatchToastMessage } from '../../../lib/toast';

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
			<button
				disabled={loading}
				className={classNames('appia-approval-btn', btn.bold && 'appia-approval-btn-primary', loading && 'appia-approval-btn-loading')}
				onClick={onClick}
			>
				{loading ? (
					<svg
						viewBox='0 0 1024 1024'
						focusable='false'
						data-icon='loading'
						width='1em'
						height='1em'
						fill='currentColor'
						aria-hidden='true'
					>
						<path d='M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z'></path>
					</svg>
				) : null}
				{btn.name}
			</button>
		);
	}

	return <div className='appia-approval-btn appia-approval-btn-disabled'>{btn.name}</div>;
};

const ApprovalMsg: React.FC<IAppiaContentProps> = ({ msg, user = {} }) => {
	const data = useMemo(() => JSON.parse(msg.msgData as string) as IMsgData, [msg.msgData]);
	const { msgType } = msg;

	const [btnList, setBtnList] = useState(() => data?.btnList || []);

	useEffect(() => {
		setBtnList(data?.btnList || []);
	}, [data?.btnList]);

	const onClick = useCallback(async (): Promise<void> => {
		if (!data?.linkInfo?.url) {
			return;
		}
		const { linkInfo, source } = data;
		let linkUrl = `${linkInfo.url}${linkInfo.url.indexOf('?') > -1 ? '&' : '?'}from=appia`;
		if (linkInfo?.needAuth) {
			const { accessUrl, token } = await APIClient.get(
				`/v1/users.externalToken?platform=WEB&url=${encodeURIComponent(linkInfo.url)}&source=${source}`,
			);
			linkUrl = accessUrl || `${linkUrl}&code=${token}&userId=${user._id}&username=${user.username}`;
		}
		window.open(linkUrl, '_blank');
	}, [data, user._id, user.username]);

	const onBtnClick = useCallback(
		async (btn: IApprovalBtn) => {
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

				return;
			}

			// others for request
			if (btn.type === 'request' || msgType === 'approval') {
				try {
					const res = await APIClient.post('/v1/oa.approval', {
						messageId: msg._id,
						key: btn.key,
					});
					setBtnList([
						{
							name: res.name,
						},
					]);

					dispatchToastMessage({ type: 'success', message: '操作成功' });
				} catch (e) {
					console.log(e);
					dispatchToastMessage({ type: 'error', message: '操作失败' });
				}
			}
		},
		[msg._id, msgType],
	);

	return (
		<div onClick={onClick} className={`appia-approval-wrapper ${data?.linkInfo?.url && 'appia-approval-hover'}`}>
			<div className='appia-approval-header'>
				{data.tag ? <div className='appia-approval-header-status'>{data.tag}</div> : null}
				{data.title}
			</div>
			<div className='appia-approval-body'>
				{data?.textList?.map(({ label, value, tags }: IMsgTextListItem) => {
					if (value || tags) {
						return (
							<div key={value} className='appia-approval-item'>
								<div className='appia-approval-item-label'>{label}</div>
								<div className='appia-approval-item-value'>
									<div className='appia-approval-item-text'>{value}</div>
									{tags
										? tags.map((tag) => (
												<div
													key={tag.text}
													className='appia-approval-item-tag-value'
													style={{
														borderColor: tag.borderColor || '#E8F2FF',
														backgroundColor: tag.backgroundColor || '#E8F2FF',
														color: tag.color || '#1B5BFF',
													}}
												>
													{tag.text}
												</div>
										  ))
										: null}
								</div>
							</div>
						);
					}

					return null;
				})}
			</div>
			{btnList.length ? (
				<div className='appia-approval-footer' style={{ justifyContent: 'center' }}>
					{btnList.map((btn, index) => (
						<Btn key={index} btn={btn} onClick={onBtnClick} />
					))}
				</div>
			) : (
				data?.linkInfo?.url && <div className='appia-approval-footer'>{data.linkInfo.name}</div>
			)}
		</div>
	);
};

export default ApprovalMsg;
