import type { MessageQuoteAttachment } from '@rocket.chat/core-typings';
// import { css } from '@rocket.chat/css-in-js';
import { Box } from '@rocket.chat/fuselage';
// import colors from '@rocket.chat/fuselage-tokens/colors';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetModal } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React from 'react';

import Attachments from '.';
import Attachment from './Attachment';
import FilePreview from './FilePreview';
import { useMediaUrl } from './context/AttachmentContext';
import { useTimeAgo } from '../../../hooks/useTimeAgo';
import MarkdownText from '../../MarkdownText';
import { getForwardMsgTitle } from '../appia/ForwardMsg';

// const hover = css`
// 	&:hover,
// 	&:focus {
// 		.rcx-attachment__details {
// 			background: ${colors.n200} !important;
// 			border-color: ${colors.n300} !important;
// 			border-inline-start-color: ${colors.n600} !important;
// 		}
// 	}
// `;

export const QuoteAttachment: FC<MessageQuoteAttachment> = ({
	// author_icon: url,
	author_name: name,
	author_real_name: realName,
	// author_link: authorLink,
	message_link: messageLink,
	ts,
	text,
	msgType,
	msgData,
	attachments,
}) => {
	const getURL = useMediaUrl();
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());

	const format = useTimeAgo();
	const displayName = realName || name;
	if (msgType === 'forwardMergeMessage') {
		text = getForwardMsgTitle(msgData);
	}

	if (messageLink?.startsWith('http') && !messageLink?.startsWith(location.origin)) {
		const hostPattern = /https?:\/\/.*?\//i;
		messageLink = messageLink?.replace(hostPattern, `${location.origin}/`);
	}
	return (
		<>
			<Attachment.Content width='full' {...(messageLink ? { is: 'a', href: messageLink } : {})}>
				<Attachment.Details
					is='blockquote'
					// borderRadius='x2'
					borderInlineStartWidth='x2'
					// borderStyle='solid'
					// borderColor='neutral-200'
					borderInlineStartColor='neutral-600'
					backgroundColor='inherit'
					paddingBlockStart={2}
					paddingBlockEnd={10}
					paddingInlineStart={10}
				>
					<Attachment.Author>
						{/* <Attachment.AuthorAvatar url={url} /> */}
						<Attachment.AuthorName
							marginInlineStart={0}
							// {...(authorLink && { is: 'a', href: authorLink, target: '_blank', color: undefined })}
							fontSize={12}
							fontWeight='400'
							color='rgba(0, 0, 0, 0.9)'
						>
							{displayName}
						</Attachment.AuthorName>
						{ts && (
							<Box color='rgba(0, 0, 0, 0.26)' fontSize={12}>
								{format(ts)}
							</Box>
						)}
					</Attachment.Author>
					<MarkdownText parseEmoji variant='inline' content={text} />
					{attachments && (
						<Attachment.Inner
							mbe='-12px'
							className='bm-quote-attachment'
							onClick={(e) => {
								const item = attachments[0];
								if (item) {
									e.stopPropagation();
									e.preventDefault();

									if (item.title_link) {
										const url = getURL(item.title_link);
										setModal(<FilePreview url={url} fileName={item.title} fileSize={item.file_size} onClose={closeModal} />);
									}
								}
							}}
						>
							<Attachments attachments={attachments} />
						</Attachment.Inner>
					)}
				</Attachment.Details>
			</Attachment.Content>
		</>
	);
};
