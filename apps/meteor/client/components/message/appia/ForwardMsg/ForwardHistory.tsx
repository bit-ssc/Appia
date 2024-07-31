import { Modal } from '@rocket.chat/fuselage';
import React from 'react';

// import { t } from '../../../../utils/client';
import BlazeTemplate from '../../../../views/room/components/BlazeTemplate';
import type { IForwardMsgHistoryProps } from '../IAppia';

const ForwardHistory = ({ title, messages, room, settings, user, subscription, onClose }: IForwardMsgHistoryProps) => {
	return (
		<Modal style={{ maxWidth: '720px', maxHeight: '80%', marginTop: '5%' }}>
			<Modal.Header>
				<Modal.Title style={{ fontSize: '16px' }}>{title}</Modal.Title>
				<Modal.Close onClick={onClose} />
			</Modal.Header>
			<Modal.Content style={{ margin: '0 12px 20px 0' }}>
				{/* {messages.map((msg: any, index: number) => (
					<BlazeTemplate
						name='message'
						showRoles={true}
						index={index}
						msg={msg}
						room={room}
						settings={settings}
						hideActions={true}
						subscription={subscription}
					/>
				))} */}
				<BlazeTemplate
					name='forwardMessageList'
					messages={messages}
					room={room}
					settings={settings}
					user={user}
					subscription={subscription}
				/>
			</Modal.Content>
			{/* <Modal.Footer>
				<ButtonGroup align='end'>
					<Button onClick={onClose}>{t('Close')}</Button>
				</ButtonGroup>
			</Modal.Footer> */}
		</Modal>
	);
};

export default ForwardHistory;
