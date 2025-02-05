import type { IMessage } from '@rocket.chat/core-typings';
import { css } from '@rocket.chat/css-in-js';
import { MessageBody, Box, Palette, MessageTimestamp, Icon, backgroundColor } from '@rocket.chat/fuselage';
import { Markup } from '@rocket.chat/gazzodown';
<<<<<<< HEAD
=======
import { useSetting, useTranslation, useUserId } from '@rocket.chat/ui-contexts';
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
import React from 'react';

import type { MessageActionContext } from '../../../app/ui-utils/client/lib/MessageAction';
import ReadReceiptsModal from '../../appia/ReadReceiptsModal';
import { useFormatHourMinute } from '../../hooks/useFormatHourMinute';
import { process } from '../../lib/chats/flows/sendMessage';
import type { MessageWithMdEnforced } from '../../lib/parseMessageTextToAstMarkdown';
import UploadFail from '../AppiaIcon/UploadFail';
import GazzodownText from '../GazzodownText';
import MessageTopSection from './MessageTopSection';

type MessageContentBodyProps = Pick<MessageWithMdEnforced, 'mentions' | 'channels' | 'md'> & {
	searchText?: string;
<<<<<<< HEAD
};

const MessageContentBody = ({ mentions, channels, md, searchText }: MessageContentBodyProps) => {
=======
	lineClamp?: number;
	id: string;
	message: any;
	context?: any;
	sequential?: boolean;
	isLastInSequence?: boolean;
	isOnlyTextContent?: boolean;
	selecting?: boolean;
	showUserAvatar?: boolean;
	selected?: boolean;
	toggleSelected?: (id: string) => void;
	uploading?: boolean;
	chat?: boolean;
	federated?: boolean;
	style?: React.CSSProperties;
	edited?: boolean;
};

const MessageContentBody = ({
	mentions,
	channels,
	md,
	searchText,
	lineClamp,
	id,
	message,
	context,
	sequential,
	isLastInSequence,
	isOnlyTextContent,
	selecting,
	showUserAvatar,
	selected,
	toggleSelected,
	uploading,
	chat,
	federated,
	style,
	edited = false,
}: MessageContentBodyProps) => {
	const t = useTranslation();
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
	// TODO: this style should go to Fuselage <MessageBody> repository
	const messageBodyAdditionalStyles = css`
		> blockquote {
			padding-inline: 8px;
			border: 1px solid ${Palette.stroke['stroke-extra-light']};
			border-radius: 2px;
			background-color: ${Palette.surface['surface-tint']};
			border-inline-start-color: ${Palette.stroke['stroke-medium']};

			&:hover,
			&:focus {
				background-color: ${Palette.surface['surface-hover']};
				border-color: ${Palette.stroke['stroke-light']};
				border-inline-start-color: ${Palette.stroke['stroke-medium']};
			}
		}
		> ul.task-list {
			> li::before {
				display: none;
			}

			> li > .rcx-check-box > .rcx-check-box__input:focus + .rcx-check-box__fake {
				z-index: 1;
			}

			list-style: none;
			margin-inline-start: 0;
			padding-inline-start: 0;
		}
		a {
			color: ${Palette.text['font-info']};
			&:hover {
				text-decoration: underline;
			}
			&:focus {
				border: 2px solid ${Palette.stroke['stroke-extra-light-highlight']};
				border-radius: 2px;
			}
		}
<<<<<<< HEAD
=======

		.markup-container {
			display: 'inline';
			webkitboxorient: 'vertical';
		}

		.markup-container div {
			display: inline !important;
		}

		.markup-container span {
			display: inline-block !important;
		}

		.edit-message-mark {
			color: gray;
			font-size: 12px;
		}
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
	`;
	/* 	const formatTime = useFormatHourMinute();
	const shouldShowTimestamp = isLastInSequence && isOnlyTextContent;
	const resendMessage = async () => {
		if (!message?._id) return;
		await process(chat as unknown as ChatAPI, { ...message, temp: undefined, sendFailed: undefined });
	}; */
	/* 	let readByEveryone = (!message?.unread && 'read') || 'color-component-color';
	readByEveryone = message.attachments?.length ? `${readByEveryone} read-receipt-attach` : readByEveryone; */
	// const uid = useUserId();
	// const readReceiptEnabled = useSetting('Appia_Message_Read_Receipt_Enabled') && message?.u._id === uid;

	/* 	const renderReadReceipt = () => {
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
				// TODO: add onClick Func
				<div className={`read-receipt ${readByEveryone}`}>
					<Icon name='check' />
				</div>
			)
		);
	}; */

	return (
<<<<<<< HEAD
		<MessageBody data-qa-type='message-body'>
			<Box className={messageBodyAdditionalStyles}>
				<GazzodownText channels={channels} mentions={mentions} searchText={searchText}>
					<Markup tokens={md} />
=======
		<MessageBody
			data-qa-type='message-body'
			style={{
				width: '100%',
				...style,
			}}
		>
			<Box className={messageBodyAdditionalStyles} id={`j-message-content-${id}`}>
				<GazzodownText channels={channels} mentions={mentions} searchText={searchText}>
					<div
						className={edited ? 'markup-container' : ''}
						style={{
							overflow: 'hidden',
							position: 'relative',
							WebkitLineClamp: lineClamp,
						}}
					>
						{/* {!sequential && message?.md && (
							<div className='avatar-name' style={{ float: 'left', display: 'flex', marginRight: '2px', height: '20px' }}>
								<MessageTopSection
									message={message}
									context={context}
									sequential={sequential || false}
									selecting={selecting || false}
									showUserAvatar={true}
									selected={selected || false}
									toggleSelected={toggleSelected || (() => {})}
									uploading={uploading}
									chat={chat}
									federated={federated}
								/>
							</div>
						)} */}
						<Markup tokens={md} />
						{edited ? <div className='edit-message-mark'>{t('Edited')}</div> : null}
						{/* <div style={{ position: 'absolute', right: '0px', bottom: '0px', display: 'flex', alignItems: 'center' }}>
							{shouldShowTimestamp && (
								<>
									{renderReadReceipt()}
									<MessageTimestamp title={formatTime(message.ts)}>{formatTime(message.ts)}</MessageTimestamp>
								</>
							)}
						</div> */}

						{/* <div
						className={edited ? 'markup-container' : ''}
						style={{ overflow: 'hidden', display: 'inline', WebkitBoxOrient: 'vertical', WebkitLineClamp: lineClamp }}
					>
						<Markup tokens={md} />
						{edited ? <div className='edit-message-mark'>{t('Edited')}</div> : null}  */}
					</div>
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
				</GazzodownText>
			</Box>
		</MessageBody>
	);
};

export default MessageContentBody;
