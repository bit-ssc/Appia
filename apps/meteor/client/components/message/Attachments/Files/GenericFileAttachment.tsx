import type { FileProp, MessageAttachmentBase } from '@rocket.chat/core-typings';
import type { FC } from 'react';
import React from 'react';

import FileIcon from '../../../FileIcon';
import MarkdownText from '../../../MarkdownText';
import Attachment from '../Attachment';
import { useMediaUrl } from '../context/AttachmentContext';

export type GenericFileAttachmentProps = {
	file?: FileProp;
	file_size?: number;
} & MessageAttachmentBase;

export const GenericFileAttachment: FC<GenericFileAttachmentProps> = ({
	title,
	// collapsed: collapsedDefault = false,
	description,
	title_link: link,
	title_link_download: hasDownload,
	file_size: size,
	// file: {
	// size,
	// format,
	// name,
	// } = {},
}) => {
	// const [collapsed, collapse] = useCollapse(collapsedDefault);
	const getURL = useMediaUrl();
	return (
		<Attachment>
			{description && <MarkdownText className='bm-file-description' parseEmoji content={description} />}
			<Attachment.Row>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<FileIcon fileName={title} fontSize={40}></FileIcon>
					<div className='bm-attachment-text' style={{ marginLeft: '15px' }}>
						<Attachment.Title className='bm-file-name'>{title}</Attachment.Title>
						{/* {hasDownload && link ? <Attachment.TitleLink link={getURL(link)} title={title} /> : <Attachment.Title>{title}</Attachment.Title>} */}
						{size && <Attachment.Size className='bm-file-size' size={size} />}
					</div>
				</div>
				<div className='bm-attachment-buttons'>
					{/* {collapse} */}
					{hasDownload && link && (
						<Attachment.Download onClick={(e) => e.stopPropagation()} className='bm-file-download' title={title} href={getURL(link)} />
					)}
				</div>
			</Attachment.Row>
			{/* { !collapsed && <Attachment.Content>
			<Attachment.Details>
				{hasDownload && link && <Attachment.Download href={link}/>}
				<Attachment.Row><Attachment.Title { ...hasDownload && link && { is: 'a', href: link } } >{name}</Attachment.Title></Attachment.Row>
				<Attachment.Row>{size && <Attachment.Size size={size}/>}<Attachment.Title>{format && size && ' | '}{format}</Attachment.Title></Attachment.Row>
			</Attachment.Details>
		</Attachment.Content> } */}
		</Attachment>
	);
};
