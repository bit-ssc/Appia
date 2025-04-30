import type { IDepartment, IStaff } from '@rocket.chat/core-typings';
import React, { useCallback, useEffect, useState } from 'react';

import { HeadBoardIcon } from '../../components/AppiaIcon';
import UserAvatar from '../../components/avatar/UserAvatar';
import { useContactContext } from './ContactContext';
import Icon from './ContactIcon';
import { useCurrentContext } from './CurrentContext';

const ContactItem: React.FC<{ department: IDepartment; deep?: number; federationUsers?: IStaff[] }> = ({
	department,
	deep = 1,
	federationUsers = [],
}) => {
	const { current } = useCurrentContext();
	const { setCurrent } = useCurrentContext();
	const [toggle, setToggle] = useState<boolean>(deep === 1 && federationUsers.length === 0);
	const { getUsersForHeaderBoard, getDepartmentsByParentId, currentParentDepartmentIds } = useContactContext();
	const { _id: id, type } = department;

	const handleClick = useCallback(
		(type: 'user' | 'department' | 'federatedUser', value: any) => (): void => {
			setCurrent({
				value,
				from: id,
				type,
			});
		},
		[setCurrent, id],
	);

	useEffect(() => {
		const canToggle = currentParentDepartmentIds.includes(id);

		if (canToggle) {
			setToggle(true);
		}

		// // 当用户被选中且该用户在当前组件中时，触发滚动
		/* 		if (current.type === 'user') {
			// 使用 setTimeout 确保 DOM 已经完全渲染
			setTimeout(() => {
				itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}, 500);
		} */
	}, [currentParentDepartmentIds, id]);

	const handleToggle = useCallback(() => {
		setToggle((prevState) => !prevState);
		if (type === 'EMT') {
			setCurrent({
				value: id,
				type: 'emt',
			});
			return;
		}
		if (type === 'federatedDepartment') {
			setCurrent({
				value: department?._id?.toLowerCase(),
				type: 'federatedDepartment',
			});
			return;
		}
		setCurrent({
			value: id,
			type: 'department',
		});
	}, [setCurrent, id]);

	const departments = getDepartmentsByParentId(id);
	const isHeadBoard = id.startsWith('head_board');
	const showUsers = isHeadBoard || departments.length === 0;
	let users: any[];
	if (federationUsers.length > 0) {
		users = federationUsers;
	} else if (showUsers) {
		users = getUsersForHeaderBoard(id);
	} else {
		users = [];
	}

	/* 	const headBoard = {
		_id: `head_board,${root?._id}`,
		name: 'Heads',
		children: [],
		managers: [],
		users: [],
		usersCount: 0,
		usersCountIncludeChildren: 1,
		countIncludeChildren: { all: 1 },
		parent: null,
		display: true,
	}; */

	/* 	const renderHeadBoard = useCallback(() => {
		// if (type === 'EMT') {
		// 	// return null;
		// 	return <ContactItem deep={deep + 1} key={'EMT-Heads'} department={headBoard} />;
		// }

		if (!isHeadBoard && departments.length > 0 && department.type !== 'L1DVirtual') {
			const headBoard = {
				...department,
				_id: `head_board,${id}`,
				name: 'Heads',
				children: [],
			};
			return <ContactItem key={headBoard._id} deep={deep + 1} department={headBoard} />;
		}

		return null;
		// id, department
	}, [type, isHeadBoard, departments.length, headBoard, department, id, deep]); */

	return (
		<div className='contact-content-item'>
			<div
				className={`contact-content-item-title${toggle ? ' contact-content-item-title-toggle' : ''}${
					current?.type === 'department' && current?.value === id ? ' contact-content-item-title-active' : ''
				}`}
				onClick={handleToggle}
				style={{
					paddingLeft: (deep - 1) * 20 + 12,
				}}
			>
				<div className='contact-content-item-title-icon' />
				{isHeadBoard ? <HeadBoardIcon fontSize={28} /> : <Icon type={department.type} pId={department.parent} />}
				<div className='contact-content-item-title-text'>{department.name}</div>
			</div>

			{toggle && (
				<>
					{/* {renderHeadBoard()} */}

					{users.map((user) => (
						<div
							key={user._id}
							className={`contact-content-item-content-user${
								current?.type === 'user' && current?.value === user._id ? ' contact-content-item-content-user-active' : ''
							}`}
							onClick={
								federationUsers.length === 0
									? handleClick('user', user._id)
									: handleClick('federatedUser', { username: user.username, name: user.name })
							}
							style={{
								paddingLeft: (deep - 1) * 20 + 24,
							}}
						>
							<div
								className='contact-content-item-content-user-avatar'
								style={{ display: 'flex', flexDirection: 'row', alignItems: 'end' }}
							>
								<UserAvatar size='x28' username={user.username} etag={user.avatarETag} />
								{/* {federationUsers.length === 0 && <ReactiveUserStatus uid={user._id} />} */}
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
