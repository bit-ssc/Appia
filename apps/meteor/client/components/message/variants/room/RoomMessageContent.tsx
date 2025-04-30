import type { IMessage, IRoom } from '@rocket.chat/core-typings';
import { isDiscussionMessage, isThreadMainMessage, isE2EEMessage } from '@rocket.chat/core-typings';
import { Icon } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useSetting, useTranslation, useUserId, useSetModal } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { memo, useMemo } from 'react';

import { MessageTypes } from '../../../../../app/ui-utils/lib/MessageTypes';
import { useUserData } from '../../../../hooks/useUserData';
import { UploadState } from '../../../../lib/chats/Upload';
import { process } from '../../../../lib/chats/flows/sendMessage';
import type { UserPresence } from '../../../../lib/presence';
import { useChat } from '../../../../views/room/contexts/ChatContext';
import { useMenuBarContext } from '../../../../views/root/contexts/MenuBar';
import UploadFail from '../../../AppiaIcon/UploadFail';
import { Progress } from '../../../AppiaUI';
import MessageContentBody from '../../MessageContentBody';
// import ReadReceiptIndicator from '../../ReadReceiptIndicator';
import Appia, { components } from '../../appia';
import FastModelMsg from '../../appia/FastModelMsg/FastModelMsg';
import ReadReceiptsModal from '../../appia/ReadReceiptsModal';
import Attachments from '../../content/Attachments';
import BroadcastMetrics from '../../content/BroadcastMetrics';
import DiscussionMetrics from '../../content/DiscussionMetrics';
import Location from '../../content/Location';
import MessageActions from '../../content/MessageActions';
import Reactions from '../../content/Reactions';
import ThreadMetrics from '../../content/ThreadMetrics';
import UiKitSurface from '../../content/UiKitSurface';
// import UrlPreviews from '../../content/UrlPreviews';
import { MessageContent } from '../../hooks/useMessage';
import { useNormalizedMessage } from '../../hooks/useNormalizedMessage';
// import { useOembedLayout } from '../../hooks/useOembedLayout';
import { useSubscriptionFromMessageQuery } from '../../hooks/useSubscriptionFromMessageQuery';
import AnnouncementMsg from '../AnnouncementMsg';
import { ChatAPI } from '/client/lib/chats/ChatAPI';
import { MessageReadIcon, MessageUnReadIcon } from '/client/components/SvgIcons';

type RoomMessageContentProps = {
	message: IMessage;
	room: IRoom;
	unread: boolean;
	mention: boolean;
	all: boolean;
	searchText?: string;
};

// eslint-disable-next-line complexity
const RoomMessageContent = ({ message, room, unread, all, mention, searchText }: RoomMessageContentProps): ReactElement => {
	const encrypted = isE2EEMessage(message);
	const setModal = useSetModal();
	const { uploadingFailedFiles } = useMenuBarContext();
	const closeModal = useMutableCallback(() => setModal());
	// const { enabled: oembedEnabled } = useOembedLayout();
	const subscription = useSubscriptionFromMessageQuery(message).data ?? undefined;
	const broadcast = subscription?.broadcast ?? false;
	const uid = useUserId();
	const messageUser: UserPresence = { ...message.u, roles: [], ...useUserData(message.u._id) };
	const edited = useMemo(() => {
		return !!message?.editedAt || !!message?.editedBy;
	}, [message?.editedAt, message?.editedBy]);
	const readReceiptEnabled =
		useSetting('Appia_Message_Read_Receipt_Enabled') && !MessageTypes.isSystemMessage(message) && message.u._id === uid;
	// const readReceiptEnabled = !MessageTypes.isSystemMessage(message) && message.u._id === uid;
	const chat = useChat();
	const t = useTranslation();
	const isDirectRoom = room?.t === 'd' && message.u?._id === uid;

	const normalizedMessage = useNormalizedMessage(message);

	const openReceiptModal = () => {
		if (!isDirectRoom && message.unread) {
			setModal(<ReadReceiptsModal messageId={message._id} rid={room._id} roomType={room.t} onClose={closeModal} />);
		}
	};

	const resendMessage = async () => {
		if (!message?._id) return;
		if (message?.sendFailed) {
			await process(chat as unknown as ChatAPI, { ...message, temp: undefined, sendFailed: undefined });
			return;
		}
		if (message?.appiaFederation?.resendMap) {
			await chat?.flows?.resendFederationMessage(message);
		}
	};

	const readReceiptStyle = () => {
		if (message?.attachments?.length) {
			const firstAttach = message.attachments[0];
			if (firstAttach?.image_url) {
				return 'read-receipt-pic';
			}

			if (firstAttach?.message_link) {
				return 'read-receipt-quote';
			}

			return 'read-receipt-attach';
		}
		return '';
	};

	const renderReadReceipt = () => {
		if (message?.sendFailed || (message?.appiaFederation?.resendMap && message?.u?._id === uid)) {
			return (
				<div className={'upload-progress'} onClick={resendMessage}>
					<UploadFail />
					<span className={'progress-text'}>{t('Send_Failed')}</span>
				</div>
			);
		}
		return (
			readReceiptEnabled && (
				<div className={`read-receipt ${readReceiptStyle()}`} onClick={openReceiptModal}>
					{message.unread ? <MessageUnReadIcon /> : <MessageReadIcon />}
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
	var margin_right = readReceiptEnabled ? '25px' : '0px';
	if (message.msgType == 'oncall') {
		margin_right = '12px';
	}
	if (message.msgType) {
		const className = components[message.msgType]?.className;
		return (
			<div
				className={`rcx-message-body${className ? ` appia-message-body-${className}-wrapper` : ''}`}
				style={{ position: 'relative', display: 'inline-block', marginRight: margin_right }}
			>
				<Appia msg={message} />
				{message.msgType != 'oncall' && renderReadReceipt()}
			</div>
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
			return renderReadReceipt();
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

	const renderContent = () => {
		if (MessageTypes.isAnnoucementMessage(message)) {
			return <AnnouncementMsg message={message} />;
		}

		return (
			!normalizedMessage.blocks?.length &&
			!!normalizedMessage.md?.length && (
				<>
					{(!encrypted || normalizedMessage.e2e === 'done') && (
						<MessageContentBody
							id={message._id}
							md={normalizedMessage.md}
							mentions={normalizedMessage.mentions}
							channels={normalizedMessage.channels}
							searchText={searchText}
							edited={edited}
						/>
					)}
					{encrypted && normalizedMessage.e2e === 'pending' && t('E2E_message_encrypted_placeholder')}
				</>
			)
		);
	};

	return (
		<div
			style={{
				position: 'relative',
				display: 'inline-block',
				overflowX: searchText ? 'hidden' : 'inherit',
				marginRight: readReceiptEnabled ? '25px' : 0,
				maxWidth: '100%',
			}}
		>
			{renderContent()}

			{normalizedMessage.blocks && (
				<UiKitSurface mid={normalizedMessage._id} blocks={normalizedMessage.blocks} appId rid={normalizedMessage.rid} />
			)}

			{!!normalizedMessage?.attachments?.length && (
				<Attachments attachments={normalizedMessage.attachments} baseUrl={message.appiaBaseUrl} mentions={normalizedMessage.mentions} />
			)}

			{/**
			{oembedEnabled && !!normalizedMessage.urls?.length && <UrlPreviews urls={normalizedMessage.urls} />}
			 */}
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

			{/* {readReceiptEnabled && <ReadReceiptIndicator unread={normalizedMessage.unread} />}*/}
			{message?.fileData?.uploadState ? renderFileProgress() : renderReadReceipt()}

			{/* Debugging */}
			{/* <div style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
				<pre>{JSON.stringify({ message, normalizedMessage }, null, 2)}</pre>
			</div> */}
		</div>
	);
};

const RoomMessage = (props: RoomMessageContentProps) => (
	<MessageContent.Provider value={{ message: props.message }}>
		<RoomMessageContent {...props} />
	</MessageContent.Provider>
);

export default memo(RoomMessage);
