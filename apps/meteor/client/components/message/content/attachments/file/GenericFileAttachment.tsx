import type { MessageAttachmentBase } from '@rocket.chat/core-typings';
import {
	MessageGenericPreview,
	MessageGenericPreviewContent,
	// MessageGenericPreviewIcon,
	MessageGenericPreviewTitle,
	MessageGenericPreviewDescription,
	Box,
} from '@rocket.chat/fuselage';
// import { useMediaUrl } from '@rocket.chat/ui-contexts';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetModal } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React from 'react';

import FileIcon from '../../../../FileIcon';
// import { getFileExtension } from '../../../../../../lib/utils/getFileExtension';
import MarkdownText from '../../../../MarkdownText';
import { useMediaUrl } from '../../../Attachments/context/AttachmentContext';
import MessageCollapsible from '../../../MessageCollapsible';
import MessageContentBody from '../../../MessageContentBody';
import FilePreview from '../FilePreview';
import AttachmentSize from '../structure/AttachmentSize';

export const GenericFileAttachment: FC<MessageAttachmentBase> = ({
	baseUrl,
	title,
	description,
	descriptionMd,
	title_link: link,
	title_link_download: hasDownload,
	size,
	// format,
	collapsed,
	mentions,
}) => {
	const getURL = useMediaUrl(baseUrl);
	const setModal = useSetModal();
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
			<MessageCollapsible title={title} hasDownload={hasDownload} link={link} isCollapsed={collapsed}>
				<div className={'message-file-todo'} onClick={onClick} style={{ cursor: 'pointer' }}>
					<MessageGenericPreview style={{ maxWidth: 368, width: '100%' }}>
						<MessageGenericPreviewContent thumb={<FileIcon fileName={title} fontSize={40} style={{ margin: '10px 0 10px 10px' }} />}>
							<MessageGenericPreviewTitle externalUrl={undefined} data-qa-type='attachment-title-link' download={hasDownload}>
								{title}
							</MessageGenericPreviewTitle>
							{size && (
								<MessageGenericPreviewDescription>
									<AttachmentSize size={size} wrapper={false} />
								</MessageGenericPreviewDescription>
							)}
						</MessageGenericPreviewContent>
					</MessageGenericPreview>
				</div>
			</MessageCollapsible>
		</>
	);
};
