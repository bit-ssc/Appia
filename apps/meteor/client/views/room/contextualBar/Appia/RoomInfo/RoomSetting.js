import { InfoCircleOutlined, RightOutlined } from '@ant-design/icons';
import { Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useTranslation, useSetModal, usePermission, useSetting, useMethod, useToastMessageDispatch } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import React, { useMemo } from 'react';

import SwitchType from './SwitchType';
import { Tooltip } from '../../../../../components/AppiaUI';
import VerticalBar from '../../../../../components/VerticalBar';
import NotificationToggle, { Row } from '../../NotificationPreferences/components/NotificationToogle';

const RoomSetting = ({ room, handleClose, formValues, formHandlers, onClickBack, handleSaveButton, handleToggleFavorite }) => {
	const t = useTranslation();
	const settingText = room.t === 'c' ? '频道设置' : '讨论设置';
	const infoText = room.t === 'c' ? t('Channel_Info') : t('Team_Info');
	const setModal = useSetModal();
	const canEditRoom = usePermission('edit-room', room._id);
	const user = Meteor.user();
	const createExternalDiscussionMembers = useSetting('Appia_Create_External_Discussion_Members');
	const createExternalChannelMembers = useSetting('Appia_Create_External_Channel_Members');
	const saveRoomSettings = useMethod('saveRoomSettings');
	const dispatchToastMessage = useToastMessageDispatch();

	const showEditRoom = useMemo(() => {
		const discussionMembers = (createExternalDiscussionMembers || '').split(',');
		const channelMembers = (createExternalChannelMembers || '').split(',');

		return room.t === 'c' ? channelMembers.includes(user?.username) : discussionMembers.includes(user?.username);
	}, [createExternalDiscussionMembers, createExternalChannelMembers, user, room.t]);

	const closeModal = useMutableCallback(() => setModal());
	const openModal = useMutableCallback(() => {
		setModal(<SwitchType room={room} onClose={closeModal} />);
	});
	let label = room.federated ? '外部' : '内部';
	let title = '频道';
	if (room.t === 'c') {
		if (room.rt === 'p') {
			label += '非公开频道';
		} else {
			label += '公开频道';
		}
	} else {
		title = '讨论';
		label += '讨论';
	}

	return (
		<>
			<VerticalBar.Header>
				<VerticalBar.Icon name='info-circled' />
				<VerticalBar.Text>
					<Box display='flex' alignItems='center'>
						<Box is='span' color='rgba(0, 0, 0)' cursor='pointer' onClick={onClickBack}>
							{infoText}
						</Box>
						<Box is='span' color='rgba(0, 0, 0,0.4)' cursor='pointer' p={10}>
							/
						</Box>
						<Box is='span' color='rgba(0, 0, 0)' cursor='pointer'>
							{settingText}
						</Box>
					</Box>
				</VerticalBar.Text>

				{handleClose && <VerticalBar.Close onClick={handleClose} />}
			</VerticalBar.Header>

			<VerticalBar.Content p={0}>
				<NotificationToggle
					label={t('Set_as_favorite')}
					// description={t('Display_unread_counter')}
					onChange={(e) => {
						handleToggleFavorite(e);
					}}
					defaultChecked={formValues?.favorite}
				/>
				<NotificationToggle
					label={t('Show_counter')}
					onChange={(e) => {
						formHandlers?.handleShowCounter(e);
						formHandlers?.handleTurnOn(e);
						setTimeout(() => {
							handleSaveButton();
						}, 0);
					}}
					defaultChecked={formValues?.showCounter}
				/>

				{canEditRoom && showEditRoom ? (
					<>
						<div style={{ background: '#F3F3F3', height: 8, marginTop: -1 }} />

						{room.t === 'c' ? (
							<NotificationToggle
								label={
									<>
										开启“广播模式”{' '}
										<Tooltip zIndex={10001} title='开启后，仅允许主播及安全责任人发言。'>
											<InfoCircleOutlined style={{ color: '#86909C' }} />
										</Tooltip>
									</>
								}
								onChange={async (e) => {
									try {
										await saveRoomSettings(room._id, { readOnly: e.target.checked });
										dispatchToastMessage({ type: 'success', message: '设置成功' });
									} catch (e) {
										dispatchToastMessage({ type: 'success', message: '设置失败' });
									}
								}}
								defaultChecked={formValues?.readonly}
							/>
						) : null}
						<Row
							label={`转换${title}类型`}
							value={
								<div style={{ color: 'rgba(0, 0, 0, 0.4)' }} onClick={openModal}>
									{label}
									<RightOutlined />
								</div>
							}
						/>
					</>
				) : null}
			</VerticalBar.Content>
		</>
	);
};

export default RoomSetting;
