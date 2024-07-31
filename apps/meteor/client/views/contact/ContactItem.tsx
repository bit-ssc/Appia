import type { IDepartment } from '@rocket.chat/core-typings';
import React, { useCallback, useState } from 'react';

import { useContactContext } from './ContactContext';
import Icon from './ContactIcon';
import { useCurrentContext } from './CurrentContext';
import { HeadBoardIcon } from '../../components/AppiaIcon';
import UserAvatar from '../../components/avatar/UserAvatar';

const ContactItem: React.FC<{ department: IDepartment; deep?: number }> = ({ department, deep = 1 }) => {
	const [toggle, setToggle] = useState<boolean>(false);
	const { getUsersForHeaderBoard, getDepartmentsByParentId } = useContactContext();
	const { current } = useCurrentContext();
	const { setCurrent } = useCurrentContext();
	const { _id: id } = department;

	const handleClick = useCallback(
		(type: 'user' | 'department', value: string) => (): void => {
			setCurrent({
				value,
				from: id,
				type,
			});
		},
		[setCurrent, id],
	);

	const handleToggle = useCallback(() => {
		setToggle((prevState) => !prevState);
		setCurrent({
			value: id,
			type: 'department',
		});
	}, [setCurrent, id]);

	const departments = getDepartmentsByParentId(id);
	const isHeadBoard = id.startsWith('head_board');
	const showUsers = isHeadBoard || departments.length === 0;
	const users = showUsers ? getUsersForHeaderBoard(id) : [];
	const renderHeadBoard = useCallback(() => {
		const headBoard = {
			...department,
			_id: `head_board,${id}`,
			name: 'Heads',
			children: [],
		};
		return <ContactItem key={headBoard._id} deep={deep + 1} department={headBoard} />;
	}, [id, department]);

	return (
		<div className='contact-content-item'>
			<div
				className={`contact-content-item-title${toggle ? ' contact-content-item-title-toggle' : ''}${
					current.type === 'department' && current.value === id ? ' contact-content-item-title-active' : ''
				}`}
				onClick={handleToggle}
				style={{
					paddingLeft: deep * 16 + 4,
				}}
			>
				<div className='contact-content-item-title-icon' />
				{isHeadBoard ? <HeadBoardIcon fontSize={28} /> : <Icon type={department.type} />}
				<div className='contact-content-item-title-text'>{department.name}</div>

				{/*
				<div className='contact-content-item-user-icon'>
					<UserIcon />
					<div className='contact-content-item-count'>{department.countIncludeChildren.all}</div>
				</div>
				*/}
			</div>

			{toggle && (
				<>
					{!isHeadBoard && departments.length > 0 && renderHeadBoard()}
					{users.map((user) => (
						<div
							key={user._id}
							className={`contact-content-item-content-user${
								current.type === 'user' && current.value === user._id && current.from === id
									? ' contact-content-item-content-user-active'
									: ''
							}`}
							onClick={handleClick('user', user._id)}
							style={{
								paddingLeft: (deep + 1) * 16,
							}}
						>
							<div className='contact-content-item-content-user-avatar'>
								<UserAvatar size='x28' username={user.username} etag={user.avatarETag} />
								<div className={`contact-content-item-content-user-status contact-content-item-content-user-status-${user.status}`} />
							</div>
							<div className='contact-content-item-content-user-name'>{user.name}</div>
						</div>
					))}
					{departments.map((department) => (
						<ContactItem key={department._id} deep={deep + 1} department={department} />
					))}
				</>
			)}
		</div>
	);
};

export default ContactItem;
