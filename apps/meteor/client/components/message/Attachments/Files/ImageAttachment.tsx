import type { ImageAttachmentProps } from '@rocket.chat/core-typings';
import type { FC } from 'react';
import React from 'react';

import MarkdownText from '../../../MarkdownText';
import Attachment from '../Attachment';
import Image from '../components/Image';
// import { useMediaUrl } from '../context/AttachmentContext';
import { useCollapse } from '../hooks/useCollapse';
import { useLoadImage } from '../hooks/useLoadImage';

export const ImageAttachment: FC<ImageAttachmentProps> = ({
	// title,
	image_url: url,
	image_preview: imagePreview,
	collapsed: collapsedDefault = false,
	// image_size: size,
	image_dimensions: imageDimensions = {
		height: 360,
		width: 480,
	},
	description,
	title_link: link,
	// title_link_download: hasDownload,
}) => {
	const [loadImage, setLoadImage] = useLoadImage();
	// const [collapsed, collapse] = useCollapse(collapsedDefault);
	const [collapsed] = useCollapse(collapsedDefault);
	// const getURL = useMediaUrl();
	return (
		<Attachment>
			{description && <MarkdownText className='bm-file-description' parseEmoji variant='inline' content={description} />}
			{/* <Attachment.Row className='bm-attachment-image'>
				<div className='bm-attachment-text'>
					<Attachment.Title className='bm-file-name'>{title}</Attachment.Title>
					{size && <Attachment.Size className='bm-file-size' size={size} />}
				</div>
				<div className='bm-attachment-buttons'>
					{collapse}
					{hasDownload && link && <Attachment.Download className='bm-file-download' title={title} href={getURL(link)} />}
				</div>
			</Attachment.Row> */}
			{!collapsed && (
				<Attachment.Content>
					<Image
						{...imageDimensions}
						loadImage={loadImage}
						setLoadImage={setLoadImage}
						// dataSrc={getURL(link || url)}
						// src={getURL(url)}
						dataSrc={link || url}
						src={url}
						previewUrl={`data:image/png;base64,${imagePreview}`}
					/>
				</Attachment.Content>
			)}
		</Attachment>
	);
};
