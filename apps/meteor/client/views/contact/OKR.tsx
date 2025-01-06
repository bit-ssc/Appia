import { useEndpoint } from '@rocket.chat/ui-contexts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { EmptyOKR } from '../../components/AppiaIcon';
import { Tabs, Spin } from '../../components/AppiaUI';
import { useEndpointData } from '../../hooks/useEndpointData';
import { AsyncStatePhase } from '../../lib/asyncState';

const styles = {
	box: {
		width: '100%',
		fontSize: '14px',
		lineHeight: '22px',
		color: 'rgb(29, 33, 41)',
	},
	empty: {
		textAlign: 'center' as const,
	},
	wrapper: {
		width: '100%',
		fontSize: 14,
		lineHeight: '22px',
		color: '#1D2129',
	},
	objectBox: {
		borderBottom: '1px solid #EEEEEE',
		marginBottom: 16,
	},
	itemBox: {
		display: 'flex',
		marginBottom: 12,
	},
	itemTag: {
		width: 28,
		height: 'fit-content',
		padding: '0px 5px',
		marginRight: 5,
		textAlign: 'center' as const,
		fontSize: 12,
		color: '#2878FF',
		borderRadius: 9,
	},
	objectTag: {
		fontWeight: 600,
		background: '#2878FF',
		color: '#FFFFFF',
	},
	tTag: {
		background: '#F0F8FF',
	},
	splitLine: {},
	itemContent: {},
	itemText: {},
	itemDesc: {
		fontSize: 12,
		color: '#4E5969',
	},
};

const challengeMap = {
	2: 'Very Challenge(VC)',
	1: 'Challenge(C)',
	0: 'Normal(N)',
};

interface IObject {
	index: string;
	data: string;
	challenge?: string;
	items?: IObject[];
}

const Item: React.FC<{ value: string; tagName: string; desc?: string | null }> = ({ value, tagName, desc }) => {
	let tagStyle = styles.itemTag;

	if (tagName.startsWith('O')) {
		tagStyle = { ...styles.itemTag, ...styles.objectTag };
	} else if (tagName.startsWith('T')) {
		tagStyle = { ...styles.itemTag, ...styles.tTag };
	}

	return (
		<div key={tagName} style={styles.itemBox}>
			<span style={tagStyle}>{tagName}</span>
			<div style={styles.itemContent}>
				<div style={styles.itemText}>{value}</div>
				{desc && <div style={styles.itemDesc}>{desc}</div>}
			</div>
		</div>
	);
};

// eslint-disable-next-line react/no-multi-comp
const Okr: React.FC<{ username: string }> = ({ username }) => {
	const [activeTab, setActiveTab] = useState<string>();
	const [loading, setLoading] = useState(true);
	const query = useMemo(() => ({ params: { username } }), [username]);
	const { value, phase } = useEndpointData('/v1/otkr.date', query);
	const fetchOtkr = useEndpoint('GET', '/v1/otkr.query');
	const [otkr, setOtkr] = useState(null);
	const tabs = useMemo(() => {
		const res = value?.data || [];
		if (res.length) {
			setActiveTab(res[0].key);
		} else if (phase === AsyncStatePhase.RESOLVED) {
			setLoading(false);
		}
		return res;
	}, [value, phase]);
	const self = useMemo(() => {
		const res: IObject[] = [];

		(otkr?.self?.data as unknown as IObject[])?.forEach((oValue) => {
			if (oValue) {
				const tItems: IObject[] = [];

				oValue?.items?.forEach((tValue) => {
					if (tValue) {
						const krItems: IObject[] = [];

						tValue?.items?.forEach((krItem) => {
							if (krItem) {
								krItems.push({
									index: krItem.index,
									data: krItem.data,
								});
							}
						});

						tItems.push({
							index: tValue.index,
							data: tValue.data,
							items: krItems,
						});
					}
				});

				const data = {
					index: oValue.index,
					data: oValue.data,
					challenge: oValue.challenge ? challengeMap[oValue.challenge as unknown as keyof typeof challengeMap] : undefined,
					items: tItems,
				};

				res.push(data);
			}
		});

		return res;
	}, [otkr]);

	const onChange = useCallback((key) => {
		setActiveTab(key);
	}, []);

	useEffect(() => {
		if (phase === AsyncStatePhase.REJECTED) {
			setLoading(false);
		}
	}, [phase]);

	useEffect(() => {
		if (activeTab) {
			setLoading(true);
			fetchOtkr({
				username,
				time: activeTab,
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
	}, [activeTab, fetchOtkr, username]);

	let oIndex = 0;

	return (
		<div style={styles.box}>
			<Tabs activeKey={activeTab} onChange={onChange} items={tabs} />
			<Spin spinning={loading}>
				{self.length ? (
					<>
						{self.map((oValue) => {
							let tIndex = 0;
							if (oValue.data) {
								oIndex++;
							}

							return (
								<div key={oValue.index}>
									{oValue.data ? (
										<div key={oValue.index} style={styles.objectBox}>
											<Item value={oValue.data} tagName={`O${oIndex}`} desc={oValue.challenge ? `挑战度：${oValue.challenge}` : null} />
										</div>
									) : null}

									<div style={{ paddingLeft: 12 }}>
										{oValue.items?.map((tValue) => {
											if (tValue.data) {
												tIndex++;
											}

											return (
												<div key={tValue.index}>
													{tValue.data ? <Item value={tValue.data} tagName={`T${tIndex}`} /> : null}
													{tValue.items?.map((krValue, krIndex) => (
														<Item key={krValue.index} value={krValue.data} tagName={`KR${krIndex + 1}`} />
													))}
												</div>
											);
										})}
									</div>
								</div>
							);
						})}
					</>
				) : (
					<div style={styles.empty}>
						<EmptyOKR />
					</div>
				)}
			</Spin>
		</div>
	);
};

export default Okr;
