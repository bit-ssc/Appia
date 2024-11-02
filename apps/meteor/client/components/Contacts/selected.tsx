import { CloseCircleFilled } from '@ant-design/icons';
import type { IStaff } from '@rocket.chat/core-typings';
import React, { useCallback, useMemo } from 'react';

import { useStateContext, useContactContext } from './context';
import InfiniteScroll from '../infiniteScroll';

const Selected: React.FC = () => {
	const { selected, removeSelected } = useStateContext();
	const { getUsersByIds } = useContactContext();
	const users = useMemo(() => getUsersByIds(Array.from(selected)), [selected, getUsersByIds]);
	const itemRender = useCallback(
		(user: IStaff) => (
			<div className='item' style={{ cursor: 'default' }}>
				<div className='avatar'>{user ? <img src={`/avatar/${user.username}`} /> : null}</div>

				<div className='name'>{user?.name || user?.ename}</div>

				<div className='remove' onClick={() => removeSelected(user.username)}>
					<CloseCircleFilled />
				</div>
			</div>
		),
		[removeSelected],
	);

	return (
		<div className='side'>
			<div className='selectedTitle'>已选择：{selected.size}个填写人</div>

			<InfiniteScroll itemKey='username' className='panel' data={users} itemRender={itemRender} itemHeight={48} />
		</div>
	);
};

export default Selected;
