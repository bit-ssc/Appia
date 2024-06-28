import type { AudioAttachmentProps } from '@rocket.chat/core-typings';
import type { FC } from 'react';
import React from 'react';

import MarkdownText from '../../../MarkdownText';
import Attachment from '../Attachment';
import { useMediaUrl } from '../context/AttachmentContext';
import { useCollapse } from '../hooks/useCollapse';

export const AudioAttachment: FC<AudioAttachmentProps> = ({
	title,
	audio_url: url,
	audio_type: type,
	collapsed: collapsedDefault = false,
	audio_size: size,
	is_system_audio: isSystemAudio,
	description,
	title_link: link,
	title_link_download: hasDownload,
}) => {
	// const [collapsed, collapse] = useCollapse(collapsedDefault);
	const [collapsed] = useCollapse(collapsedDefault);
	const getURL = useMediaUrl();
	return (
		<Attachment>
			{!isSystemAudio && <MarkdownText className='bm-file-description' parseEmoji variant='inline' content={description} />}
			{!isSystemAudio && (
				<Attachment.Row>
					<div className='bm-attachment-text'>
						<Attachment.Title className='bm-file-name'>{title}</Attachment.Title>
						{size && <Attachment.Size className='bm-file-size' size={size} />}
					</div>
					<div className='bm-attachment-buttons'>
						{/* {collapse} */}
						{hasDownload && link && (
							<Attachment.Download onClick={(e) => e.stopPropagation()} className='bm-file-download' title={title} href={getURL(link)} />
						)}
					</div>
				</Attachment.Row>
			)}
			{!collapsed && (
				<Attachment.Content border='none'>
					<audio controls preload='metadata'>
						<source src={getURL(url)} type={type} />
					</audio>
				</Attachment.Content>
			)}
		</Attachment>
	);
};
