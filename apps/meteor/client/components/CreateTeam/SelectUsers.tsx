import type { IUserSummary } from '@rocket.chat/core-typings';
import { Sidebar, ActionButton, CheckBox } from '@rocket.chat/fuselage';
import { useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import type { ReactElement } from 'react';
import React, { useState, useImperativeHandle, useMemo, forwardRef } from 'react';
import { Virtuoso } from 'react-virtuoso';

// import { useToastMessageDispatch } from '../../contexts/ToastMessagesContext';
import SearchUsers from './SearchUsers';
import { selectUsersStyle as styles } from './styles';
import { ContactContextProvider } from '../../views/contact/ContactContext';
import Organization from '../Organization';
import UserAvatar from '../avatar/UserAvatar';

interface IProps {
	seSelectedUsers: (users: IUserSummary[]) => void;
	all: boolean;
	setAll: (value: boolean) => void;
	type: 'team' | 'channel';
}
// eslint-disable-next-line react/display-name
const SelectUsers = forwardRef((props: IProps, ref) => {
	const t = useTranslation();
	const createAllChannelMembers = useSetting('Appia_Create_All_Channel_Members') as string;
	const user = Meteor.user();
	const disabledUsers = user ? [user.username] : [];
	const [selectedList, setSelectedList] = useState<IUserSummary[]>(user ? [user as IUserSummary] : []);
	const hasAll = useMemo(() => {
		const members = (createAllChannelMembers || '').split(',').filter((member) => member);

		return members.includes(user?.username as string);
	}, [createAllChannelMembers, user]);
	// const dispatchToastMessage = useToastMessageDispatch();
	useImperativeHandle(ref, () => ({
		selectedList,
	}));

	const handleCheckBox = (item: IUserSummary): void => {
		if (disabledUsers.some((userId) => userId === item._id)) {
			return;
		}
		const list = [...selectedList];
		const index = list.findIndex((a) => a._id === item._id);
		if (index === -1) {
			list.push(item);
		} else {
			list.splice(index, 1);
		}
		// if (list.length > 10) {
		// 	return dispatchToastMessage({ type: 'error', message: t('Max_number_of_users_allowed_is_number', { max: 10 }) });
		// }
		setSelectedList(list);
		props.seSelectedUsers(list);
	};

	const onOrgChecked = (checked: boolean, users: IUserSummary[]): void => {
		const list = [...selectedList];
		users.forEach((item: IUserSummary) => {
			if (disabledUsers.some((userId) => userId === item._id)) {
				return;
			}
			const index = list.findIndex((a) => a._id === item._id);
			if (checked && index === -1) {
				list.push(item);
			} else if (!checked && index > -1) {
				list.splice(index, 1);
			}
		});
		// if (list.length > 10) {
		// 	dispatchToastMessage({ type: 'error', message: t('Max_number_of_users_allowed_is_number', { max: 10 }) });
		// 	return 'error';
		// }
		setSelectedList(list);
		props.seSelectedUsers(list);
	};

	const onDelete = (item: IUserSummary): void => {
		if (disabledUsers.some((userId) => userId === item._id)) {
			return;
		}
		const index = selectedList.findIndex((a) => a._id === item._id);
		if (index > -1) {
			selectedList.splice(index, 1);
		}
		const list = [...selectedList];
		setSelectedList(list);
		props.seSelectedUsers(list);
	};

	const renderRightRow = (_: number, item: IUserSummary): ReactElement => (
		<Sidebar.Item>
			<Sidebar.Item.Avatar>
				<UserAvatar size='x32' username={item.username} etag={item.avatarETag} />
			</Sidebar.Item.Avatar>
			<Sidebar.Item.Content>
				<Sidebar.Item.Title data-qa='sidebar-item-title'>{item.name}</Sidebar.Item.Title>
				{!disabledUsers.some((userId) => userId === item.username) && (
					<ActionButton ghost mini icon='cross' onClick={(): void => onDelete(item)} />
				)}
			</Sidebar.Item.Content>
		</Sidebar.Item>
	);

	return (
		<div style={styles.container}>
			<div style={styles.leftBox}>
				<ContactContextProvider>
					<SearchUsers handleCheckBox={handleCheckBox} disabledUsers={disabledUsers} selectedList={selectedList} />
				</ContactContextProvider>
				<Organization hasCheckbox={true} defaultSelected={selectedList} disabledUsers={disabledUsers} onChecked={onOrgChecked} />
				{props.type === 'channel' && hasAll ? (
					<label style={styles.checkbox}>
						<CheckBox
							checked={props.all}
							onChange={(e) => {
								props.setAll(e.currentTarget.checked);
							}}
							style={{ marginRight: 12 }}
						/>
						添加全员（新成员自动加入该频道）
					</label>
				) : (
					<div style={{ padding: '0 0 10px 0' }} />
				)}
			</div>
			<div style={styles.rightBox}>
				<div style={styles.selectedInfo}>{t('selected_chats_count', { count: selectedList.length })}</div>
				<Virtuoso style={{ height: '320px' }} totalCount={selectedList.length} data={selectedList} itemContent={renderRightRow} />
			</div>
		</div>
	);
});

export default SelectUsers;
