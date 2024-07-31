import { Modal, ButtonGroup, Button } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import React, { useRef, useState } from 'react';

// import { APIClient } from '../../../app/utils/client';
import RoomList from './RoomList';
import { selectedMessageStore } from '../../views/room/providers/SelectedMessagesProvider';
import './styles.css';

const ForwardMessage = ({ onClose, msgIds, isMerged = false }) => {
	const t = useTranslation();
	const [btnDisabled, setBtnDisabled] = useState(true);
	const roomListRef = useRef();
	// 	const forward = async () => {
	// 		try {
	// 			const { result } = await APIClient.v1.post('sendMessage', {});
	// 		} catch (error) {
	// 			return false;
	// 		}
	// 	};
	const forward = () => {
		const list = roomListRef.current.selectedList;
		if (list.length === 0) {
			return onClose();
		}

		Meteor.call('sendMessage', {
			forwardUsers: list.filter((a) => !a.rid).map((a) => a._id),
			forwardRooms: list.filter((a) => !!a.rid).map((a) => a.rid),
			forwardMessageIds: msgIds,
			isForwardMessage: true,
			isForwardMerged: isMerged,
		});
		$('.bm-forward-container').hide();
		$('.bm-msg-checkbox').hide();
		$('.bm-msg-item-box').removeClass('bm-msg-item-box-checkbox');
		onClose();
		selectedMessageStore.setIsSelecting(false);
		selectedMessageStore.clearStore();
		$('.rc-message-box.footer').show();
	};

	return (
		<Modal style={{ maxWidth: '720px' }}>
			<Modal.Header style={{ margin: '16px 20px' }}>
				<Modal.Title style={{ fontSize: '16px' }}>{t('Forward_to')}</Modal.Title>
				{/* <Modal.Close onClick={onClose} /> */}
			</Modal.Header>
			<Modal.Content style={{ margin: '0 20px' }}>
				<RoomList ref={roomListRef} setBtnDisabled={setBtnDisabled} />
			</Modal.Content>
			<Modal.Footer style={{ margin: '20px' }}>
				<ButtonGroup align='center'>
					<Button style={{ padding: '8px 40px', marginRight: '16px' }} onClick={onClose}>
						{t('Cancel')}
					</Button>
					<Button style={{ padding: '8px 40px', marginLeft: '16px' }} primary onClick={forward} disabled={btnDisabled}>
						{t('Submit')}
					</Button>
				</ButtonGroup>
			</Modal.Footer>
		</Modal>
	);
};

export default ForwardMessage;
