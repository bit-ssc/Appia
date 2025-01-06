import type { IStaff, IUserSummary } from '@rocket.chat/core-typings';
import { css } from '@rocket.chat/css-in-js';
import { Sidebar, TextInput, Box, Icon, CheckBox } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import { debounce } from 'lodash';
import type { FormEvent, ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { useContactContext } from '../../views/contact/ContactContext';
import UserAvatar from '../avatar/UserAvatar';

interface IProps {
	selectedList: IUserSummary[];
	handleCheckBox: (user: IUserSummary) => void;
	handleBatchAdd: (user: IUserSummary) => void;
	disabledUsers: string[];
}

const SearchUsers = ({ selectedList, handleCheckBox, handleBatchAdd, disabledUsers }: IProps): ReactElement => {
	const { search } = useContactContext();
	const companyId = useSetting('Enterprise_ID') as string;
	const t = useTranslation();
	const [searchOpen, setSearchOpen] = useState(false);
	const [filterText, setFilterText] = useState('');
	const [items, setItems] = useState<IUserSummary[]>([]);
	// const isComposingRef = useRef(false);

	const handleCloseSearch = useMutableCallback(() => {
		setSearchOpen(false);
		setFilterText('');
	});

	let timer: any = null;
	const onChange = (e) => {
		const text = e.currentTarget.value;
		setFilterText(text);
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			if (text.trim()) {
				// mac输入拼音时会触发onChange事件并将每个可组成文字的字母以空格分隔开 这样的话mac没点回车就会进去里面的逻辑  使用至少包含一个中文来阻止进入判断
				if (
					text.includes(',') ||
					text.includes('，') ||
					text.includes('、') ||
					(text.includes(' ') && text.length > 4 && /[\u4e00-\u9fff]/.test(text))
				) {
					const res: IStaff[] = [];
					let unmatchString = '';
					let textArray: string[] = [];
					if (text.includes(',')) {
						textArray = text.split(',');
					} else if (text.includes('，')) {
						textArray = text.split('，');
					} else if (text.includes('、')) {
						textArray = text.split('、');
					} else if (text.includes(' ')) {
						textArray = text.split(/\s+/);
					}
					if (!textArray[1]) {
						return;
					}
					textArray.forEach((item1: string) => {
						if (!item1) {
						} else {
							item1 = item1.trim();
							const data = search(item1);
							if (data.length > 0) {
								data.forEach((item: IStaff) => {
									if (item.name === item1) {
										res.push(item);
									} else {
										if (/^[\u4e00-\u9fff]+$/.test(item1)) {
											unmatchString = `${unmatchString + item1};`;
										} else {
											return;
										}
										setItems(data);
										setSearchOpen(true);
									}
								});
							} else if (item1 !== ' ') {
								unmatchString = `${unmatchString + item1};`;
							}
						}
					});
					handleBatchAdd(res);
					if (unmatchString !== '') {
						setSearchOpen(true);
					}
					setFilterText(unmatchString);
				} else {
					const data = search(text);
					setItems(data);
					setSearchOpen(true);
				}
			} else {
				setItems([]);
				setSearchOpen(false);
			}
		}, 500);
	};

	const onCheck = (e: FormEvent<HTMLDivElement>, user: IUserSummary): void => {
		e.stopPropagation();
		handleCheckBox(user);
	};

	const renderItem = (_: number, user: IUserSummary): ReactElement => (
		<Sidebar.Item clickable={true} onClick={(e: FormEvent<HTMLDivElement>): void => onCheck(e, user)}>
			<CheckBox
				style={{ paddingRight: '10px' }}
				onClick={(e: FormEvent<HTMLLabelElement>): void => e.stopPropagation()}
				onChange={() => handleCheckBox(user)}
				disabled={disabledUsers?.includes(user.username)}
				checked={selectedList.some((a) => a._id === user._id)}
			/>
			<Sidebar.Item.Avatar>
				<UserAvatar size='x32' username={user.username} etag={user.avatarETag} />
			</Sidebar.Item.Avatar>
			<Sidebar.Item.Content>
				<Sidebar.Item.Title data-qa='sidebar-item-title'>
					<div style={{ color: '#000' }}>{user.name}</div>
					{user.departmentNames?.length ? (
						<div style={{ fontSize: '12px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
							{user.departmentNames[0]}
						</div>
					) : null}
				</Sidebar.Item.Title>
			</Sidebar.Item.Content>
		</Sidebar.Item>
	);

	const renderList = (): ReactElement => (
		<Box
			position='absolute'
			rcx-sidebar
			h='330px'
			display='flex'
			flexDirection='column'
			zIndex={99}
			w='full'
			className={css`
				left: 0;
				top: 60px;
			`}
			backgroundColor='#FFFFFF'
		>
			<Virtuoso style={{ height: '320px' }} totalCount={items?.length} data={items} itemContent={renderItem} />
		</Box>
	);

	return (
		<Sidebar.TopBar.Section className='bm-forward-search'>
			<TextInput
				value={filterText}
				className='bm-search-input'
				placeholder={t('Search')}
				addon={searchOpen ? <Icon name='cross' size='x20' onClick={handleCloseSearch} /> : <Icon name='magnifier' size='x20' />}
				onChange={onChange}
			/>
			{searchOpen && renderList()}
		</Sidebar.TopBar.Section>
	);
};

export default SearchUsers;
