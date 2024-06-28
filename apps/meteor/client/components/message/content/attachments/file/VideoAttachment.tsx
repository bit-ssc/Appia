import type { VideoAttachmentProps } from '@rocket.chat/core-typings';
import { Box, MessageGenericPreview } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useMediaUrl, useSetModal } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { useEffect, useState } from 'react';

import { userAgentMIMETypeFallback } from '../../../../../lib/utils/userAgentMIMETypeFallback';
import MarkdownText from '../../../../MarkdownText';
import MessageCollapsible from '../../../MessageCollapsible';
import MessageContentBody from '../../../MessageContentBody';
import FilePreview from '../FilePreview';

export const VideoAttachment: FC<VideoAttachmentProps> = ({
	title,
	video_url: url,
	video_type: type,
	video_size: size,
	description,
	descriptionMd,
	title_link: link,
	title_link_download: hasDownload,
	collapsed,
	uploading,
	mentions,
}) => {
	const getURL = useMediaUrl();
	const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
	useEffect(() => {
		if (uploading) {
			const video = document.createElement('video');
			video.onloadstart = () => {
				// 必须设置，否则某些浏览器可能不会触发loadedmetadata事件
				video.muted = true;
			};
			video.onloadedmetadata = () => {
				// 当视频的元数据加载完成后，获取视频尺寸
				setVideoSize({
					width: video.videoWidth,
					height: video.videoHeight,
				});

				// 释放创建的临时URL
				// URL.revokeObjectURL(videoUrl);
			};
			video.src = url;
		}
	}, [uploading]);

	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());

	const onClick = () => {
		if (link) {
			const url = getURL(link);
			setModal(<FilePreview url={url} fileName={title} fileSize={size} onClose={closeModal} />);
		}
	};

	return (
		<>
			{descriptionMd ? <MessageContentBody md={descriptionMd} mentions={mentions} /> : <MarkdownText parseEmoji content={description} />}
			<MessageCollapsible
				title={title}
				hasDownload={hasDownload}
				link={uploading ? url : getURL(link || url)}
				size={uploading ? videoSize : size}
				isCollapsed={collapsed}
			>
				<div className={'message-file-todo'} onClick={onClick} style={{ cursor: 'pointer' }}>
					<MessageGenericPreview style={{ maxWidth: 368, width: '100%' }}>
						<Box is='video' controls preload='none'>
							<source src={uploading ? url : getURL(url)} type={userAgentMIMETypeFallback(type)} />
						</Box>
					</MessageGenericPreview>
				</div>
			</MessageCollapsible>
		</>
	);
};
