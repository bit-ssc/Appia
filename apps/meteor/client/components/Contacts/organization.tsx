import { CaretDownOutlined, CaretRightOutlined, SearchOutlined } from '@ant-design/icons';
import type { IDepartment, IStaff } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { tabsStyle } from './appia-style';
import { useStateContext, useContactContext } from './context';
import { classNames } from './helper';
import { useRoomList } from '../../sidebar/hooks/useRoomList';
import ContactIcon from '../../views/contact/ContactIcon';
import { Checkbox, Empty, Input } from '../AppiaUI';
import InfiniteScroll from '../infiniteScroll';

const UserComponent: React.FC<{ user: IStaff; left: number }> = ({ user, left }) => {
	const { selected, addSelected, removeSelected, setSelected, disabled, multiple } = useStateContext();
	const { username, name } = user;
	const onClick = () => {
		if (disabled.has(username)) {
			return false;
		}
		if (selected.has(username)) {
			removeSelected(username);
		} else if (multiple) {
			addSelected(username);
		} else {
			setSelected(username);
		}
	};

	return (
		<div className={classNames('item', selected.has(username) && 'active')} onClick={onClick}>
			{multiple ? (
				<div className='checkbox'>
					<Checkbox disabled={disabled.has(username)} checked={selected.has(username)} />
				</div>
			) : null}
			<div className='avatar' style={{ marginLeft: left }}>
				<img src={`/avatar/${username}`} alt={name} />
			</div>
			<div className='arrow'>{name}</div>
		</div>
	);
};

const DepartmentComponent: React.FC<{ department: IDepartment; left: number }> = ({ department, left }) => {
	const [toggle, setToggle] = useState<boolean>(false);
	const { multiple, selected, addSelected, removeSelected } = useStateContext();
	const { getAllUsersByDepartmentId, getUsersByDepartmentId, getDepartmentsByParentId } = useContactContext();
	const onToggle = useCallback(() => {
		setToggle((prevState) => !prevState);
	}, []);
	const users = getAllUsersByDepartmentId(department._id).map((user) => user.username);

	const checked = users.length && users.every((user) => selected.has(user));
	const indeterminate = users.some((user) => selected.has(user));
	const onClick = (e) => {
		e.stopPropagation();

		if (checked) {
			removeSelected(...users);
		} else {
			addSelected(...users);
		}
	};

	return (
		<>
			<div className='groupItem' onClick={onToggle}>
				{multiple ? (
					<div className='checkbox' onClick={onClick}>
						<Checkbox checked={checked} indeterminate={!checked && indeterminate} />
					</div>
				) : null}
				<div className='arrow' style={{ marginLeft: 6 + left }}>
					{toggle ? <CaretDownOutlined /> : <CaretRightOutlined />}
				</div>
				<div className='icon'>
					<ContactIcon type={department.type} />
				</div>
				<div className='name'>{department?.name}</div>
			</div>
			{toggle ? (
				<>
					{getUsersByDepartmentId(department._id).map((user) => (
						<UserComponent key={user.id} user={user} left={left + 30} />
					))}
					{getDepartmentsByParentId(department._id).map((value) => (
						<DepartmentComponent department={value} key={value._id} left={30 + left} />
					))}
				</>
			) : null}
		</>
	);
};

const HistoryComponent = () => {
	const roomList = useRoomList();
	const [rooms, setRooms] = useState([]);
	const { addUserMap } = useContactContext();

	useEffect(() => {
		const list = [];
		const data = {};

		roomList
			.filter((room) => !room.federated && room.t === 'd' && !/\.bot$/i.test(room.name))
			.forEach((room) => {
				const item = {
					username: room.name,
					name: room.fname,
				};

				data[item.username] = item;
				list.push(item);
			});

		setRooms(list);
		addUserMap(data);
	}, [roomList, addUserMap]);

	const itemRender = useCallback((item) => <UserComponent user={item} left={12} />, []);

	return <InfiniteScroll style={{ marginTop: 8 }} data={rooms} itemRender={itemRender} itemHeight={48} itemKey='_id' />;
};

const Organization: React.FC = () => {
	const { root, search, getDepartmentsByParentId } = useContactContext();
	const [activeTab, setActiveTab] = useState(1);
	const [keyword, setKeyword] = useState(null);
	const [users, setUsers] = useState<IStaff[]>([]);

	const debounced = useMemo(
		() =>
			debounce((keyword) => {
				setUsers(search(keyword));
			}, 200),
		[search],
	);

	const itemRender = useCallback((user) => <UserComponent user={user} left={12} />, []);

	useEffect(() => {
		debounced(keyword);
	}, [keyword, debounced]);

	const onChange = useCallback((e) => {
		setKeyword(e.currentTarget.value);
	}, []);

	return (
		<div className='side'>
			<div className='search'>
				<Input prefix={<SearchOutlined />} value={keyword} onChange={onChange} allowClear />
			</div>

			<div className={classNames('content', keyword && 'hidden')}>
				<Box className={tabsStyle}>
					<div className={activeTab === 1 ? 'active tab' : 'tab'} onClick={() => setActiveTab(1)}>
						最近聊天
					</div>
					<div className={activeTab === 2 ? 'active tab' : 'tab'} onClick={() => setActiveTab(2)}>
						组织架构
					</div>
				</Box>

				<div className={classNames('panel', activeTab !== 1 && 'hidden')} style={{ marginTop: 8 }}>
					<HistoryComponent />
				</div>

				<div className={classNames('panel', activeTab !== 2 && 'hidden')} style={{ marginTop: 8 }}>
					{root
						? getDepartmentsByParentId(root._id).map((department) => (
								<DepartmentComponent key={department._id} department={department} left={0} />
						  ))
						: null}
				</div>
			</div>

			{keyword ? (
				<>
					{users.length ? (
						<InfiniteScroll
							style={{ marginTop: 8 }}
							className={classNames('panel', !keyword && 'hidden')}
							data={users}
							itemRender={itemRender}
							itemHeight={48}
							itemKey='_id'
						/>
					) : (
						<div style={{ marginTop: 8 }} className={classNames('panel', !keyword && 'hidden')}>
							<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
						</div>
					)}
				</>
			) : null}
		</div>
	);
};

export default Organization;
