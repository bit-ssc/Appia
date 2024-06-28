import type { IUserSummary } from '@rocket.chat/core-typings';
import { css } from '@rocket.chat/css-in-js';
import { Sidebar, TextInput, Box, Icon, CheckBox } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import UserAvatar from '../../../../../../components/avatar/UserAvatar';
import { useContactContext } from '../../../../../contact/ContactContext';

interface IProps {
	selectedList: IUserSummary[];
	handleCheckBox: (user: IUserSummary) => void;
}

const SearchUsers = ({ selectedList, handleCheckBox, disabledUsers }: IProps): ReactElement => {
	const { search, departmentMap } = useContactContext();
	const t = useTranslation();
	const [searchOpen, setSearchOpen] = useState(false);
	const [filterText, setFilterText] = useState('');
	const [items, setItems] = useState<IUserSummary[]>([]);

	const handleCloseSearch = useMutableCallback(() => {
		setSearchOpen(false);
	});

	let timer: any = null;
	const onChange = useMutableCallback((e) => {
		const text = e.currentTarget.value;
		setFilterText(text);
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			if (text.trim()) {
				const data = search(text);
				setItems(data.filter((v) => disabledUsers.has(v.username)));
				setSearchOpen(true);
			} else {
				setItems([]);
				setSearchOpen(false);
			}
		}, 500);
	});

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
							{user.departmentNames?.join('、')}
						</div>
					) : null}
				</Sidebar.Item.Title>
			</Sidebar.Item.Content>
		</Sidebar.Item>
	);

	return (
		<Sidebar.TopBar.Section className='bm-forward-search'>
			<TextInput
				value={filterText}
				className='bm-search-input'
				// onFocus={openSearch}
				placeholder={t('Search')}
				addon={searchOpen ? <Icon name='cross' size='x20' onClick={handleCloseSearch} /> : <Icon name='magnifier' size='x20' />}
				onChange={onChange}
			/>
			{searchOpen && (
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
			)}
		</Sidebar.TopBar.Section>
	);
};

export default SearchUsers;
