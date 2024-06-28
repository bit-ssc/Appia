import type { MessageQuoteAttachment, IUser } from '@rocket.chat/core-typings';
import { css } from '@rocket.chat/css-in-js';
import { Box, Palette } from '@rocket.chat/fuselage';
import type { ReactElement } from 'react';
import React from 'react';

import { useTimeAgo } from '../../../../hooks/useTimeAgo';
import MessageContentBody from '../../MessageContentBody';
import Attachments from '../Attachments';
import AttachmentAuthor from './structure/AttachmentAuthor';
import AttachmentAuthorAvatar from './structure/AttachmentAuthorAvatar';
import AttachmentAuthorName from './structure/AttachmentAuthorName';
import AttachmentContent from './structure/AttachmentContent';
import AttachmentDetails from './structure/AttachmentDetails';
import AttachmentInner from './structure/AttachmentInner';

import { useFormatMessageRecordDateAndTime } from '/client/hooks/useFormatDateAndTime';

// TODO: remove this team collaboration
const quoteStyles = css`
	.rcx-attachment__details {
		.rcx-message-body {
			color: ${Palette.text['font-hint']};
		}
	}
	&:hover,
	&:focus {
		.rcx-attachment__details {
			background: ${Palette.surface['surface-hover']};
			border-color: ${Palette.stroke['stroke-light']};
			border-inline-start-color: ${Palette.stroke['stroke-medium']};
		}
	}
`;

type QuoteAttachmentProps = {
	attachment: MessageQuoteAttachment;
	msg?: string;
	mentions?: Pick<IUser, 'username' | 'name'>[];
};

export const QuoteAttachment = ({ attachment, msg, mentions }: QuoteAttachmentProps): ReactElement => {
	// const format = useTimeAgo();
	const formatMessageRecordDateAndTime = useFormatMessageRecordDateAndTime();
	let content;
	if (msg) {
		const mentionMap = new Map<string, string>();
		mentions?.forEach((mention) => {
			mentionMap.set(mention.username as string, mention.name as string);
		});
		content = msg?.replace(/@([^\s]+)/g, (all, p1) => mentionMap.get(p1) || all) || '';
	} else {
		content = attachment.md ? <MessageContentBody md={attachment.md} /> : attachment.text.substring(attachment.text.indexOf('\n') + 1);
	}

	return (
		<>
			<AttachmentContent className={quoteStyles} width='full'>
				<AttachmentDetails
					is='blockquote'
					borderRadius='x2'
					borderWidth='default'
					borderStyle='solid'
					borderColor='extra-light'
					borderInlineStartColor='light'
				>
					<AttachmentAuthor>
						<AttachmentAuthorAvatar url={attachment.author_icon} />
						<AttachmentAuthorName
							{...(attachment.author_link && { is: 'a', href: attachment.author_link, target: '_blank', color: 'hint' })}
						>
							{attachment.author_name}
						</AttachmentAuthorName>
						{attachment.ts && (
							<Box
								fontScale='c1'
								{...(attachment.message_link ? { is: 'a', href: attachment.message_link, color: 'hint' } : { color: 'hint' })}
							>
								{formatMessageRecordDateAndTime(attachment.ts)}
							</Box>
						)}
					</AttachmentAuthor>
					{content}
					{attachment.attachments && (
						<AttachmentInner>
							<Attachments attachments={attachment.attachments} collapsed={attachment.collapsed} />
						</AttachmentInner>
					)}
				</AttachmentDetails>
			</AttachmentContent>
		</>
	);
};
