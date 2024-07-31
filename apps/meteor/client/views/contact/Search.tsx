import type { IUserSummary } from '@rocket.chat/core-typings';
import { css } from '@rocket.chat/css-in-js';
import { TextInput, Icon, Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useRoute, useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import tinykeys from 'tinykeys';

import { useContactContext } from './ContactContext';
import { getDepartment } from './useContact';
import UserAvatar from '../../components/avatar/UserAvatar';
import ScrollerWithCustomProps from '../../sidebar/search/ScrollerWithCustomProps';

interface IProps {
	onClick: (type: 'user' | 'department', value: string) => void;
	resetSelected: () => void;
}

const Search = ({ onClick, resetSelected }: IProps): ReactElement => {
	const t = useTranslation();
	const companyId = useSetting('Enterprise_ID');
	const directRoute = useRoute('direct');
	const [searchOpen, setSearchOpen] = useState(false);
	const [filterText, setFilterText] = useState('');
	const { search } = useContactContext();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [items, setItems] = useState<IUserSummary[]>([]);
	let timer: any = null;

	const handleCloseSearch = useMutableCallback(() => {
		setSearchOpen(false);
		resetSelected();
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
				setSearchOpen(true);
				onSelectUser(0, data[0]);
			} else {
				setItems([]);
				setSearchOpen(false);
				resetSelected();
			}
		}, 500);
	});

	useEffect(() => {
		if (items.length === 0) {
			return;
		}
		const unsubscribe = tinykeys(document.body, {
			ArrowUp: () => {
				if (currentIndex > 0) {
					onSelectUser(currentIndex - 1);
				}
			},
			ArrowDown: () => {
				if (currentIndex < items.length - 1) {
					onSelectUser(currentIndex + 1);
				}
			},
			Enter: () => {
				const user = items[currentIndex];
				if (user) {
					directRoute.push({
						rid: user.username,
					});
				}
			},
		});
		return () => {
			unsubscribe();
		};
	}, [items, onSelectUser, currentIndex, directRoute]);

	const renderItem = (index: number, user: IUserSummary): ReactElement => (
		<div
			key={user._id}
			className={`contact-search-item${index === currentIndex ? ' contact-search-item-active' : ''}`}
			onClick={() => onSelectUser(index, user)}
		>
			<div className='contact-search-item-avatar'>
				<UserAvatar size='x36' username={user.username} etag={user.avatarETag} />
			</div>
			<div className='contact-search-item-name'>
				{user.name}
				<div className='contact-search-item-desc' style={{ color: '#9ca0a3', fontSize: '12px' }}>
					{user.importIds &&
						user.importIds[0] &&
						getDepartment(user.importIds[0])
							.filter((v) => v !== companyId)
							.join('/')}
				</div>
			</div>
		</div>
	);

	const renderList = (): ReactElement => (
		<Box
			position='absolute'
			rcx-sidebar
			h='full'
			display='flex'
			flexDirection='column'
			zIndex={99}
			w='full'
			className={css`
				left: 0;
				top: 68px;
			`}
			backgroundColor='#FFFFFF'
		>
			<Box aria-expanded='true' role='listbox' tabIndex={-1} flexShrink={1} h='full' w='full'>
				<Virtuoso
					style={{ height: '100%', width: '100%' }}
					totalCount={items?.length}
					data={items}
					components={{ Scroller: ScrollerWithCustomProps }}
					itemContent={renderItem}
				/>
			</Box>
		</Box>
	);

	return (
		<>
			<TextInput
				value={filterText}
				className='bm-search-input'
				// onFocus={openSearch}
				placeholder={t('Search')}
				addon={searchOpen ? <Icon name='cross' size='x20' onClick={handleCloseSearch} /> : <Icon name='magnifier' size='x20' />}
				onChange={onChange}
			/>
			{searchOpen && renderList()}
		</>
	);
};

export default Search;
