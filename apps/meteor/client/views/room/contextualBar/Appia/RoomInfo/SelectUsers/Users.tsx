import type { IUserSummary } from '@rocket.chat/core-typings';
import { Sidebar, Box, CheckBox } from '@rocket.chat/fuselage';
import type { FormEvent, ReactElement } from 'react';
import React, { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import UserAvatar from '../../../../../../components/avatar/UserAvatar';

interface IProps {
	selectedList: IUserSummary[];
	disabledUsers?: string[];
	handleCheckBox: (user: IUserSummary) => void;
}

const Users = ({ selectedList, handleCheckBox }: IProps): ReactElement => {
	const [items] = useState<IUserSummary[]>([]);

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
				</Sidebar.Item.Title>
			</Sidebar.Item.Content>
		</Sidebar.Item>
	);

	return (
		<Sidebar.TopBar.Section>
			<Box rcx-sidebar h='330px' display='flex' flexDirection='column' zIndex={99} w='full' backgroundColor='#FFFFFF'>
				<Virtuoso style={{ height: '320px' }} totalCount={items?.length} data={items} itemContent={renderItem} />
			</Box>
		</Sidebar.TopBar.Section>
	);
};

export default Users;
