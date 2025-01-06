import { useTranslation } from '@rocket.chat/ui-contexts';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import React, { memo } from 'react';

import { ChatMessage } from '../../../../../app/models/client';
import { APIClient } from '../../../../../app/utils/client';
import ForwardMessage from '../../../../components/ForwardMessage';
import { CombineBigIcon, DiscussionStartBigIcon, ForwordBigIcon, CloseForwordIcon } from '../../../../components/SvgIcons';
import { imperativeModal } from '../../../../lib/imperativeModal';
import { goToRoomById } from '../../../../lib/utils/goToRoomById';

const RoomForwordView = memo(({ selectedMessageCount, selectedMessageStore, prid }) => {
	const t = useTranslation();

	const createNewDiscussion = async () => {
		const messageIds = selectedMessageStore.getSelectedMessages();
		if (!messageIds.length) {
			return;
		}

		selectedMessageStore.setIsSelecting(false);
		selectedMessageStore.clearStore();

		const messageId = messageIds[0];
		const message = ChatMessage.findOne({ _id: messageId });
		const { discussion } = await APIClient.post('/v1/rooms.createDiscussion', {
			prid,
			t_name: message?.msg || TAPi18n.__('Untitled_Topic'),
			pmid: message?._id,
			all: true,
		});
		goToRoomById(discussion._id);
	};

	return (
		<div className='bm-forward-container'>
			<div className='bm-forward-bg'>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<span className='bm_forward_selected_msgs' style={{ fontSize: 'middle', marginBottom: '40px' }}>
						{t('Selected__count__msgs', { count: selectedMessageCount })}
					</span>
				</div>
				<div style={{ display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
					<div
						style={{ marginRight: '40px', cursor: 'pointer' }}
						onClick={() => {
							imperativeModal.open({
								component: ForwardMessage,
								props: {
									onClose: imperativeModal.close,
									msgIds: selectedMessageStore.getSelectedMessages(),
									isMerged: false,
								},
							});
						}}
					>
						<ForwordBigIcon />
						<div style={{ textAlign: 'center', color: '#1D2129' }}>{t('forward_msg_by_msg')}</div>
					</div>
					<div
						style={{ marginRight: '40px', cursor: 'pointer' }}
						onClick={() => {
							imperativeModal.open({
								component: ForwardMessage,
								props: {
									onClose: imperativeModal.close,
									msgIds: selectedMessageStore.getSelectedMessages(),
									isMerged: true,
								},
							});
						}}
					>
						<CombineBigIcon />
						<div style={{ textAlign: 'center', color: '#1D2129' }}>{t('Merge_forward')}</div>
					</div>
					<div
						style={{ cursor: 'pointer' }}
						onClick={() => {
							createNewDiscussion();
						}}
					>
						<DiscussionStartBigIcon />
						<div style={{ textAlign: 'center', color: '#1D2129' }}>{t('Discussion_start')}</div>
					</div>
				</div>
				<div
					style={{ marginBottom: '40px', cursor: 'pointer' }}
					onClick={() => {
						selectedMessageStore.setIsSelecting(false);
						selectedMessageStore.clearStore();
					}}
				>
					<CloseForwordIcon />
				</div>
			</div>
		</div>
	);
});

RoomForwordView.displayName = 'RoomForwordView';
export default RoomForwordView;
