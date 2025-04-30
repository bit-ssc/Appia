import type { IUserSummary } from '@rocket.chat/core-typings';
import { css } from '@rocket.chat/css-in-js';
import { TextInput, Icon, Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';

import { Collapse } from '../../components/AppiaUI';
import UserAvatar from '../../components/avatar/UserAvatar';
import { searchInputStyle } from '../../sidebar/header/actions/appia-style';
import { transformData } from './Contact';
import { useContactContext } from './ContactContext';
import ContactIcon from './ContactIcon';
import { useCurrentContext } from './CurrentContext';
import { searchStyle } from './search-style';

import type { ICopNode } from '/client/views/contact/coptree/context/CopTreeContext';
import { useCopTreeContext } from '/client/views/contact/coptree/context/CopTreeContext';
import { CopIconMap } from '/client/views/contact/coptree/component/CopIcon';

interface IProps {
	onClick: (type: 'user' | 'department' | 'cop', value: string) => void;
	resetSelected: () => void;
}

interface IListMap {
	key: string;
	label: string;
	name: 'users' | 'rooms' | 'messages';
}

const Search = ({ onClick, resetSelected }: IProps): ReactElement => {
	const t = useTranslation();
	const [searchOpen, setSearchOpen] = useState(false);
	const [filterText, setFilterText] = useState('');
	const { search, searchFromL1D, searchFromPMT, updateCurrentParentDepartmentIds, rootTree, partners } = useContactContext();
	const { searchResult: searchCops, search: searchCop, getCopDepth } = useCopTreeContext();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [items, setItems] = useState<IUserSummary[]>([]);
	const [federatedUsers, setFederatedUsers] = useState([]);
	const [l1ds, setL1ds] = useState([]);
	const [pmts, setPmts] = useState([]);
	const { setCurrent } = useCurrentContext();
	let timer: any = null;
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [searchBoxRef, setSearchBoxRef] = useState<HTMLDivElement | null>(null);

	const handleCloseSearch = useMutableCallback(() => {
		setSearchOpen(false);
		// resetSelected();
		setFilterText('');
	});

	const onSelectUser = useCallback(
		(index: number, user?: IUserSummary) => {
			user = user || items[index] || {};
			setCurrentIndex(index);
			onClick('user', user._id || '');
		},
		[setCurrentIndex, onClick, items],
	);

	const handleClick = useCallback(
		(type: 'user' | 'department' | 'federatedUser', value: any, item: any) => {
			console.info('handleClick===========', type, value);
			if (!rootTree.includes(value)) {
				setCurrent({
					value,
					type,
				});
			}

			// if (type === 'user') {
			// 	console.info('handleClick===========user', item);
			// 	updateCurrentParentDepartmentIds(`${item.pIdType}-${item.pId}`);
			// } else
			if (type === 'department') {
				updateCurrentParentDepartmentIds(item._id);
			} else if (type === 'federatedUser') {
				console.info('currentParentDepartmentIds==', item);
				updateCurrentParentDepartmentIds(item.pId);
			}

			handleCloseSearch();
		},
		[setCurrent, handleCloseSearch],
	);

	const onChange = useMutableCallback((e) => {
		const text = e.currentTarget.value;
		setFilterText(text);
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			if (text.trim()) {
				const data = search(text);
				setItems(data);

				const l1dsData = searchFromL1D(text);
				setL1ds(l1dsData);

				const pmtsData = searchFromPMT(text);
				setPmts(pmtsData);

				const federatedUsersData = Object.values(transformData(partners))
					.map((v) => v.users)
					.flat()
					.filter((v) => v.name?.includes(text) || v.pinyinName?.includes(text));
				setFederatedUsers(federatedUsersData);

				searchCop(text);

				setSearchOpen(true);
				if (!data.length) {
					resetSelected?.();
				}
			} else {
				setItems([]);
				setSearchOpen(false);
				resetSelected();
			}
		}, 500);
	});

	/* 	const renderItem = (index: number, user: IUserSummary): ReactElement => (
		<div
			key={user._id}
			className={`contact-search-item${index === currentIndex ? ' contact-search-item-active' : ''}`}
			onClick={() => onSelectUser(index, user)}
		>
			<div className='contact-search-item-avatar'>
				<UserAvatar size='x36' username={user.username} etag={user.avatarETag} />
			</div>
			<div className='contact-search-item-name'>{user.name}</div>
		</div>
	); */

	const renderItems = (items: any): ReactElement => {
		console.info('items=======', items);
		return (
			<>
				{items.map((v, index) => {
					return (
						<div
							className='contact-content-item-content-user'
							key={`${v.name}-${index}`}
							onClick={() => {
								console.info('hahah=======', v);
								let type = '';
								let value;
								if (v.treeType === 'STAFF') {
									type = 'user';
									value = v._id || '';
								} else if (v.type === 'user') {
									type = 'federatedUser';
									value = {
										name: v.name,
										username: v.username,
									};
								} else {
									type = 'department';
									value = v._id;
								}
								console.info('hahah=======', type, value);
								handleClick(type, value, v);
							}}
						>
							<div
								className='contact-content-item-content-user-avatar'
								style={{ display: 'flex', flexDirection: 'row', alignItems: 'end' }}
							>
								{v.treeType === 'STAFF' || v.type === 'user' ? (
									<UserAvatar size='x28' username={v.username} etag={v.avatarETag} />
								) : (
									<ContactIcon type={v.type} pId={v.parent} />
								)}
							</div>
							<div className='contact-content-item-content-user-name'>{v.name}</div>
						</div>
					);
				})}
			</>
		);
	};

	const renderCopItems = (nodes: ICopNode[]) => {
		return (
			<>
				{nodes.map((node, index) => {
					const depth = getCopDepth(node);
					return (
						<div
							className='contact-content-item-content-user'
							key={`${node.name}-${index}`}
							onClick={() => {
								onClick('cop', node.id);
								handleCloseSearch();
							}}
						>
							<div
								className='contact-content-item-content-user-avatar'
								style={{ display: 'flex', flexDirection: 'row', alignItems: 'end' }}
							>
								{CopIconMap[`${depth}`]?.({ fontSize: 28 })}
							</div>
							<div className='contact-content-item-content-user-name'>{node.name}</div>
						</div>
					);
				})}
			</>
		);
	};

	const collapseItems = useMemo(() => {
		const result = [];
		if (items.length) {
			result.push({
				key: '4',
				label: t('Members'),
				children: renderItems(items),
			});
		}
		if (pmts.length) {
			result.push({
				key: '5',
				label: 'PMT',
				children: renderItems(pmts),
			});
		}
		if (l1ds.length) {
			result.push({
				key: '6',
				label: 'L1D',
				children: renderItems(l1ds),
			});
		}
		if (federatedUsers.length) {
			result.push({
				key: '7',
				label: t('Ext_member_add_disc_member'),
				children: renderItems(federatedUsers),
			});
		}
		if (searchCops?.length) {
			result.push({
				key: '8',
				label: 'COP',
				children: renderCopItems(searchCops),
			});
		}
		return result;
	}, [items, federatedUsers, l1ds, pmts, t, searchCops]);

	const renderList = (): ReactElement => {
		if (!containerRef.current || !searchBoxRef) {
			return <></>;
		}

		const rect = searchBoxRef.getBoundingClientRect();

		return createPortal(
			<Box
				rcx-sidebar
				position='fixed'
				display='flex'
				className={css`
					top: ${rect.bottom + 16}px;
					left: ${rect.left}px;
					width: ${rect.width}px;
					overflow-y: auto;
					max-height: 300px;
					border: 1px solid #e5e6eb;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
					z-index: 9999;
				`}
				flexDirection='column'
				zIndex={9999}
				backgroundColor='#FFFFFF'
				borderRadius={'8px'}
			>
				<Box aria-expanded='true' role='listbox' tabIndex={-1} flexShrink={1} h='full' w='full' className={searchStyle}>
					<Collapse items={collapseItems} ghost defaultActiveKey={['4', '5', '6', 7, '8']} expandIcon={() => null} onChange={() => {}} />
				</Box>
			</Box>,
			document.body,
		);
	};

	useEffect(() => {
		const container = document.createElement('div');
		document.body.appendChild(container);
		containerRef.current = container;

		return () => {
			if (container && document.body.contains(container)) {
				document.body.removeChild(container);
			}
		};
	}, []);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }} ref={setSearchBoxRef}>
			<Input
				value={filterText}
				className={searchInputStyle}
				placeholder={t('Search_Contact')}
				prefix={<SearchOutlined style={{ color: '#C9CDD4', fontSize: '15px' }} />}
				suffix={searchOpen ? <CloseCircleOutlined style={{ color: '#C9CDD4', fontSize: '15px' }} onClick={handleCloseSearch} /> : null}
				onChange={onChange}
				style={{
					border: 'none',
					boxShadow: 'none',
					width: '100%',
					height: '100%',
					padding: 0,
					backgroundColor: 'transparent',
				}}
				bordered={false}
			/>
			{searchOpen && renderList()}
		</div>
	);
};

export default Search;
