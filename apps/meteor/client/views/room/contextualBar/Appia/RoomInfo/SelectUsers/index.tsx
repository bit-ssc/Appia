import type { IUserSummary } from '@rocket.chat/core-typings';
import { Sidebar, ActionButton, Box } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useState, useImperativeHandle, useMemo, forwardRef } from 'react';
import { Virtuoso } from 'react-virtuoso';

import SearchUsers from './SearchUsers';
import Users from './Users';
import { selectUsersStyle as styles, tabsStyle } from './styles';
import Organization from '../../../../../../components/Organization';
import UserAvatar from '../../../../../../components/avatar/UserAvatar';
import { ContactContextProvider } from '../../../../../contact/ContactContext';

interface IProps {
	disabledUsers?: string[];
}

// eslint-disable-next-line react/display-name
const SelectUsers = forwardRef((props: IProps, ref) => {
	const t = useTranslation();
	const disabledUsers = useMemo(() => new Set(props.disabledUsers || []), [props.disabledUsers]);
	const [activeTab, setActiveTab] = useState(1);
	const [selectedList, setSelectedList] = useState<IUserSummary[]>([]);

	useImperativeHandle(ref, () => ({
		selectedList,
	}));

	const handleCheckBox = (item: IUserSummary): void => {
		if (disabledUsers.has(item.username)) {
			return;
		}

		const list = [...selectedList];
		const index = list.findIndex((a) => a._id === item._id);
		if (index === -1) {
			list.push(item);
		} else {
			list.splice(index, 1);
		}
		setSelectedList(list);
	};

	const onOrgChecked = (checked: boolean, users: IUserSummary[]): void => {
		const list = [...selectedList];
		users.forEach((item: IUserSummary) => {
			if (disabledUsers.has(item.username)) {
				return;
			}
			const index = list.findIndex((a) => a._id === item._id);
			if (checked && index === -1) {
				list.push(item);
			} else if (!checked && index > -1) {
				list.splice(index, 1);
			}
		});
		setSelectedList(list);
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
	};

	const renderRightRow = (_: number, item: IUserSummary): ReactElement => (
		<Sidebar.Item>
			<Sidebar.Item.Avatar>
				<UserAvatar size='x32' username={item.username} etag={item.avatarETag} />
			</Sidebar.Item.Avatar>
			<Sidebar.Item.Content>
				<Sidebar.Item.Title data-qa='sidebar-item-title'>{item.name}</Sidebar.Item.Title>
				{!disabledUsers.has(item.username) && <ActionButton ghost mini icon='cross' onClick={(): void => onDelete(item)} />}
			</Sidebar.Item.Content>
		</Sidebar.Item>
	);

	return (
		<div style={styles.container}>
			<div style={styles.leftBox}>
				<ContactContextProvider>
					<SearchUsers handleCheckBox={handleCheckBox} selectedList={selectedList} disabledUsers={disabledUsers} />
				</ContactContextProvider>
				<Box className={tabsStyle}>
					<div className={activeTab === 1 ? 'active tab' : 'tab'} onClick={() => setActiveTab(1)}>
						最近聊天
					</div>
					<div className={activeTab === 2 ? 'active tab' : 'tab'} onClick={() => setActiveTab(2)}>
						组织架构
					</div>
				</Box>
				{activeTab === 1 ? <Users disabledUsers={props.disabledUsers} onChecked={onOrgChecked} /> : null}
				{activeTab === 2 ? (
					<Organization hasCheckbox={true} defaultSelected={selectedList} disabledUsers={props.disabledUsers} onChecked={onOrgChecked} />
				) : null}
			</div>
			<div style={styles.rightBox}>
				<div style={styles.selectedInfo}>{t('selected_chats_count', { count: selectedList.length })}</div>
				<Virtuoso style={{ height: '320px' }} totalCount={selectedList.length} data={selectedList} itemContent={renderRightRow} />
			</div>
		</div>
	);
});

export default SelectUsers;
