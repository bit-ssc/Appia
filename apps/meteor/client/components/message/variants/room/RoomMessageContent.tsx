import type { IMessage } from '@rocket.chat/core-typings';
import { isDiscussionMessage, isThreadMainMessage, isE2EEMessage } from '@rocket.chat/core-typings';
<<<<<<< HEAD
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useSetting, useTranslation, useUserId } from '@rocket.chat/ui-contexts';
=======
import { Icon, MessageName, MessageTimestamp } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useSetting, useTranslation, useUserId, useSetModal } from '@rocket.chat/ui-contexts';
import isEqual from 'lodash/isEqual';
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
import type { ReactElement } from 'react';
import React, { memo } from 'react';

<<<<<<< HEAD
=======
import { MessageTypes } from '../../../../../app/ui-utils/lib/MessageTypes';
import { useFormatHourMinute } from '../../../../hooks/useFormatHourMinute';
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
import { useUserData } from '../../../../hooks/useUserData';
import type { UserPresence } from '../../../../lib/presence';
import { useChat } from '../../../../views/room/contexts/ChatContext';
import MessageContentBody from '../../MessageContentBody';
import ReadReceiptIndicator from '../../ReadReceiptIndicator';
import Attachments from '../../content/Attachments';
import BroadcastMetrics from '../../content/BroadcastMetrics';
import DiscussionMetrics from '../../content/DiscussionMetrics';
import Location from '../../content/Location';
import MessageActions from '../../content/MessageActions';
import Reactions from '../../content/Reactions';
import ThreadMetrics from '../../content/ThreadMetrics';
import UiKitSurface from '../../content/UiKitSurface';
<<<<<<< HEAD
import UrlPreviews from '../../content/UrlPreviews';
=======
// import UrlPreviews from '../../content/UrlPreviews';
import MessageAvatar from '../../header/MessageAvatar';
import { MessageContent } from '../../hooks/useMessage';
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
import { useNormalizedMessage } from '../../hooks/useNormalizedMessage';
import { useOembedLayout } from '../../hooks/useOembedLayout';
import { useSubscriptionFromMessageQuery } from '../../hooks/useSubscriptionFromMessageQuery';
<<<<<<< HEAD
=======
import AnnouncementMsg from '../AnnouncementMsg';
import { useMessageListShowRealName, useMessageListShowUsername } from '../../list/MessageListContext';

import type { IRoomSender } from '/client/components/UserCard/RoomSenderCard';
import { getUserDisplayName } from '/lib/getUserDisplayName';
import type { ChatAPI } from '/client/lib/chats/ChatAPI';
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')

type RoomMessageContentProps = {
	message: IMessage;
	unread: boolean;
	mention: boolean;
	all: boolean;
	searchText?: string;
	showUserAvatar?: boolean;
	sequential?: boolean;
	isLastInSequence?: boolean;
	selecting?: boolean;
	selected?: boolean;
	toggleSelected?: () => void;
	uploading?: boolean;
	federated?: boolean;
};

<<<<<<< HEAD
const RoomMessageContent = ({ message, unread, all, mention, searchText }: RoomMessageContentProps): ReactElement => {
	const encrypted = isE2EEMessage(message);
	const { enabled: oembedEnabled } = useOembedLayout();
	const subscription = useSubscriptionFromMessageQuery(message).data ?? undefined;
	const broadcast = subscription?.broadcast ?? false;
	const uid = useUserId();
	const messageUser: UserPresence = { ...message.u, roles: [], ...useUserData(message.u._id) };
	const readReceiptEnabled = useSetting('Message_Read_Receipt_Enabled', false);
=======
// eslint-disable-next-line complexity
const RoomMessageContent = ({
	message,
	room,
	unread,
	all,
	mention,
	searchText,
	showUserAvatar,
	sequential,
	isLastInSequence,
	selecting,
	selected,
	toggleSelected,
	uploading,
	federated,
}: RoomMessageContentProps): ReactElement => {
	const encrypted = isE2EEMessage(message);
	const setModal = useSetModal();
	const { uploadingFailedFiles } = useMenuBarContext();
	const closeModal = useMutableCallback(() => setModal());
	const subscription = useSubscriptionFromMessageQuery(message).data ?? undefined;
	const broadcast = subscription?.broadcast ?? false;
	const uid = useUserId();

	// const messageUser: UserPresence = { ...message.u, roles: [], ...useUserData(message.u._id) };
	const edited = useMemo(() => {
		return !!message?.editedAt || !!message?.editedBy;
	}, [message?.editedAt, message?.editedBy]);
	const readReceiptEnabled =
		useSetting('Appia_Message_Read_Receipt_Enabled') && !MessageTypes.isSystemMessage(message) && message.u._id === uid;
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
	const chat = useChat();
	const t = useTranslation();

	const normalizedMessage = useNormalizedMessage(message);
	const showRealName = useMessageListShowRealName();
	const messageUser: UserPresence & IRoomSender = { ...(message.roomSender || message.u), roles: [], ...useUserData(message.u._id) };
	const usernameAndRealNameAreSame = !messageUser.name || messageUser.username === messageUser.name;
	const showUsername = useMessageListShowUsername() && showRealName && !usernameAndRealNameAreSame;
	const roomName = message.roomSender?.fname || message.roomSender?.dname || message.roomSender?.name;
	const formatTime = useFormatHourMinute();

	const hasOnlyTextContent = () => {
		const msgData = message.msgData && JSON.parse(message.msgData || '');
		if (message.msgType) return false;
		if (msgData?.type === 'fastModelMsg') return false;
		if (normalizedMessage.blocks) return false;
		if (normalizedMessage.attachments && normalizedMessage.attachments.length > 0) return false;
		if (normalizedMessage.actionLinks && normalizedMessage.actionLinks.length > 0) return false;
		if (normalizedMessage.reactions && Object.keys(normalizedMessage.reactions).length > 0) return false;
		// 检查其他可能的条件
		if (MessageTypes.isAnnoucementMessage(message)) return false;
		if (message.location) return false;
		// 如果都不存在，则只渲染文本内容
		return true;
	};

	const shouldShowTimestamp = isLastInSequence && hasOnlyTextContent();

<<<<<<< HEAD
	return (
		<>
			{!normalizedMessage.blocks?.length && !!normalizedMessage.md?.length && (
				<>
					{(!encrypted || normalizedMessage.e2e === 'done') && (
						<MessageContentBody
							md={normalizedMessage.md}
							mentions={normalizedMessage.mentions}
							channels={normalizedMessage.channels}
							searchText={searchText}
						/>
					)}
					{encrypted && normalizedMessage.e2e === 'pending' && t('E2E_message_encrypted_placeholder')}
				</>
			)}
=======
	const openReceiptModal = () => {
		if (!isDirectRoom && message.unread) {
			setModal(<ReadReceiptsModal messageId={message._id} rid={room._id} roomType={room.t} onClose={closeModal} />);
		}
	};

	const resendMessage = async () => {
		if (!message?._id) return;
		await process(chat as unknown as ChatAPI, { ...message, temp: undefined, sendFailed: undefined });
	};

	const renderReadReceipt = () => {
		// 	let readByEveryone = (!message.unread && 'read') || 'color-component-color';
		if (message?.sendFailed) {
			return (
				<div className={'upload-progress'} onClick={resendMessage}>
					<UploadFail />
					<span className={'progress-text'}>{t('Send_Failed')}</span>
				</div>
			);
		}
		return (
			readReceiptEnabled && (
				<div className={`read-receipt ${readByEveryone}`} onClick={openReceiptModal}>
					<Icon name='check' size={10} />
				</div>
			)
		);
	};

	const msgData: any = message.msgData && JSON.parse(message.msgData || '');

	if (msgData?.type === 'fastModelMsg') {
		return (
			<div className={'rcx-message-body'}>
				<FastModelMsg
					content={msgData?.refs?.content}
					snippets={msgData?.refs?.snippets}
					docs={msgData?.refs?.docs}
					botId={subscription?.name}
				/>
			</div>
		);
	}
	let margin_right = readReceiptEnabled ? '25px' : '0px';
	if (message.msgType == 'oncall') {
		margin_right = '12px';
	}
	if (message.msgType) {
		const className = components[message.msgType]?.className;
		return (
			<>
				<div
					className={`rcx-message-body${className ? ` appia-message-body-${className}-wrapper` : ''}`}
					style={{ position: 'relative', display: 'inline-block', width: '400px' }}
				>
					<Appia msg={message} />
				</div>
				<div style={{ position: 'absolute', right: '0', bottom: '2px', display: 'flex', alignItems: 'center' }}>
					{isLastInSequence && (
						<>
							{renderReadReceipt()}
							<MessageTimestamp title={formatTime(message.ts)}>{formatTime(message.ts)}</MessageTimestamp>
						</>
					)}
				</div>
			</>
		);
	}

	const resendFile = () => {
		const file = uploadingFailedFiles.get(message._id);
		if (file) {
			Object.defineProperty(file, 'messageId', {
				value: message._id,
			});
			chat?.flows.uploadFiles([file], true);
			return;
		}
		window.alert(t('File_not_Found'));
	};

	const renderFileProgress = () => {
		if (message?.fileData?.uploadState === UploadState.fail) {
			return (
				<div className={'upload-progress'} onClick={resendFile}>
					<UploadFail />
					<span className={'progress-text'}>{t('Send_Failed')}</span>
				</div>
			);
		}
		if (message?.fileData?.uploadState === UploadState.success) {
			// return renderReadReceipt();
			return (
				<div style={{ position: 'absolute', right: '0', bottom: '2px', display: 'flex', alignItems: 'center' }}>
					{isLastInSequence && (
						<>
							{renderReadReceipt()}
							<MessageTimestamp title={formatTime(message.ts)}>{formatTime(message.ts)}</MessageTimestamp>
						</>
					)}
				</div>
			);
		}
		if (message?.fileData?.uploadState === UploadState.uploading) {
			return (
				<div className={'upload-progress'}>
					<Progress type='circle' size={20} percent={message.fileData.progress} />
					<div className={'progress-text'}>{message?.fileData?.progress}%</div>
				</div>
			);
		}
		return null;
	};

	const renderAnnoucementMessage = () => {
		return <AnnouncementMsg message={message} />;
	};

	const renderContent = () => {
		if (MessageTypes.isAnnoucementMessage(message)) {
			return renderAnnoucementMessage();
		}

		return (
			!normalizedMessage.blocks?.length &&
			!!normalizedMessage.md?.length && (
				<>
					<MessageContentBody
						id={message._id}
						md={normalizedMessage.md}
						mentions={normalizedMessage.mentions}
						channels={normalizedMessage.channels}
						message={message}
						context={undefined}
						sequential={sequential}
						isLastInSequence={isLastInSequence}
						isOnlyTextContent={hasOnlyTextContent()}
						selecting={selecting}
						showUserAvatar={showUserAvatar}
						selected={selected}
						toggleSelected={toggleSelected}
						uploading={uploading}
						chat={chat}
						federated={federated}
						edited={edited}
					/>
					{encrypted && normalizedMessage.e2e === 'pending' && t('E2E_message_encrypted_placeholder')}
				</>
			)
		);
	};

	return (
		<div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
			<div className='message-container'>
				{/* {renderUser()} */}
				{renderContent()}
			</div>
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')

			{normalizedMessage.blocks && (
				<UiKitSurface mid={normalizedMessage._id} blocks={normalizedMessage.blocks} appId rid={normalizedMessage.rid} />
			)}

<<<<<<< HEAD
			{!!normalizedMessage?.attachments?.length && <Attachments attachments={normalizedMessage.attachments} />}
=======
			{!!normalizedMessage?.attachments?.length && (
				<div style={{ position: 'relative', marginTop: '5px', marginBottom: '5px', marginRight: '55px' }}>
					<Attachments attachments={normalizedMessage.attachments} baseUrl={message.appiaBaseUrl} mentions={normalizedMessage.mentions} />
					{/* <div style={{ position: 'absolute', right: '0', bottom: '0', display: 'flex', alignItems: 'center' }}>
						{isLastInSequence && (
							<>
								{renderReadReceipt()}
								<MessageTimestamp title={formatTime(message.ts)}>{formatTime(message.ts)}</MessageTimestamp>
							</>
						)}
					</div> */}
				</div>
			)}
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')

			{oembedEnabled && !!normalizedMessage.urls?.length && <UrlPreviews urls={normalizedMessage.urls} />}

			{normalizedMessage.actionLinks?.length && (
				<MessageActions
					message={normalizedMessage}
					actions={normalizedMessage.actionLinks.map(({ method_id: methodId, i18nLabel, ...action }) => ({
						methodId,
						i18nLabel: i18nLabel as TranslationKey,
						...action,
					}))}
				/>
			)}

			{normalizedMessage.reactions && Object.keys(normalizedMessage.reactions).length && <Reactions message={normalizedMessage} />}

			{chat && isThreadMainMessage(normalizedMessage) && (
				<ThreadMetrics
					counter={normalizedMessage.tcount}
					following={Boolean(uid && normalizedMessage?.replies?.indexOf(uid) > -1)}
					mid={normalizedMessage._id}
					rid={normalizedMessage.rid}
					lm={normalizedMessage.tlm}
					unread={unread}
					mention={mention}
					all={all}
					participants={normalizedMessage?.replies?.length}
				/>
			)}

			{isDiscussionMessage(normalizedMessage) && (
				<DiscussionMetrics
					count={normalizedMessage.dcount}
					drid={normalizedMessage.drid}
					lm={normalizedMessage.dlm}
					rid={normalizedMessage.rid}
				/>
			)}

			{normalizedMessage.location && <Location location={normalizedMessage.location} />}

			{broadcast && !!messageUser.username && normalizedMessage.u._id !== uid && (
				<BroadcastMetrics username={messageUser.username} message={normalizedMessage} />
			)}

<<<<<<< HEAD
			{readReceiptEnabled && <ReadReceiptIndicator unread={normalizedMessage.unread} />}
		</>
=======
			{/* {readReceiptEnabled && <ReadReceiptIndicator unread={normalizedMessage.unread} />}*/}
			{message?.fileData?.uploadState ? (
				renderFileProgress()
			) : (
				<div style={{ position: 'absolute', right: '0', bottom: '2px', display: 'flex', alignItems: 'center' }}>
					{isLastInSequence && (
						<>
							{renderReadReceipt()}
							<MessageTimestamp title={formatTime(message.ts)}>{formatTime(message.ts)}</MessageTimestamp>
						</>
					)}
				</div>
			)}
		</div>
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
	);
};

export default memo(RoomMessageContent);
