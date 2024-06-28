import type { IUserSummary } from '@rocket.chat/core-typings';
import { CheckBox } from '@rocket.chat/fuselage';
import React, { useCallback, useState } from 'react';

import type { IContactItemPros } from './IOrganization';
import { useOrganizationContext } from './OrganizationContext';
import { useContactContext } from '../../views/contact/ContactContext';
import ContactIcon from '../../views/contact/ContactIcon';
import { useCurrentContext } from '../../views/contact/CurrentContext';
import UserAvatar from '../avatar/UserAvatar';

const ContactItem: React.FC<IContactItemPros> = (props: IContactItemPros) => {
	const { department, hasCheckbox, onChecked, disabledUsers = [] } = props;
	const { getUsersByDepartmentId, getDepartmentsByParentId, getAllUsersByDepartmentId } = useContactContext();
	const { current, setCurrent } = useCurrentContext();
	const { selectedUsers, setSelectedUsers } = useOrganizationContext();
	const { _id: id } = department;
	const deep = props.deep || 1;

	const users = getAllUsersByDepartmentId(department._id);
	const includeAll = users.length && users.every((user) => selectedUsers.some((a) => a._id === user._id));
	const includeSome = users.some((user) => selectedUsers.some((a) => a._id === user._id));
	const [toggle, setToggle] = useState<boolean>(false);
	// const [checked, setChecked] = useState<boolean>(includeSome);

	const handleCheckUser = (user: IUserSummary) => (): void => {
		const list = [...selectedUsers];
		const index = list.findIndex((a) => a._id === user._id);
		if (index === -1) {
			list.push(user);
		} else {
			list.splice(index, 1);
		}
		const error = onChecked?.(index === -1, [user]);
		if (!error) {
			setSelectedUsers(list);
		}
	};

	const handleCheckDepartment = () => (): void => {
		const list = [...selectedUsers];
		users.forEach((user) => {
			const index = selectedUsers.findIndex((a) => a._id === user._id);
			if (includeAll && index > -1) {
				list.splice(index, 1);
			} else if (!includeAll && index === -1) {
				list.push(user);
			}
		});
		const error = onChecked?.(!includeAll, users);
		if (!error) {
			setSelectedUsers(list);
		}
	};

	const handleToggle = useCallback(() => {
		setToggle((prevState) => !prevState);
		setCurrent({
			value: id,
			type: 'department',
		});
	}, [setCurrent, id]);

	return (
		<div className='org-content-item'>
			{hasCheckbox && (
				<CheckBox
					checked={includeAll}
					indeterminate={!includeAll && includeSome}
					onChange={handleCheckDepartment()}
					style={{ position: 'absolute', top: '7px', left: 0 }}
				/>
			)}
			<div
				className={`org-content-item-title${toggle ? ' org-content-item-title-toggle' : ''}${
					current.type === 'department' && current.value === id ? ' org-content-item-title-active' : ''
				}`}
				onClick={handleToggle}
				style={{
					paddingLeft: 36 + (deep - 2) * 12,
				}}
			>
				<div className='org-content-item-title-icon' />
				<ContactIcon type={department.type} />
				<div style={{ marginLeft: '8px' }} title={department.name} className='org-content-item-title-text'>
					{department.name}
				</div>
			</div>

			{toggle && (
				<>
					{getUsersByDepartmentId(id).map((user) => (
						<div
							key={user._id}
							className={`org-content-item-content-user${
								current.type === 'user' && current.value === user._id ? ' org-content-item-content-user-active' : ''
							}`}
							style={{
								paddingLeft: 36 + deep * 12,
							}}
							onClick={handleCheckUser(user)}
						>
							{hasCheckbox && (
								<CheckBox
									disabled={disabledUsers.some((userId) => user._id === userId)}
									checked={selectedUsers.some((a) => a._id === user._id)}
									onClick={(e) => e.stopPropagation()}
									onChange={handleCheckUser(user)}
									style={{ position: 'absolute', top: '7px', left: 0 }}
								/>
							)}
							<div className='org-content-item-content-user-avatar'>
								<UserAvatar size='x28' username={user.username} etag={user.avatarETag} />
								{/* <div className={`org-content-item-content-user-status org-content-item-content-user-status-${user.status}`} /> */}
							</div>
							<div className='org-content-item-content-user-name'>{user.name}</div>
						</div>
					))}
					{getDepartmentsByParentId(id).map((department) => (
						<ContactItem deep={deep + 1} {...props} key={department._id} department={department} hasCheckbox={hasCheckbox} />
					))}
				</>
			)}
		</div>
	);
};

export default ContactItem;
