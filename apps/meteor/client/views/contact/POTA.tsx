import { css } from '@rocket.chat/css-in-js';
import { Modal, Box } from '@rocket.chat/fuselage';
import { useEndpoint, useTranslation } from '@rocket.chat/ui-contexts';
import React, { useEffect, useMemo, useState, Fragment } from 'react';

import { EmptyOKR, EmptyOKRNoPermission } from '../../components/AppiaIcon';
import { Spin, Form, Space } from '../../components/AppiaUI';
import { CloseIcon } from '../../components/SvgIcons';

const modalStyle = css`
	display: flex;
	flex-direction: column;

	.container {
		margin: 12px 20px 20px;
	}

	.borderStyle {
		tr:first-child th {
			border-top-left-radius: 4px;
		}

		tr:first-child td {
			border-top-right-radius: 4px;
		}
	}

	.empty {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 360px;
	}

	.table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;

		td,
		th {
			border-bottom: 1px solid #c5c5c5;
			border-right: 1px solid #c5c5c5;
			padding: 12px;
			text-align: left;
			height: 1px;
			word-break: break-all;

			label {
				position: relative;
				height: 100%;

				:global {
					.ant-input-show-count {
						position: static !important;
					}

					.ant-input-data-count {
						position: absolute;
						bottom: 16px;
						right: 0;
					}
				}
			}

			.index {
				line-height: 30px;
				flex-shrink: 0;
			}
		}

		th {
			background: rgba(40, 120, 255, 0.15);
			color: #1d2129;
		}

		td:first-child,
		th:first-child {
			border-left: 1px solid #c5c5c5;
		}

		thead tr:first-child {
			td,
			th {
				border-top: 1px solid #c5c5c5;
			}
		}

		tbody tr:last-child {
			td:last-child {
				border-bottom-right-radius: 4px;
			}

			td:first-child {
				border-bottom-left-radius: 4px;
			}
		}

		.noBorderLeft {
			border-left: 0 none !important;
			border-bottom-left-radius: 0 !important;
		}

		.borderBottomLeftRadius {
			border-bottom-left-radius: 4px;
		}

		:global {
			.ant-space-item {
				word-break: break-all;
			}

			.ant-space {
				display: block;
			}
		}
	}

  .headerContainer {
    border-radius-top: 8px;
    display: flex;
    flex-direction: row;
    background: #F0F2F4;
    height: 48px;
    align-items: center;
    padding-right: 12px;
  }

  .info {
    margin-left: 20px;
    font-size: 14px;
    line-height: 24px;
    margin-top: 20px;
    white-space: pre-wrap;
  }
  
  .close {
    cursor: pointer;
  }
  
  .title {
		font-size: 16px;
		font-weight: 600;
		line-height: 24px
		display: flex;
		align-items: center;
    flex:1;
    padding-left: 16px;

		&::before {
			display: inline-block;
			content: ' ';
			border-radius: 2px 0px;
			background: linear-gradient(180deg, #2878ff 0%, rgba(40, 120, 255, 0.4) 100%);
			margin-right: 8px;
			width: 4px;
			height: 16px;
		}
	}

  .empty {
		textAlign: 'center' 
	},
`;
export const isOlder = (timeKey?: string) => {
	if (timeKey) {
		const [year] = timeKey.split('-');

		if (year) {
			return parseInt(year, 10) < 2023;
		}
	}

	return false;
};

export const getSelfData = (data) => {
	const items = [];

	data?.forEach((oValue) => {
		const oItems = [];

		oValue?.items?.forEach((tValue) => {
			const krItems = [];

			tValue?.items?.forEach((krValue) => {
				if (krValue?.data) {
					krItems.push(krValue);
				}
			});

			if (tValue?.data || krItems.length) {
				oItems.push({
					...tValue,
					items: krItems,
				});
			}
		});

		if (oValue?.data || oItems.length) {
			items.push({
				...oValue,
				items: oItems,
			});
		}
	});

	return items;
};

interface IProps {
	user: {};
	onClose: () => void;
	timeKey: string;
}
// eslint-disable-next-line react/no-multi-comp
const POTA: React.FC<IProps> = ({ user, onClose, timeKey }) => {
	const t = useTranslation();
	const [loading, setLoading] = useState(true);
	const fetchOtkr = useEndpoint('GET', '/v1/otkr.query');
	const fetchOtkrCanQuery = useEndpoint('GET', '/v1/otkr.canQuery');
	const [canView, setCanView] = useState(false);
	const [otkr, setOtkr] = useState(null);
	const privacyContent = t('Confidential_Content');

	const self = useMemo(() => {
		const list = getSelfData(otkr?.self?.data);
		if (list?.length) {
			return list[0];
		}
		return null;
	}, [otkr]);
	const department = useMemo(() => otkr?.department?.filter((v) => v.data) || [], [otkr?.department]);
	const assessment = useMemo(() => otkr?.assessment?.filter((v) => v.data) || [], [otkr?.assessment]);

	const getContent = (hidden: string, content: string) => {
		return hidden === '1' ? privacyContent : content;
	};

	const getStyle = (hidden: string) => {
		return hidden === '1' ? { filter: 'blur(5px)' } : {};
	};

	useEffect(() => {
		const uid = Meteor.userId();
		if (uid) {
			const me = Meteor.users.findOne(uid);
			fetchOtkrCanQuery({ viewer: me?.username, owner: user.username })
				.then((res) => {
					if (res?.success && res?.data) {
						setCanView(true);
					}
					setLoading(false);
				})
				.catch(() => {
					setLoading(false);
				});
		}
	}, []);

	useEffect(() => {
		if (canView) {
			setLoading(true);
			fetchOtkr({
				username: user.username,
				time: timeKey,
			})
				.then((res) => {
					setOtkr(res?.data as any);
					setLoading(false);
				})
				.catch(() => {
					setLoading(false);
					setOtkr(null);
				});
		}
	}, [fetchOtkr, user, canView]);

	const older = isOlder(otkr?.self?.timeKey);

	const timeStr = self?.timeKey ? `时间：${self?.timeKey || ''}` : '';

	return (
		<Modal minWidth='900px'>
			<Box className={modalStyle}>
				<div className='headerContainer'>
					<div className='title'>{t('Announcement_New_Title')}</div>
					<div className='close' onClick={onClose}>
						<CloseIcon />
					</div>
				</div>
				<Spin spinning={loading}>
					<Box className='info'>{`${t('Employee_Name')}：${user.name}              ${timeStr}`}</Box>

					{self && canView ? (
						<Form initialValues={undefined} className='container'>
							<table className='table borderStyle'>
								<thead>
									{department?.length ? (
										<tr>
											<th style={{ width: 120 }}>KP</th>
											<td>
												{department.map((value) => (
													<div key={value.index}>{value.data}</div>
												))}
											</td>
										</tr>
									) : null}
									<tr>
										<th style={{ width: 120 }}>KO & TT</th>
										<td>
											<div key={self.index}>{self.data}</div>
										</td>
									</tr>
									{assessment?.length ? (
										<tr>
											<th style={{ width: 120 }}>考核规则</th>
											<td>
												{assessment.map((value) => (
													<div key={value.index}>{value.data}</div>
												))}
											</td>
										</tr>
									) : null}
								</thead>
							</table>
							<table className={'table'}>
								<thead>
									<tr>
										{older ? null : <th style={{ width: 405 }}>KT</th>}
										<th style={{ width: 405 }}>KR & TT</th>
									</tr>
								</thead>
								<tbody>
									{[self].map((oValue, oIndex) => {
										const [t, ...ts] = oValue.items || [];
										const [kr, ...krs] = t?.items || [];

										return (
											<Fragment key={oValue.index}>
												<tr>
													{older ? null : (
														<td rowSpan={t?.items?.length || 1} className={!ts?.length ? 'borderBottomLeftRadius' : ''}>
															{t?.data ? (
																<Space align='start' style={getStyle(t?.hidden)}>
																	<span>1.</span>

																	<div>{getContent(t?.hidden, t?.data)}</div>
																</Space>
															) : null}
														</td>
													)}
													<td>
														{kr?.data ? (
															<Space align='start' style={getStyle(kr?.hidden)}>
																<span>1.</span>
																<div>{getContent(kr?.hidden, kr?.data)}</div>
															</Space>
														) : null}
													</td>
												</tr>

												{krs?.map((krValue, index) => {
													return (
														<tr key={krValue.index}>
															{/* <td className={styles.noBorderLeft}> */}
															<td>
																{krValue?.data ? (
																	<Space align='start' style={getStyle(krValue?.hidden)}>
																		<span>{index + 2}.</span>
																		<div>{getContent(krValue?.hidden, krValue?.data)}</div>
																	</Space>
																) : null}
															</td>
														</tr>
													);
												})}

												{ts.map((tValue, tIndex) => {
													const [kr, ...krs] = tValue?.items || [];

													return (
														<Fragment key={tValue.index}>
															<tr>
																{older ? null : (
																	<td
																		rowSpan={tValue?.items?.length || 1}
																		className={tIndex === ts.length - 1 ? 'borderBottomLeftRadius' : ''}
																	>
																		{tValue?.data ? (
																			<Space align='start' style={getStyle(tValue?.hidden)}>
																				<span>{tIndex + 2}.</span>
																				<div>{getContent(tValue?.hidden, tValue?.data)}</div>
																			</Space>
																		) : null}
																	</td>
																)}
																<td>
																	{kr?.data ? (
																		<Space align='start' style={getStyle(kr?.hidden)}>
																			<span>1.</span>
																			<div>{getContent(kr?.hidden, kr?.data)}</div>
																		</Space>
																	) : null}
																</td>
															</tr>

															{krs.map((krValue, krIndex) => (
																<tr key={krValue.index}>
																	<td className={'noBorderLeft'}>
																		{krValue?.data ? (
																			<Space align='start' style={getStyle(krValue?.hidden)}>
																				<span>{krIndex + 2}.</span>
																				<div>{getContent(krValue?.hidden, krValue?.data)}</div>
																			</Space>
																		) : null}
																	</td>
																</tr>
															))}
														</Fragment>
													);
												})}
											</Fragment>
										);
									})}
								</tbody>
							</table>
						</Form>
					) : (
						<div className='empty'>
							{canView ? (
								<EmptyOKR />
							) : (
								<>
									<EmptyOKRNoPermission />
									<div style={{ color: '#BEBEBE', marginTop: 20 }}>{t('No_Viewing_POTA_Permission')}</div>
								</>
							)}
						</div>
					)}
				</Spin>
			</Box>
		</Modal>
	);
};

export default POTA;
