import type { VideoAttachmentProps } from '@rocket.chat/core-typings';
// import { Box } from '@rocket.chat/fuselage';
import type { FC } from 'react';
import React from 'react';

// import MarkdownText from '../../../MarkdownText';
import Attachment from '../Attachment';
import { useMediaUrl } from '../context/AttachmentContext';
// import { useCollapse } from '../hooks/useCollapse';

export const VideoAttachment: FC<VideoAttachmentProps> = ({
	title,
	// video_url: url,
	// video_type: type,
	// collapsed: collapsedDefault = false,
	video_size: size,
	// description,
	title_link: link,
	title_link_download: hasDownload,
}) => {
	// const [collapsed, collapse] = useCollapse(collapsedDefault);
	// const [collapsed] = useCollapse(collapsedDefault);
	const getURL = useMediaUrl();

	return (
		<Attachment>
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
			{/* {!collapsed && (
				<Attachment.Content width='full'>
					<Box is='video' width='full' controls preload='metadata'>
						<source src={getURL(url)} type={type} />
					</Box>
					{description && (
						<Attachment.Details is='figcaption'>
							<MarkdownText className='bm-file-description' parseEmoji variant='inline' content={description} />
						</Attachment.Details>
					)}
				</Attachment.Content>
			)} */}
		</Attachment>
	);
};
