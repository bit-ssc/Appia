import type { IRoom, IUserSummary } from '@rocket.chat/core-typings';
import { Box, Modal } from '@rocket.chat/fuselage';
import type { FC } from 'react';
import React, { useState, useCallback, useRef, useMemo } from 'react';

import { styles } from './appia-style';
import { Button } from '../../../../../../components/AppiaUI';
import { useRecordList } from '../../../../../../hooks/lists/useRecordList';
import { useMembersList } from '../../../../../hooks/useMembersList';
import ModalFooter from '../Modal/Footer';
import ModalHeader from '../Modal/Header';
import SelectUsers from '../SelectUsers';

interface IProps {
	onClose: () => void;
	room: IRoom;
}

const AddInnerUsersModal: FC<IProps> = ({ onClose, room }) => {
	const roomListRef = useRef<HTMLElement>();
	const { membersList } = useMembersList(
		useMemo(() => ({ rid: room.rid, type: 'all', limit: 3000, debouncedText: '', count: 30, roomType: room.t }), [room.t]),
	);
	const { items } = useRecordList(membersList);

	const [loading, setLoading] = useState(false);

	const onSubmit = useCallback(async () => {
		setLoading(true);
		setLoading(false);
	}, []);

	const seSelectedUsers = (members: IUserSummary[]): void => {
		console.log(members);
	};

	return (
		<Modal style={{ width: 680 }}>
			<Box className={styles}>
				<ModalHeader title='添加内部成员' onClose={onClose} />
				<div className='container'>
					<SelectUsers ref={roomListRef} seSelectedUsers={seSelectedUsers} disabledUsers={items?.map((user) => user.username)} />
				</div>
				<ModalFooter>
					<Button onClick={onClose}>取消</Button>
					<Button type='primary' loading={loading} onClick={onSubmit}>
						完成
					</Button>
				</ModalFooter>
			</Box>
		</Modal>
	);
};

export default AddInnerUsersModal;
