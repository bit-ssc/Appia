import { Sidebar, CheckBox, ActionButton, TextInput, Icon } from '@rocket.chat/fuselage';
import { useMutableCallback, useOutsideClick } from '@rocket.chat/fuselage-hooks';
import { useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Virtuoso } from 'react-virtuoso';

import SearchList from './SearchList';
import { roomCoordinator } from '../../lib/rooms/roomCoordinator';
import { useRoomList } from '../../sidebar/hooks/useRoomList';
import Organization from '../Organization';
import RoomAvatar from '../avatar/RoomAvatar';

const styles = {
	container: {
		display: 'flex',
		jusitfyContent: 'space-between',
		border: '1px solid #DCDCDC',
		borderRadius: '4px',
	},
	leftBox: {
		width: '50%',
		padding: '0 0 10px 0',
		position: 'relative',
	},
	rightBox: {
		width: '50%',
		padding: '10px 8px 10px 0',
		borderLeft: '1px solid #DCDCDC',
	},
	checkbox: {
		paddingRight: '10px',
	},
	inputBox: {
		padding: '16px 16px 0 16p',
	},
	input: {
		width: '100%',
		height: '32px',
	},
	buttons: {
		display: 'flex',
		flexWrap: 'nowrap',
		alignItems: 'center',
	},
	tabSelected: {
		color: '#2878FF',
		borderBottomWidth: '2px',
		borderColor: '#2878FF',
		fontWeight: 600,
	},
	tabItem: {
		width: '50%',
		fontSize: '14px',
		borderColor: '#DCDCDC',
		borderBottomWidth: '1px',
		padding: '10px',
		textAlign: 'center',
	},
	selectedInfo: {
		fontWeight: 400,
		fontSize: '14px',
		lineHeight: '22px',
		color: 'rgba(0, 0, 0, 0.6)',
		margin: '10px 10px 5px 15px',
	},
};

// eslint-disable-next-line react/display-name
const RoomList = forwardRef((props, ref) => {
	const [selectedList, setSelectedList] = useState([]);
	const [searchOpen, setSearchOpen] = useState(false);
	const [orgDisplay, setOrgDisplay] = useState(false);
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();
	useImperativeHandle(ref, () => ({
		selectedList,
	}));

	let roomsList = useRoomList();
	roomsList = roomsList.filter((a) => typeof a !== 'string');

	roomsList.forEach((item) => {
		item.isUser = item.t === 'd' && !item.u;
		item.userId = item.isUser ? item._id : item.t === 'd' && item.u?._id && item.uids?.find((id) => id !== item.u._id);
	});

	const handleCheckBox = (item) => {
		const list = [...selectedList];
		item.isUser = item.t === 'd' && !item.u;
		item.userId = item.isUser ? item._id : item.t === 'd' && item.u?._id && item.uids.find((id) => id !== item.u._id);
		const index = list.findIndex((a) => (a.userId ? a.userId === item.userId : a.rid === item.rid));
		if (index === -1) {
			list.push(item);
		} else {
			list.splice(index, 1);
		}
		if (list.length > 10) {
			return dispatchToastMessage({ type: 'error', message: t('Max_number_of_users_allowed_is_number', { max: 10 }) });
		}
		setSelectedList(list);
		props.setBtnDisabled(list.length === 0);
	};

	const onChangeTab = (type) => {
		setOrgDisplay(type === 'org');
	};

	const onOrgChecked = (checked, users) => {
		const list = [...selectedList];
		users.forEach((user) => {
			const item = {
				t: 'd',
				_id: user._id,
				isUser: true,
				userId: user._id,
				fname: user.name,
				name: user.username,
				username: user.username,
			};
			const index = list.findIndex((a) => a.userId === item.userId);
			if (checked && index === -1) {
				list.push(item);
			} else if (!checked && index > -1) {
				list.splice(index, 1);
			}
		});
		if (list.length > 10) {
			dispatchToastMessage({ type: 'error', message: t('Max_number_of_users_allowed_is_number', { max: 10 }) });
			return 'error';
		}
		setSelectedList(list);
		props.setBtnDisabled(list.length === 0);
	};

	const onDelete = (item) => {
		const index = selectedList.findIndex((a) => (a.userId ? a.userId === item.userId : a.rid === item.rid));
		if (index > -1) {
			selectedList.splice(index, 1);
		}
		setSelectedList([...selectedList]);
		props.setBtnDisabled(selectedList.length === 0);
	};

	const renderLeftRow = (room) => {
		const title = roomCoordinator.getRoomName(room.t, room);
		const uid = room.t === 'd' && room.u?._id && room.uids.find((id) => id !== room.u._id);
		return (
			<Sidebar.Item clickable={true} onClick={() => handleCheckBox(room)}>
				<CheckBox
					style={styles.checkbox}
					onClick={(e) => e.stopPropagation()}
					onChange={() => handleCheckBox(room)}
					checked={selectedList.some((a) => a.rid === room.rid || (uid && uid === a._id))}
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

	const renderRightRow = (room) => {
		const title = roomCoordinator.getRoomName(room.t, room);

		return (
			<Sidebar.Item>
				<Sidebar.Item.Avatar>
					<RoomAvatar size='x32' room={{ ...room, _id: room.rid || room._id, type: room.t }} />
				</Sidebar.Item.Avatar>
				<Sidebar.Item.Content>
					<Sidebar.Item.Title data-qa='sidebar-item-title'>{title}</Sidebar.Item.Title>
					{/* <Icon name='cross' size={18} color='#000000'></Icon> */}
					<ActionButton ghost mini icon='cross' onClick={() => onDelete(room)} />
				</Sidebar.Item.Content>
			</Sidebar.Item>
		);
	};

	const handleCloseSearch = useMutableCallback(() => {
		setSearchOpen(false);
	});

	const openSearch = useMutableCallback(() => {
		setSearchOpen(true);
	});

	const refDom = useRef < HTMLElement > null;
	useOutsideClick([refDom], handleCloseSearch);

	return (
		<div style={styles.container}>
			<div style={styles.leftBox}>
				<Sidebar.TopBar.Section role='search' is='form' class='bm-forward-search'>
					<div style={{ width: 0, height: 0, overflow: 'hidden' }}>
						<input />
					</div>
					<TextInput
						// style={styles.input}
						autoFocus={false}
						onFocus={openSearch}
						placeholder={t('Search')}
						addon={<Icon name='magnifier' size='x20' onClick={openSearch} />}
					/>
				</Sidebar.TopBar.Section>
				{/* </div> */}
				{searchOpen && <SearchList onClose={handleCloseSearch} handleCheckBox={handleCheckBox} selectedList={selectedList} />}
				{/* <SidebarSection aria-level='1'>
					<SidebarSection.Title>{t('最新聊天')}</SidebarSection.Title>
				</SidebarSection> */}
				<div style={styles.buttons}>
					<button onClick={() => onChangeTab('chat')} style={orgDisplay ? styles.tabItem : { ...styles.tabItem, ...styles.tabSelected }}>
						{t('Recent_Chats')}
					</button>
					<button onClick={() => onChangeTab('org')} style={orgDisplay ? { ...styles.tabItem, ...styles.tabSelected } : styles.tabItem}>
						{t('Appia_Contact_Info')}
					</button>
				</div>
				{!orgDisplay && (
					<Virtuoso
						style={{ height: '356px', margin: '8px 8px 0 0' }}
						totalCount={roomsList.length}
						data={roomsList}
						itemContent={(index, item) => renderLeftRow(item)}
					/>
				)}
				{orgDisplay && (
					<Organization
						style={{ marginTop: '16px' }}
						hasCheckbox={true}
						defaultSelected={selectedList
							.filter((a) => a.userId)
							.map((a) => ({
								_id: a.userId,
								name: a.fname || a.name,
								username: a.username,
							}))}
						onChecked={onOrgChecked}
					/>
				)}
			</div>
			<div style={styles.rightBox}>
				<div style={styles.selectedInfo}>{t('selected_chats_count', { count: selectedList.length })}</div>
				<Virtuoso
					style={{ height: '420px' }}
					totalCount={selectedList.length}
					data={selectedList}
					itemContent={(index, item) => renderRightRow(item)}
				/>
			</div>
		</div>
	);
});

export default RoomList;
