import type { MarkdownFields, MessageAttachmentDefault } from '@rocket.chat/core-typings';
import { isActionAttachment } from '@rocket.chat/core-typings';
import type { FC, ReactNode } from 'react';
import React from 'react';

import { ActionAttachment } from './ActionAttachtment';
import Attachment from './Attachment';
import FieldsAttachment from './FieldsAttachment';
import { useCollapse } from './hooks/useCollapse';
import FileIcon from '../../FileIcon';
import MarkdownText from '../../MarkdownText';

const applyMarkdownIfRequires = (
	list: MessageAttachmentDefault['mrkdwn_in'] = ['text', 'pretext'],
	key: MarkdownFields,
	text: string,
): ReactNode => (list?.includes(key) ? <MarkdownText className='bm-file-description' parseEmoji variant='inline' content={text} /> : text);

const DefaultAttachment: FC<MessageAttachmentDefault> = (attachment) => {
	// const [collapsed, collapse] = useCollapse(!!attachment.collapsed);
	const [collapsed] = useCollapse(!!attachment.collapsed);
	const displayUsername = attachment.author_real_name || attachment.author_name;

	return (
		<Attachment.Block
			color={attachment.color}
			pre={
				attachment.pretext && (
					<Attachment.Text>{applyMarkdownIfRequires(attachment.mrkdwn_in, 'pretext', attachment.pretext)}</Attachment.Text>
				)
			}
		>
			<Attachment.Content>
				{attachment.author_name && (
					<Attachment.Author>
						{attachment.author_icon && <Attachment.AuthorAvatar url={attachment.author_icon} />}
						<Attachment.AuthorName
							marginInlineStart={2}
							{...(attachment.author_link && {
								is: 'a',
								href: attachment.author_link,
								target: '_blank',
								color: undefined,
							})}
						>
							{displayUsername}
						</Attachment.AuthorName>
					</Attachment.Author>
				)}
				{attachment.title && !attachment.image_url && (
					<Attachment.Row>
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<FileIcon fileName={attachment.title} fontSize={40}></FileIcon>
							<div className='bm-attachment-text' style={{ marginLeft: '15px' }}>
								<Attachment.Title
									className='bm-file-name'
									{...(attachment.title_link && {
										is: 'a',
										href: attachment.title_link,
										target: '_blank',
										color: undefined,
									})}
								>
									{attachment.title}
								</Attachment.Title>
								{attachment.file_size && <Attachment.Size className='bm-file-size' size={attachment.file_size} />}
							</div>
						</div>

						{/* {collapse} */}
					</Attachment.Row>
				)}
				{!collapsed && (
					<>
						{attachment.text && <Attachment.Text>{applyMarkdownIfRequires(attachment.mrkdwn_in, 'text', attachment.text)}</Attachment.Text>}
						{/* {attachment.fields && <FieldsAttachment fields={attachment.mrkdwn_in?.includes('fields') ? attachment.fields.map(({ value, ...rest }) => ({ ...rest, value: <MarkdownText withRichContent={null} content={value} /> })) : attachment.fields} />} */}
						{attachment.fields && (
							<FieldsAttachment
								fields={attachment.fields.map((field) => {
									if (!field.value) {
										return field;
									}

									const { value, title, ...rest } = field;

									return {
										...rest,
										title: (
											<MarkdownText
												className='bm-file-description'
												variant='inline'
												parseEmoji
												content={title.replace(/(.*)/g, (line: string) => `${line}  `)}
											/>
										),
										value: (
											<MarkdownText
												className='bm-file-description'
												variant='inline'
												parseEmoji
												content={value.replace(/(.*)/g, (line: string) => `${line}  `)}
											/>
										),
									};
								})}
							/>
						)}
						{attachment.image_url && <Attachment.Image {...(attachment.image_dimensions as any)} src={attachment.image_url} />}
						{/* DEPRECATED */}
						{isActionAttachment(attachment) && <ActionAttachment {...attachment} />}
					</>
				)}
			</Attachment.Content>
			{attachment.thumb_url && <Attachment.Thumb url={attachment.thumb_url} />}
		</Attachment.Block>
	);
};

export default DefaultAttachment;
