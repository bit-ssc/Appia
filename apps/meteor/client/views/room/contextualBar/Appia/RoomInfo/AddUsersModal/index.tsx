import { RightOutlined, LinkOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import type { IRoom } from '@rocket.chat/core-typings';
import { Box, Modal } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useMethod, useSetModal, useTest, useEndpoint } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { useMemo, useCallback } from 'react';

import { styles } from './appia-style';
import AddInnerUsersModal from '../../../../../../components/Contacts';
import { useRecordList } from '../../../../../../hooks/lists/useRecordList';
import { useMembersList } from '../../../../../hooks/useMembersList';
import AddOutterUsersModal from '../AddOutterUsersModal';
import ModalHeader from '../Modal/Header';
import ShowOutterUsersModal from '../ShowOutterUsersModal';

interface IProps {
	onClose: () => void;
	room: IRoom;
	reload: () => Promise<void>;
}

const AddOutterIcon = () => (
	<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 20 20' fill='none'>
		<path
			fillRule='evenodd'
			clipRule='evenodd'
			d='M2.97757 4.33123V17.3991H10.0913V2.82581L2.97757 4.33123ZM1.91449 2.87822C1.57723 2.94959 1.33594 3.24728 1.33594 3.59202V18.3111C1.33594 18.7141 1.6626 19.0407 2.06555 19.0407H11.0033C11.0103 19.0407 11.0174 19.0406 11.0243 19.0404H17.9123C18.3153 19.0404 18.6419 18.7138 18.6419 18.3108V5.7478C18.6419 5.34485 18.3153 5.01819 17.9123 5.01819H11.7329V1.70059C11.7329 1.23685 11.3059 0.890772 10.8522 0.986785L1.91449 2.87822ZM4.18555 9.03088V7.38926L8.88243 7.38925V9.03088H4.18555ZM4.18555 12.7018V11.0602H8.88243V12.7018H4.18555ZM12.8281 11.0602V12.7018H15.929V11.0602H12.8281ZM11.7334 17.3988V6.65982H17.0003V17.3988H11.7334Z'
			fill='black'
		/>
	</svg>
);

const ActionItem = ({ icon, onClick, name }) => (
	<div className='action-item' onClick={onClick}>
		<div className='icon'>{icon}</div>
		<div className='name'>{name}</div>
		<RightOutlined style={{ color: 'rgba(0, 0, 0 , 0.3)' }} />
	</div>
);

const getId = (
	(id) => () =>
		`${++id}`
)(Date.now());

const useLocalMethod = (newMethod, method) => {
	const action = useEndpoint('POST', `/v1/${newMethod}`);

	return useCallback((...params) =>
		action(
			{
				message: JSON.stringify({
					msg: 'method',
					id: getId(),
					method,
					params,
				}),
			},
			[],
		),
	);
};

export const useAddInnerUser = (room, reload) => {
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());
	const { rid, t } = room;
	const { membersList } = useMembersList(
		useMemo(() => ({ rid, type: 'all', limit: 3000, debouncedText: '', count: 30, roomType: t }), [rid, t]),
	);
	const { items } = useRecordList(membersList);
	const save = useMethod('addUsersToRoom');
	const saveFederated = useLocalMethod('local.addUsersToRoom', 'addUsersToRoom');
	const saveAction = room.federated ? saveFederated : save;

	return useCallback(() => {
		const users = items.map((item) => item.username);
		setModal(
			<AddInnerUsersModal
				disabled={users}
				title='添加内部成员'
				onClose={closeModal}
				onOk={async (users) => {
					try {
						await saveAction({
							rid,
							users: users.map((user) => user.username),
						});
					} catch (e) {
						console.log(e);
					}
					reload();
					closeModal();
				}}
			/>,
		);
	}, [items, rid, reload, closeModal]);
};

const AddUsersModal: FC<IProps> = ({ onClose, room, reload }) => {
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());
	const openAddInnerUsersModal = useAddInnerUser(room, reload);
	const isTest = useTest();

	const openAddOutterUsersModal = useMutableCallback(() => {
		setModal(<AddOutterUsersModal room={room} onClose={closeModal} reload={reload} />);
	});

	const openShowOutterUsersModal = useMutableCallback(() => {
		setModal(<ShowOutterUsersModal room={room} onClose={closeModal} reload={reload} />);
	});

	return (
		<Modal style={{ width: 480 }}>
			<Box className={styles}>
				<ModalHeader title='添加成员' onClose={onClose} />
				<div className='actions-wrapper'>
					<ActionItem name='添加内部成员' icon={<UsergroupAddOutlined />} onClick={openAddInnerUsersModal} />
					{isTest ? <ActionItem name='添加外部成员' icon={<AddOutterIcon />} onClick={openAddOutterUsersModal} /> : null}
					<ActionItem name='分享二维码' icon={<LinkOutlined />} onClick={openShowOutterUsersModal} />
				</div>
			</Box>
		</Modal>
	);
};

export default AddUsersModal;
