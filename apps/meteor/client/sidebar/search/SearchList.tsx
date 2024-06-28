import type { IRoom, ISubscription } from '@rocket.chat/core-typings';
import { Sidebar, TextInput, Box, Icon } from '@rocket.chat/fuselage';
import { useMutableCallback, useDebouncedValue, useAutoFocus, useUniqueId, useMergedRefs } from '@rocket.chat/fuselage-hooks';
import { escapeRegExp } from '@rocket.chat/string-helpers';
import { useUserPreference, useUserSubscriptions, useSetting, useTranslation, useMethod } from '@rocket.chat/ui-contexts';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
// import { Meteor } from 'meteor/meteor';
import type { ReactElement, MutableRefObject, SetStateAction, Dispatch, FormEventHandler, Ref, MouseEventHandler } from 'react';
import React, { forwardRef, useState, useMemo, useEffect, useRef } from 'react';
import type { VirtuosoHandle } from 'react-virtuoso';
import { Virtuoso } from 'react-virtuoso';
import tinykeys from 'tinykeys';

import Row from './Row';
import ScrollerWithCustomProps from './ScrollerWithCustomProps';
import { appiaSearchListStyle } from './appia-style';
import { getConfig } from '../../lib/utils/getConfig';
import { useAvatarTemplate } from '../hooks/useAvatarTemplate';
import { usePreventDefault } from '../hooks/usePreventDefault';
import { useTemplateByViewMode } from '../hooks/useTemplateByViewMode';

const TopBarSection: React.FC<{ className?: string }> = ({ children, className }) => (
	<Sidebar.TopBar className={['rcx-sidebar-topbar--section', className].filter(Boolean).join(' ')}>
		<Sidebar.TopBar.Wrapper children={children} />
	</Sidebar.TopBar>
);

/**
const shortcut = ((): string => {
	if (!(Meteor as any).Device.isDesktop()) {
		return '';
	}
	if (window.navigator.platform.toLowerCase().includes('mac')) {
		return '(\u2318+K)';
	}
	return '(\u2303+K)';
})();
*/

const LIMIT = parseInt(String(getConfig('Sidebar_Search_Spotlight_LIMIT', 20)));

const options = {
	sort: {
		lm: -1,
		name: 1,
	},
	limit: LIMIT,
} as const;

const useSearchItems = (filterText: string): UseQueryResult<(ISubscription & IRoom)[] | undefined, Error> => {
	const [, mention, name] = useMemo(() => filterText.match(/(@|#)?(.*)/i) || [], [filterText]);
	const query = useMemo(() => {
		const filterRegex = new RegExp(escapeRegExp(name), 'i');

		return {
			$or: [{ name: filterRegex }, { fname: filterRegex }],
			...(mention && {
				t: mention === '@' ? 'd' : { $ne: 'd' },
			}),
		};
	}, [name, mention]);

	const localRooms = useUserSubscriptions(query, options);

	const usernamesFromClient = [...localRooms?.map(({ t, name }) => (t === 'd' ? name : null))].filter(Boolean) as string[];

	const searchForChannels = mention === '#';
	const searchForDMs = mention === '@';

	const type = useMemo(() => {
		if (searchForChannels) {
			return { users: false, rooms: true, includeFederatedRooms: true };
		}
		if (searchForDMs) {
			return { users: true, rooms: false };
		}
		return { users: true, rooms: true, includeFederatedRooms: true };
	}, [searchForChannels, searchForDMs]);

	const getSpotlight = useMethod('spotlight');

	return useQuery(
		['sidebar/search/spotlight', name, usernamesFromClient, type],
		async () => {
			if (localRooms.length === LIMIT) {
				return localRooms;
			}

			const spotlight = await getSpotlight(name, usernamesFromClient, type);

			const filterUsersUnique = ({ _id }: { _id: string }, index: number, arr: { _id: string }[]): boolean =>
				index === arr.findIndex((user) => _id === user._id);

			const roomFilter = (room: { t: string; uids?: string[]; _id: string; name?: string }): boolean =>
				!localRooms.find(
					(item) =>
						(room.t === 'd' && room.uids && room.uids.length > 1 && room.uids?.includes(item._id)) ||
						[item.rid, item._id].includes(room._id),
				);
			const usersFilter = (user: { _id: string }): boolean =>
				!localRooms.find((room) => room.t === 'd' && room.uids && room.uids?.length === 2 && room.uids.includes(user._id));

			const userMap = (user: {
				_id: string;
				name: string;
				username: string;
				avatarETag?: string;
			}): {
				_id: string;
				t: string;
				name: string;
				fname: string;
				avatarETag?: string;
			} => ({
				_id: user._id,
				t: 'd',
				name: user.username,
				fname: user.name,
				avatarETag: user.avatarETag,
			});

			type resultsFromServerType = {
				_id: string;
				t: string;
				name: string;
				fname?: string;
				avatarETag?: string | undefined;
				uids?: string[] | undefined;
			}[];

			const resultsFromServer: resultsFromServerType = [];
			resultsFromServer.push(...spotlight.users.filter(filterUsersUnique).filter(usersFilter).map(userMap));
			resultsFromServer.push(...spotlight.rooms.filter(roomFilter));

			if (!filterText) {
				return Array.from(new Set([]));
			}

			const exact = resultsFromServer?.filter((item) => [item.name, item.fname].includes(name));
			return Array.from(new Set([...exact, ...localRooms, ...resultsFromServer]));
		},
		{
			staleTime: 60_000,
			keepPreviousData: true,
			placeholderData: localRooms,
		},
	);
};

const useInput = (initial: string): { value: string; onChange: FormEventHandler; setValue: Dispatch<SetStateAction<string>> } => {
	const [value, setValue] = useState(initial);
	const onChange = useMutableCallback((e) => {
		setValue(e.currentTarget.value);
	});
	return { value, onChange, setValue };
};

const toggleSelectionState = (next: HTMLElement, current: HTMLElement | undefined, input: HTMLElement | undefined): void => {
	input?.setAttribute('aria-activedescendant', next.id);
	next.setAttribute('aria-selected', 'true');
	next.classList.add('rcx-sidebar-item--selected');
	if (current) {
		current.removeAttribute('aria-selected');
		current.classList.remove('rcx-sidebar-item--selected');
	}
};

/**
 * @type import('react').ForwardRefExoticComponent<{ onClose: unknown } & import('react').RefAttributes<HTMLElement>>
 */

type SearchListProps = {
	onClose: () => void;
};

const SearchList = forwardRef(function SearchList({ onClose }: SearchListProps, ref): ReactElement {
	const listId = useUniqueId();
	const t = useTranslation();
	const { setValue: setFilterValue, ...filter } = useInput('');

	const cursorRef = useRef<HTMLInputElement>(null);
	const autofocus: Ref<HTMLInputElement> = useMergedRefs(useAutoFocus<HTMLInputElement>(), cursorRef);

	const listRef = useRef<VirtuosoHandle>(null);
	const boxRef = useRef<HTMLDivElement>(null);

	const selectedElement: MutableRefObject<HTMLElement | null | undefined> = useRef(null);
	const itemIndexRef = useRef(0);

	const sidebarViewMode = useUserPreference('sidebarViewMode');
	const useRealName = useSetting('UI_Use_Real_Name');

	const sideBarItemTemplate = useTemplateByViewMode();
	const avatarTemplate = useAvatarTemplate();

	const extended = sidebarViewMode === 'extended';

	const filterText = useDebouncedValue(filter.value, 100);

	const placeholder = [t('Search') /* , shortcut*/].filter(Boolean).join(' ');

	const { data: items = [], isLoading } = useSearchItems(filterText);

	const itemData = useMemo(
		() => ({
			items,
			t,
			SideBarItemTemplate: sideBarItemTemplate,
			avatarTemplate,
			useRealName,
			extended,
			sidebarViewMode,
		}),
		[avatarTemplate, extended, items, useRealName, sideBarItemTemplate, sidebarViewMode, t],
	);

	const changeSelection = useMutableCallback((dir) => {
		let nextSelectedElement = null;

		if (dir === 'up') {
			nextSelectedElement = (selectedElement.current?.parentElement?.previousSibling as HTMLElement).querySelector('a');
		} else {
			nextSelectedElement = (selectedElement.current?.parentElement?.nextSibling as HTMLElement).querySelector('a');
		}

		if (nextSelectedElement) {
			toggleSelectionState(nextSelectedElement, selectedElement.current || undefined, cursorRef?.current || undefined);
			return nextSelectedElement;
		}
		return selectedElement.current;
	});

	const resetCursor = useMutableCallback(() => {
		itemIndexRef.current = 0;
		listRef.current?.scrollToIndex({ index: itemIndexRef.current });

		selectedElement.current = boxRef.current?.querySelector('a.rcx-sidebar-item');

		if (selectedElement.current) {
			toggleSelectionState(selectedElement.current, undefined, cursorRef?.current || undefined);
		}
	});

	usePreventDefault(boxRef);

	useEffect(() => {
		resetCursor();
	});

	useEffect(() => {
		resetCursor();
	}, [filterText, resetCursor]);

	useEffect(() => {
		if (!cursorRef?.current) {
			return;
		}
		return tinykeys(cursorRef?.current, {
			Escape: (event) => {
				event.preventDefault();
				setFilterValue((value) => {
					if (!value) {
						onClose();
					}
					resetCursor();
					return '';
				});
			},
			Tab: onClose,
			ArrowUp: () => {
				const currentElement = changeSelection('up');
				itemIndexRef.current = Math.max(itemIndexRef.current - 1, 0);
				listRef.current?.scrollToIndex({ index: itemIndexRef.current });
				selectedElement.current = currentElement;
			},
			ArrowDown: () => {
				const currentElement = changeSelection('down');
				itemIndexRef.current = Math.min(itemIndexRef.current + 1, items.length + 1);
				listRef.current?.scrollToIndex({ index: itemIndexRef.current });
				selectedElement.current = currentElement;
			},
			Enter: (e) => {
				if (selectedElement.current && !e.isComposing) {
					selectedElement.current.click();
				}
			},
		});
	}, [cursorRef, changeSelection, items.length, onClose, resetCursor, setFilterValue]);

	const handleClick: MouseEventHandler<HTMLElement> = (e): void => {
		if (e.target instanceof Element && [e.target.tagName, e.target.parentElement?.tagName].includes('BUTTON')) {
			return;
		}
		return onClose();
	};

	return (
		<Box
			position='absolute'
			rcx-sidebar
			h='full'
			display='flex'
			flexDirection='column'
			zIndex={99}
			w='full'
			className={appiaSearchListStyle}
			ref={ref}
			role='search'
		>
			<TopBarSection {...({ flexShrink: 0 } as any)} is='form'>
				<TextInput
					aria-owns={listId}
					data-qa='sidebar-search-input'
					ref={autofocus}
					{...filter}
					placeholder={placeholder}
					role='searchbox'
					addon={<Icon name='cross' size='x20' onClick={onClose} />}
				/>
			</TopBarSection>
			<Box
				ref={boxRef}
				role='listbox'
				id={listId}
				tabIndex={-1}
				flexShrink={1}
				h='full'
				w='full'
				data-qa='sidebar-search-result'
				aria-live='polite'
				aria-atomic='true'
				aria-busy={isLoading}
				onClick={handleClick}
			>
				<Virtuoso
					style={{ height: '100%', width: '100%' }}
					totalCount={items.length}
					data={items}
					components={{ Scroller: ScrollerWithCustomProps }}
					computeItemKey={(_, room) => room._id}
					itemContent={(_, data): ReactElement => <Row data={itemData} item={data} />}
					ref={listRef}
				/>
			</Box>
		</Box>
	);
});

export default SearchList;
