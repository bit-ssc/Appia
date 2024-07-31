import { css } from '@rocket.chat/css-in-js';
import { Sidebar, TextInput, Box, Icon, CheckBox } from '@rocket.chat/fuselage';
import { useMutableCallback, useDebouncedValue, useStableArray, useAutoFocus, useUniqueId } from '@rocket.chat/fuselage-hooks';
import { escapeRegExp } from '@rocket.chat/string-helpers';
import { useTranslation, useUserSubscriptions, useMethod } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import React, { forwardRef, useState, useMemo, useEffect, useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import tinykeys from 'tinykeys';

import { AsyncStatePhase } from '../../hooks/useAsyncState';
// import { useMethodData } from '../../hooks/useMethodData';
import { roomCoordinator } from '../../lib/rooms/roomCoordinator';
import RoomAvatar from '../avatar/RoomAvatar';

const shortcut = (() => {
	if (!Meteor.Device.isDesktop()) {
		return '';
	}
	if (window.navigator.platform.toLowerCase().includes('mac')) {
		return '(\u2318+K)';
	}
	return '(\u2303+K)';
})();
console.log(`Search's shortcut: ${shortcut}`);

const useSpotlight = (filterText = '', usernames) => {
	const expression = /(@|#)?(.*)/i;
	const [, mention, name] = filterText.match(expression);

	const searchForChannels = mention === '#';
	const searchForDMs = mention === '@';

	const type = useMemo(() => {
		if (searchForChannels) {
			return { users: false, rooms: true };
		}
		if (searchForDMs) {
			return { users: true, rooms: false };
		}
		return { users: true, rooms: true };
	}, [searchForChannels, searchForDMs]);
	const args = useMemo(() => [name, usernames, type], [type, name, usernames]);

	const { value: data = { users: [], rooms: [] }, phase: status } = useMethod('spotlight', args);

	return useMemo(() => {
		if (!data) {
			return { data: { users: [], rooms: [] }, status: 'loading' };
		}
		return { data, status };
	}, [data, status]);
};

const options = {
	sort: {
		lm: -1,
		name: 1,
	},
};

const useSearchItems = (filterText) => {
	const expression = /(@|#)?(.*)/i;
	const teste = filterText.match(expression);

	const [, type, name] = teste;
	const query = useMemo(() => {
		const filterRegex = new RegExp(escapeRegExp(name), 'i');

		return {
			$or: [{ name: filterRegex }, { fname: filterRegex }],
			...(type && {
				t: type === '@' ? 'd' : { $ne: 'd' },
			}),
		};
	}, [name, type]);

	const localRooms = useUserSubscriptions(query, options);

	const usernamesFromClient = useStableArray([...localRooms?.map(({ t, name }) => (t === 'd' ? name : null))].filter(Boolean));

	const { data: spotlight, status } = useSpotlight(filterText, usernamesFromClient);

	return useMemo(() => {
		const resultsFromServer = [];

		const filterUsersUnique = ({ _id }, index, arr) => index === arr.findIndex((user) => _id === user._id);
		const roomFilter = (room) =>
			!localRooms.find(
				(item) => (room.t === 'd' && room.uids?.length > 1 && room.uids.includes(item._id)) || [item.rid, item._id].includes(room._id),
			);
		const usersfilter = (user) => !localRooms.find((room) => room.t === 'd' && room.uids?.length === 2 && room.uids.includes(user._id));

		const userMap = (user) => ({
			_id: user._id,
			t: 'd',
			name: user.username,
			fname: user.name,
			avatarETag: user.avatarETag,
		});

		const exact = resultsFromServer.filter((item) => [item.usernamame, item.name, item.fname].includes(name));

		resultsFromServer.push(...spotlight.users.filter(filterUsersUnique).filter(usersfilter).map(userMap));
		resultsFromServer.push(...spotlight.rooms.filter(roomFilter));

		if (!filterText) {
			return { data: Array.from(new Set([])), status };
		}
		return { data: Array.from(new Set([...exact, ...localRooms, ...resultsFromServer])), status };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [localRooms, name, spotlight]);
};

const useInput = (initial) => {
	const [value, setValue] = useState(initial);
	const onChange = useMutableCallback((e) => {
		setValue(e.currentTarget.value);
	});
	return { value, onChange, setValue };
};

const toggleSelectionState = (next, current, input) => {
	input.setAttribute('aria-activedescendant', next.id);
	next.setAttribute('aria-selected', true);
	next.classList.add('rcx-sidebar-item--selected');
	if (current) {
		current.setAttribute('aria-selected', false);
		current.classList.remove('rcx-sidebar-item--selected');
	}
};

/**
 * @type import('react').ForwardRefExoticComponent<{ onClose: unknown } & import('react').RefAttributes<HTMLElement>>
 */
const SearchList = forwardRef(function SearchList({ onClose, handleCheckBox, selectedList }, ref) {
	const listId = useUniqueId();
	const t = useTranslation();
	const { setValue: setFilterValue, ...filter } = useInput('');

	const autofocus = useAutoFocus();

	const listRef = useRef();
	const boxRef = useRef();

	const selectedElement = useRef();
	const itemIndexRef = useRef(0);

	const filterText = useDebouncedValue(filter.value, 100);

	const placeholder = t('Search'); // [t('Search'), shortcut].filter(Boolean).join(' ');

	const { data: items, status } = useSearchItems(filterText);

	items.forEach((item) => {
		item.isUser = item.t === 'd' && !item.u;
		item.userId = item.isUser ? item._id : item.t === 'd' && item.u?._id && item.uids.find((id) => id !== item.u._id);
	});

	const changeSelection = useMutableCallback((dir) => {
		let nextSelectedElement = null;

		if (dir === 'up') {
			nextSelectedElement = selectedElement.current.parentElement.previousSibling.querySelector('a');
		} else {
			nextSelectedElement = selectedElement.current.parentElement.nextSibling.querySelector('a');
		}

		if (nextSelectedElement) {
			toggleSelectionState(nextSelectedElement, selectedElement.current, autofocus.current);
			return nextSelectedElement;
		}
		return selectedElement.current;
	});

	const resetCursor = useMutableCallback(() => {
		itemIndexRef.current = 0;
		listRef.current.scrollToIndex({ index: itemIndexRef.current });

		selectedElement.current = boxRef.current?.querySelector('a.rcx-sidebar-item');

		if (selectedElement.current) {
			toggleSelectionState(selectedElement.current, undefined, autofocus.current);
		}
	});

	const onCheck = (e, room) => {
		e.stopPropagation();
		handleCheckBox(room);
	};

	const renderRow = (room) => {
		// const isUser = room.t === 'd' && !room.u;
		const title = room.isUser ? room.fname || room.name : roomCoordinator.getRoomName(room.t, room);
		return (
			<Sidebar.Item clickable={true} onClick={(e) => onCheck(e, room)}>
				<CheckBox
					style={{ paddingRight: '10px' }}
					onClick={(e) => e.stopPropagation()}
					onChange={() => handleCheckBox(room)}
					checked={selectedList.some((a) => (a.userId ? a.userId === room.userId : a.rid === room.rid))}
				/>
				<Sidebar.Item.Avatar>
					<RoomAvatar size='x32' room={{ ...room, _id: room.rid || room._id, type: room.t }} />
				</Sidebar.Item.Avatar>
				<Sidebar.Item.Content>
					<Sidebar.Item.Title data-qa='sidebar-item-title'>{title}</Sidebar.Item.Title>
				</Sidebar.Item.Content>
			</Sidebar.Item>
		);
	};

	useEffect(() => {
		resetCursor();
	});

	useEffect(() => {
		resetCursor();
	}, [filterText, resetCursor]);

	useEffect(() => {
		if (!autofocus.current) {
			return;
		}
		const unsubscribe = tinykeys(autofocus.current, {
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
				listRef.current.scrollToIndex({ index: itemIndexRef.current });
				selectedElement.current = currentElement;
			},
			ArrowDown: () => {
				const currentElement = changeSelection('down');
				itemIndexRef.current = Math.min(itemIndexRef.current + 1, items?.length + 1);
				listRef.current.scrollToIndex({ index: itemIndexRef.current });
				selectedElement.current = currentElement;
			},
			Enter: () => {
				if (selectedElement.current) {
					selectedElement.current.click();
				}
			},
		});
		return () => {
			unsubscribe();
		};
	}, [autofocus, changeSelection, items.length, onClose, resetCursor, setFilterValue]);

	return (
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
				top: 0;
				background: #fff;
			`}
			ref={ref}
		>
			<Sidebar.TopBar.Section role='search' is='form' class='bm-forward-search'>
				<TextInput
					aria-owns={listId}
					data-qa='sidebar-search-input'
					ref={autofocus}
					{...filter}
					placeholder={placeholder}
					addon={<Icon name='cross' size='x20' onClick={onClose} />}
				/>
			</Sidebar.TopBar.Section>
			<Box
				ref={boxRef}
				aria-expanded='true'
				role='listbox'
				id={listId}
				tabIndex={-1}
				flexShrink={1}
				h='full'
				w='full'
				data-qa='sidebar-search-result'
				onClick={onClose}
				aria-busy={status !== AsyncStatePhase.RESOLVED}
			>
				<Virtuoso
					style={{ height: '395px', margin: '10px 8px 0 0' }}
					totalCount={items?.length}
					data={items}
					// components={{ Scroller: ScrollerWithCustomProps }}
					itemContent={(index, data) => renderRow(data)}
					ref={listRef}
				/>
			</Box>
		</Box>
	);
});

export default SearchList;
