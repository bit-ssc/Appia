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

	.attachmentDetails {
		border-radius: 2px;
		background-color: transparent !important;
		display: flex;
		flex-direction: column;
		margin-right: 55px;
		border-left: 2px solid #e5e6eb;
	}
`;

type QuoteAttachmentProps = {
	attachment: MessageQuoteAttachment;
	msg?: string;
	mentions?: Pick<IUser, 'username' | 'name'>[];
};

export const QuoteAttachment = ({ attachment, msg, mentions }: QuoteAttachmentProps): ReactElement => {
	// const format = useTimeAgo();
<<<<<<< HEAD
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
=======
	// const formatMessageRecordDateAndTime = useFormatMessageRecordDateAndTime();

	// const { getUsersByIds } = useContactContext();
	const getContent = (isPopove: boolean) => {
		if (msg) {
			const mentionMap = new Map<string, string>();
			mentions?.forEach((mention) => {
				mentionMap.set(mention.username as string, mention.name as string);
			});
			return (
				<div
					dangerouslySetInnerHTML={{ __html: normalizeEmoji(msg?.replace(/@([^\s]+)/g, (all, p1) => mentionMap.get(p1) || all) || '') }}
				></div>
			);
		}
		// TODO: 提取attachment.md的逻辑到 Attchments 或 AttchmentsItem
		if (attachment.md) {
			/* const findMentions = (tokens: any): string[] => {
				if (!tokens) return [];

				if (!Array.isArray(tokens)) {
					if (tokens.type === 'MENTION_USER') {
						return [tokens.value.value];
					}
					return [];
				}

				return tokens.reduce((acc: string[], token: any) => {
					if (token.type === 'MENTION_USER') {
						return [...acc, token.value.value];
					}

					if (token.value && typeof token.value === 'object') {
						return [...acc, ...findMentions(token.value)];
					}

					return acc;
				}, []);
			};

			const mentions = findMentions(attachment.md);
			const users = getUsersByIds(mentions);
			const mentionUsers = mentions.map((username) => {
				const user = users.find((u) => u.username === username);
				return {
					username,
					name: user?.name || username,
					type: 'user',
					_id: username,
				};
			}); */
			return (
				<div
					style={{
						overflow: 'hidden',
						display: '-webkit-box',
						WebkitBoxOrient: 'vertical',
						WebkitLineClamp: isPopove ? 0 : 1,
						maxWidth: '100%',
						wordBreak: 'break-all',
						fontSize: '12px',
					}}
				>
					{/* <GazzodownText mentions={mentionUsers}> */}
					<Markup tokens={attachment.md} />
					{/* </GazzodownText> */}
				</div>
			);
		}

		return attachment.text.substring(attachment.text.indexOf('\n') + 1);
	};

	const content = getContent(false);

	const popoverContent = () => {
		const p_content = getContent(true);
		return <div style={{ maxHeight: 200, overflowY: 'auto', maxWidth: 400 }}>{p_content}</div>;
	};
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')

	return (
		<>
			<AttachmentContent className={quoteStyles} width='full'>
				<AttachmentDetails
					is='blockquote'
<<<<<<< HEAD
					borderRadius='x2'
					borderWidth='default'
					borderStyle='solid'
					borderColor='extra-light'
					borderInlineStartColor='light'
=======
					className='attachmentDetails'
					padding={editMessage ? 0 : 'default'}
					marginBlock={editMessage ? '0 !important' : 'default'}
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
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
