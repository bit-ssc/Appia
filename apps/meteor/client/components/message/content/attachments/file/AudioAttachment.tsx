import type { AudioAttachmentProps } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useMediaUrl, useSetModal } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React from 'react';

import MarkdownText from '../../../../MarkdownText';
import MessageCollapsible from '../../../MessageCollapsible';
import MessageContentBody from '../../../MessageContentBody';
import FilePreview from '../FilePreview';

export const AudioAttachment: FC<AudioAttachmentProps> = ({
	baseUrl,
	title,
	audio_url: url,
	audio_type: type,
	audio_size: size,
	description,
	descriptionMd,
	title_link: link,
	title_link_download: hasDownload,
	collapsed,
	mentions,
}) => {
	const getURL = useMediaUrl(baseUrl);
	// const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());

	const onClick = () => {
		if (link) {
			const url = getURL(link);
			// setModal(<FilePreview url={url} fileName={title} fileSize={size} onClose={closeModal} />);
			window.location.href = url;
		}
	};
	return (
		<>
			{descriptionMd ? <MessageContentBody md={descriptionMd} mentions={mentions} /> : <MarkdownText parseEmoji content={description} />}
			<MessageCollapsible title={title} hasDownload={hasDownload} link={getURL(link || url)} size={size} isCollapsed={collapsed}>
				<div className={'message-file-todo'} onClick={onClick} style={{ cursor: 'pointer' }}>
					<audio controls preload='none'>
						<source src={getURL(url)} type={type} />
					</audio>
				</div>
			</MessageCollapsible>
		</>
	);
};
