/**
 * Created by haipeng<douhaipeng@live.com> on 2023/5/16.
 * @author haipeng<douhaipeng@live.com>
 */
import { CaretDownOutlined, CaretRightOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import type { IDepartment, IStaff } from '@rocket.chat/core-typings';
import { Box, Icon } from '@rocket.chat/fuselage';
import { useMutableCallback, useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import { useEndpoint, useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import QRCode from 'qrcode';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useRoomList } from '../../sidebar/hooks/useRoomList';
import ContactIcon from '../../views/contact/ContactIcon';
import { Button, Checkbox, Empty, Input, Select, Spin, List, message, Modal as ConfirmModal, Timeline } from '../AppiaUI';
import InfiniteScroll from '../infiniteScroll';
import { FederationQrCode, FederationTips, tabsStyle } from './appia-style';
import companyKV from './companyKV';
import { useStateContext, useContactContext } from './context';
import { classNames } from './helper';

import { GroupIcon } from '/client/views/room/Appia/SideMenuButton/icon';
import { getAvatarURL } from '/app/utils/lib/getAvatarURL';

import usePartnerList from './hook/usePartnerList';

import UserAvatar from '/client/components/avatar/UserAvatar';
import LinkIcon from '/client/components/AppiaIcon/LinkIcon';
import useSearch from '/client/sidebar/search/globalSearch/hooks/UseSearch';

const UserComponent: React.FC<{ user: IStaff; left: number; showDepartment: boolean }> = ({ user, left, showDepartment = true }) => {
	const { selected, addSelected, removeSelected, setSelected, disabled, multiple } = useStateContext();
	const { username, name, primaryOrgName } = user;

	const selectedAndDisabled = useMemo(() => {
		if (!disabled) {
			return selected;
		}
		return new Set([...selected, ...disabled]);
	}, [selected, disabled]);

	const onClick = () => {
		if (disabled?.has(username)) {
			return false;
		}
		if (selected.has(username)) {
			removeSelected(username);
		} else if (multiple) {
			addSelected(username);
		} else {
			setSelected(username);
		}
	};

	return (
		<div className={classNames('item', selected.has(username) && 'active')} onClick={onClick}>
			{multiple ? (
				<div className='checkbox'>
					<Checkbox disabled={disabled?.has(username)} checked={selectedAndDisabled.has(username)} />
				</div>
			) : null}
			<div className='avatar' style={{ marginLeft: left }}>
				<img src={getAvatarURL({ username })} alt={name} />
			</div>

			<div
				className='arrow'
				style={{
					display: 'flex',
					flexDirection: 'column',
					width: '75%',
				}}
			>
				<div
					style={{
						textOverflow: 'ellipsis',
						overflow: 'hidden',
						whiteSpace: 'nowrap',
					}}
				>
					{name}
				</div>
				{showDepartment && (
					<div
						style={{
							fontSize: '12px',
							textOverflow: 'ellipsis',
							overflow: 'hidden',
							whiteSpace: 'nowrap',
						}}
					>
						{' '}
						{primaryOrgName}{' '}
					</div>
				)}
			</div>
		</div>
	);
};

const DepartmentComponent: React.FC<{ department: IDepartment; left: number }> = ({ department, left }) => {
	const [toggle, setToggle] = useState<boolean>(false);
	const { multiple, selected, addSelected, removeSelected, disabled } = useStateContext();
	const { getAllUsersByDepartmentId, getUsersByDepartmentId, getDepartmentsByParentId } = useContactContext();
	const onToggle = useCallback(() => {
		setToggle((prevState) => !prevState);
	}, []);
	const users = getAllUsersByDepartmentId(department._id).map((user) => user.username);
	const selectedAndDisabled = useMemo(() => {
		if (!disabled) {
			return selected;
		}
		return new Set([...selected, ...disabled]);
	}, [selected, disabled]);

	const checked = users.length && users.every((user) => selectedAndDisabled.has(user));
	const clickDisabled = users.length && users.every((user) => disabled?.has(user));
	const indeterminate = users.some((user) => selected.has(user) || disabled?.has(user));
	const onClick = (e) => {
		e.stopPropagation();

		if (checked) {
			removeSelected(...users);
		} else {
			addSelected(...users);
		}
	};

	return (
		<>
			<div className='groupItem' onClick={onToggle}>
				{multiple ? (
					<div className='checkbox' onClick={onClick}>
						<Checkbox disabled={Boolean(clickDisabled)} checked={Boolean(checked)} indeterminate={!checked && indeterminate} />
					</div>
				) : null}
				<div className='arrow' style={{ marginLeft: 6 + left }}>
					{toggle ? <CaretDownOutlined /> : <CaretRightOutlined />}
				</div>
				<div className='icon'>
					<ContactIcon type={department.type} />
				</div>
				<div className='name'>{department?.name}</div>
			</div>
			{toggle ? (
				<>
					{getUsersByDepartmentId(department._id).map((user) => (
						<UserComponent key={user.id} user={user} left={left + 30} showDepartment={false} />
					))}
					{getDepartmentsByParentId(department._id).map((value) => (
						<DepartmentComponent department={value} key={value._id} left={30 + left} />
					))}
				</>
			) : null}
		</>
	);
};

const PartnerCompanyComponent: React.FC<{ org: string; children: JSX.Element[] }> = ({ org, children }) => {
	const t = useTranslation();
	const [collapse, setCollapse] = useState(true);
	const [state, setState] = useState({ showAlert: false, confirmLoading: false });
	const formatUrl = (text: string) => `https://static.appia.cn/logo/${text}.png?_=1`;
	const { room } = useStateContext();
	const { rid } = room;
	const sendLink = useEndpoint('POST', '/v1/sendInviteUrl');

	const renderHeader = () => {
		return (
			<div
				style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: collapse ? 8 : 0 }}
				onClick={() => setCollapse(!collapse)}
			>
				<div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
					<UserAvatar username={''} url={formatUrl(org)} size='x28' />
					<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: 8 }}>{`${companyKV[org].name}`}</div>
				</div>
				<Icon name={collapse ? 'chevron-left' : 'chevron-down'} />
			</div>
		);
	};

	const onPressLink = async () => {
		if (!rid) message.error('Invalid_Room');
		setState({ ...state, confirmLoading: true });
		try {
			await sendLink({ org, rid });
			message.success(t('Share_Link_Success'));
		} catch (e) {
			message.error(t('Share_Link_Failure'));
		} finally {
			setState({ confirmLoading: false, showAlert: false });
		}
	};

	const showConfirmAlert = () => {
		return (
			<ConfirmModal
				open={state.showAlert}
				onOk={onPressLink}
				onCancel={() => setState({ ...state, showAlert: false })}
				confirmLoading={state.confirmLoading}
				zIndex={9999}
				okText={t('Confirm')}
				cancelText={t('Cancel')}
				title={t('Send_Link_Tip')}
			/>
		);
	};

	const renderLastItem = () => {
		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					padding: 8,
					paddingTop: 0,
					alignItems: 'center',
					marginBottom: 8,
					cursor: 'pointer',
				}}
				onClick={() => setState({ ...state, showAlert: true })}
			>
				<div style={{ margin: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<LinkIcon fontSize={16}></LinkIcon>
				</div>
				{/*	{t('Partners_Link', { source: companyKV[org].shortName })} */}
				<span>{t('Partners_Link', { source: companyKV[org].shortName })}</span>
			</div>
		);
	};

	return (
		<div>
			{renderHeader()}
			{collapse ? null : children}
			{collapse ? null : renderLastItem()}
			{showConfirmAlert()}
		</div>
	);
};

const HistoryComponent = () => {
	const roomList = useRoomList();
	const [rooms, setRooms] = useState([]);
	const { addUserMap, getDepartmentNamesByUserId } = useContactContext();

	useEffect(() => {
		const list = [];
		const data = {};
		roomList
			.filter((room) => !room.federated && room.t === 'd' && !/\.bot$/i.test(room.name))
			.forEach((room) => {
				const item = {
					username: room.name,
					name: room.fname,
					departmentNames: getDepartmentNamesByUserId(room.name),
				};
				data[item.username] = item;
				list.push(item);
			});

		setRooms(list);
		addUserMap(data);
	}, [roomList, addUserMap]);

	const itemRender = useCallback((item, index) => <UserComponent user={item} left={12} key={index} />, []);
	return <List dataSource={rooms} renderItem={(item, index) => itemRender(item, index)}></List>;
	// return <InfiniteScroll style={{ marginTop: 8 }} data={rooms} itemRender={itemRender} itemHeight={48} itemKey='_id' />;
};

const PartnersComponent = () => {
	const t = useTranslation();
	const { partnersOfCompany } = useStateContext();
	const [partnersGuide, setPartnersGuide] = useState(localStorage.getItem('Partners_Guide'));

	const renderGuide = () => {
		const onPress = () => {
			localStorage.setItem('Partners_Guide', 'saw');
			setPartnersGuide('saw');
		};

		const renderDot = (content: string) => (
			<div style={{ background: '#1677ff', borderRadius: '50%', color: 'white', height: 16, width: 16, padding: 2, fontSize: 12 }}>
				{content}
			</div>
		);

		return (
			<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
				<div style={{ fontWeight: '600', marginBottom: 30 }}>{t('Partner_Guide_title')}</div>
				<Timeline>
					<Timeline.Item dot={renderDot('1')}>
						<>
							<div>{t('Partner_Tip1')}</div>
							<div style={{ fontSize: 12, color: '#4E5969' }}>{t('Partner_Des1')}</div>
						</>
					</Timeline.Item>
					<Timeline.Item dot={renderDot('2')}>
						<>
							<div>{t('Partner_Tip2')}</div>
							<div style={{ fontSize: 12, color: '#4E5969' }}>{t('Partner_Des2')}</div>
						</>
					</Timeline.Item>
				</Timeline>
				<div style={{ width: '100%', flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
					<Button type='primary' style={{ width: '50%' }} ghost onClick={() => onPress()}>
						{t('I_SEE')}
					</Button>
				</div>
			</div>
		);
	};

	if (!partnersGuide || partnersGuide !== 'saw') {
		return renderGuide();
	}

	const renderCompany = () => {
		const companyArr: { key: string; children: JSX.Element[] }[] = [];
		if (!partnersOfCompany || Object.keys(partnersOfCompany).length === 0) return [];

		const itemRender = (item: IStaff, index: number) => <UserComponent user={item} left={12} key={index} showDepartment={false} />;

		for (const partnersKey in partnersOfCompany) {
			if (partnersOfCompany.hasOwnProperty(partnersKey)) {
				// if (partnersKey.toLowerCase() === (enterpriseId as unknown as string).toLowerCase()) continue;
				const _partners = partnersOfCompany[partnersKey];
				const company = {
					key: partnersKey,
					children: _partners.usersArray?.map((user: any, index: number) => itemRender(user, index)),
				};
				companyArr.push(company);
			}
		}
		return companyArr;
	};

	const renderEmpty = () => <></>;

	const renderList = () => (
		<div style={{ width: '100%' }}>
			<div style={{ marginBottom: 8 }}>{t('Choose_Partners')}</div>
			{renderCompany()?.map((item) => (
				<PartnerCompanyComponent org={item.key} children={item.children} />
			))}
		</div>
	);

	const renderContent = () => (renderCompany()?.length > 0 ? renderList() : renderEmpty());

	return <div style={{ overflowY: 'auto' }}>{renderContent()}</div>;
};

const FederationComponent = () => {
	const [expire, setExpire] = useState<number>(-1);
	const [url, setUrl] = useState<string>('');
	const [loading, setLoading] = useState(false);
	const [local, setLocal] = useState();
	const [showQRCode, setShowQRCode] = useState(false);

	const { room } = useStateContext();
	const { rid } = room;
	const t = useTranslation();
	const enterpriseId = useSetting('Enterprise_ID');
	const user = Meteor.user();
	const fetch = useEndpoint('GET', `/v1/room/${rid}/qrcode/content`);
	const fetchLocal = useEndpoint('GET', 'v1/appia/getRoomInfo');
	const containerRef = useRef<React.HTMLDivElement>(null);

	const options = [
		{
			label: t('Validity_Permanent'),
			value: -1,
		},
		{
			label: t('Validity_thirty_days'),
			value: 30,
		},
		{
			label: t('Validity_seven_days'),
			value: 7,
		},
		{
			label: t('Validity_three_days'),
			value: 3,
		},
		{
			label: t('Validity_one_day'),
			value: 1,
		},
	];

	useEffect(() => {
		(async () => {
			try {
				const res = await fetchLocal({ rid });
				console.log('res', res);
				setLocal(res?.data?.isLocal);
			} catch (e) {
				console.log('e', e);
				return false;
			}
		})();
	}, [rid]);

	const getQRCode = async (value: number) => {
		if (!enterpriseId || !room) {
			return;
		}
		const params = {
			inviteUsername: user.username,
			expire: value,
			attribution: enterpriseId,
			owner: user.username,
			ownerOrg: enterpriseId,
			t: room.t,
		};

		if (value === 1) {
			// @ts-ignore
			params.limitNumber = 1;
		}

		setLoading(true);
		try {
			const res = await fetch(params);

			const url = await QRCode.toDataURL(`join_federation#${res.data.inviteId}`);
			setUrl(url);
			setShowQRCode(true);
		} finally {
			setLoading(false);
		}
	};

	const onPress = () => {
		getQRCode(-1);
	};

	useEffect(() => {
		if (room.federated) {
			getQRCode(-1);
		}
	}, []);

	const download = () => {
		const a = document.createElement('a');
		a.href = url;
		a.target = '_blank';
		a.download = `${room.fname}.png`;
		document.body.appendChild(a);
		a.click();
		a.remove();
	};

	const federationQRCode = () => {
		return (
			<Box className={FederationQrCode}>
				<div className='container' ref={containerRef}>
					<div className='qrcode'>
						<Spin spinning={loading}>{url ? <img src={url} /> : null}</Spin>
					</div>
					<Button type='primary' disabled={!url} ghost onClick={download}>
						{t('Download_QR_Code')}
					</Button>
					<div className='desc'>
						<div>{t('QR_Code_Validity')}</div>
						<Select
							bordered={false}
							options={options}
							value={expire}
							onChange={(v) => {
								setExpire(v);
								getQRCode(v);
							}}
							dropdownStyle={{ zIndex: 90000 }}
							popupMatchSelectWidth={false}
							getPopupContainer={() => containerRef.current}
						/>
					</div>
					<div className={'tip'}>{t('Federation_QR_Tips2')}</div>
				</div>
			</Box>
		);
	};
	const federationTips = (tip: string, showButton: boolean) => {
		return (
			<Box className={FederationTips}>
				<GroupIcon />
				<div className={'tip'}>{tip}</div>
				{showButton ? (
					<Button type='primary' ghost onClick={() => onPress()}>
						{t('Federation_QR_Comfirm')}
					</Button>
				) : null}
			</Box>
		);
	};

	if (showQRCode) {
		return federationQRCode();
	}
	return federationTips(t('Federation_QR_Tips1'), true);
};
// eslint-disable-next-line react/no-multi-comp
const Organization: React.FC = () => {
	const { root, search, getDepartmentNamesByUserId, getDepartmentsByParentId, rootTree } = useContactContext();
	const [activeTab, setActiveTab] = useState(0);
	const [keyword, setKeyword] = useState(null);
	// const [users, setUsers] = useState<IStaff[]>([]);
	const { selected, addSelected, removeSelected, setSelected, disabled, multiple } = useStateContext();
	const itemRender = useCallback((user, index) => <UserComponent user={user} left={12} key={index} />, []);
	const t = useTranslation();

	// 查找 type 为 L2D 的值
	const findOtherRoot = (): string[] => {
		const results: string[] = [];
		// 使用 forEach 遍历 Map
		rootTree.forEach((item) => {
			if (item !== root?._id) {
				results.push(item);
			}
		});

		return results;
	};
	const realityRootData = useMemo(() => {
		if (!rootTree) return [];
		return findOtherRoot();
	}, [rootTree]);

	const filterText = useDebouncedValue(keyword, 200);
	const {
		queryResult: { data = { users: [], rooms: [], usersInRoomsLen: 0 } },
		loading: status,
	} = useSearch(filterText || '', true);

	let items = data.users;
	items = items?.map((item) => ({
		...item,
		isUser: true,
		username: item.name,
		name: item.fname || item.name,
		userId: item._id,
		departmentNames: getDepartmentNamesByUserId(item.name),
	}));
	// console.info('filterText============', data);

	// useEffect(() => {
	// 	console.info('items=========2', items);
	// 	setUsers(items);
	// }, [items]);

	// 遍历导入联系人到右侧列表：采用UserComponent组件的click的逻辑
	const handleBatchAdd = (res: string[]) => {
		// let existedNames:IStaff[]=[];
		for (const username of res) {
			if (disabled.has(username)) {
				return false;
				// existedNames.push(username)
			}
			if (selected.has(username)) {
				removeSelected(username);
			} else if (multiple) {
				addSelected(username);
			} else {
				setSelected(username);
			}
		}
	};

	const timer: any = useRef();
	// 手写防抖实现批量导入联系人
	const onChange = useMutableCallback((e) => {
		const text = e.currentTarget.value;
		setKeyword(text);

		if (timer.current) {
			clearTimeout(timer);
		}
		timer.current = setTimeout(() => {
			if (text.trim()) {
				// mac输入拼音时会触发onChange事件并将每个可组成文字的字母以空格分隔开 这样的话mac没点回车就会进去里面的逻辑  使用至少包含一个中文来阻止进入判断
				if (
					text.includes(',') ||
					text.includes('，') ||
					text.includes('、') ||
					(text.includes(' ') && text.length > 4 && /[\u4e00-\u9fff]/.test(text))
				) {
					const res: string[] = [];
					let unmatchString = '';
					let textArray: string[] = [];
					if (text.includes(',')) {
						textArray = text.split(',');
					} else if (text.includes('，')) {
						textArray = text.split('，');
					} else if (text.includes('、')) {
						textArray = text.split('、');
					} else if (text.includes(' ')) {
						textArray = text.split(' ');
					}
					if (!textArray[1]) {
						return;
					}
					const existedNames: IStaff[] = [];
					textArray.forEach((item1: string) => {
						if (!item1) {
						} else {
							item1 = item1.trim();
							const data = search(item1);
							if (data.length > 0) {
								data.forEach((item: IStaff) => {
									if (item.name === item1 && !disabled.has(item.username)) {
										res.push(item.username);
									} else {
										if (disabled.has(item.username)) {
											existedNames.push(item);
										}
										// 如果是中文凭借';',防止Mac输入法引起的bug
										if (/^[\u4e00-\u9fff]+$/.test(item1)) {
											unmatchString = `${unmatchString + item1};`;
										} else {
											return;
										}
										setUsers(data);
									}
								});
							} else if (item1 !== ' ') {
								unmatchString = `${unmatchString + item1};`;
							}
						}
					});
					handleBatchAdd(res);
					setKeyword(unmatchString);
					setUsers(existedNames);
				} else {
					// setUsers(items);
				}
			} else {
				setUsers([]);
			}
		}, 500);
	});

	return (
		<div className='side'>
			<div className='search'>
				<Input prefix={<SearchOutlined />} value={keyword} onChange={onChange} allowClear />
			</div>

			<div className={classNames('content', keyword && 'hidden')}>
				<Box className={tabsStyle}>
					<div className={activeTab === 0 ? 'active tab' : 'tab'} onClick={() => setActiveTab(0)}>
						{t('Recent_Contact_add_disc_member')}
					</div>
					<div className={activeTab === 1 ? 'active tab' : 'tab'} onClick={() => setActiveTab(1)}>
						{'PMT'}
					</div>
					<div className={activeTab === 2 ? 'active tab' : 'tab'} onClick={() => setActiveTab(2)}>
						{'L1D'}
					</div>
					<div className={activeTab === 3 ? 'active tab' : 'tab'} onClick={() => setActiveTab(3)}>
						{t('Ext_member_add_disc_member')}
					</div>
				</Box>

				<div className={classNames('panel', activeTab !== 0 && 'hidden')} style={{ marginTop: 8 }}>
					<HistoryComponent />
				</div>

				<div className={classNames('panel', activeTab !== 1 && 'hidden')} style={{ marginTop: 8 }}>
					{root
						? getDepartmentsByParentId(root._id).map((department) => (
								<DepartmentComponent key={department._id} department={department} left={0} />
						  ))
						: null}
				</div>
				<div className={classNames('panel', activeTab !== 2 && 'hidden')} style={{ marginTop: 8 }}>
					{realityRootData.length
						? getDepartmentsByParentId(realityRootData[0]).map((department) => (
								<DepartmentComponent key={department._id} department={department} left={0} />
						  ))
						: null}
				</div>
				<div className={classNames('federationPanel', activeTab !== 3 && 'hidden')} style={{ marginTop: 8 }}>
					<PartnersComponent />
				</div>
			</div>

			{keyword ? (
				<>
					{items?.length ? (
						<InfiniteScroll
							style={{ marginTop: 8 }}
							className={classNames('panel', !keyword && 'hidden')}
							data={items}
							itemRender={(item, index) => itemRender(item, index)}
							itemHeight={48}
							itemKey='_id'
						/>
					) : (
						<div style={{ marginTop: 8 }} className={classNames('panel', !keyword && 'hidden')}>
							<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
						</div>
					)}
				</>
			) : null}
		</div>
	);
};

export default Organization;
