import { TextInput, Icon } from '@rocket.chat/fuselage';
// import { Sidebar } from '@rocket.chat/fuselage';
import { useMutableCallback, useOutsideClick } from '@rocket.chat/fuselage-hooks';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { VFC, HTMLAttributes } from 'react';
import React, { useState, useEffect, useRef } from 'react';
import tinykeys from 'tinykeys';

import { searchInputStyle } from './appia-style';
import SearchList from '../../search/SearchList';
import { searchInputStyle } from './appia-style';

const Search: VFC<Omit<HTMLAttributes<HTMLElement>, 'is'>> = () => {
	const [searchOpen, setSearchOpen] = useState(false);
	const t = useTranslation();

	const ref = useRef<HTMLElement>(null);
	const handleCloseSearch = useMutableCallback(() => {
		setSearchOpen(false);
	});

	useOutsideClick([ref], handleCloseSearch);

	const openSearch = useMutableCallback(() => {
		setSearchOpen(true);
	});

	useEffect(() => {
		const unsubscribe = tinykeys(window, {
			'$mod+K': (event) => {
				event.preventDefault();
				openSearch();
			},
			'$mod+P': (event) => {
				event.preventDefault();
				openSearch();
			},
		});

		return (): void => {
			unsubscribe();
		};
	}, [openSearch]);

	return (
		<>
			{/* <Sidebar.TopBar.Action icon='magnifier' onClick={openSearch} {...props} />*/}
			<TextInput
				className={searchInputStyle}
				onFocus={openSearch}
				placeholder={t('Search')}
				addon={<Icon name='magnifier' size='x20' onClick={openSearch} />}
			/>
			{searchOpen && <SearchList ref={ref} onClose={handleCloseSearch} />}
		</>
	);
};

export default Search;
