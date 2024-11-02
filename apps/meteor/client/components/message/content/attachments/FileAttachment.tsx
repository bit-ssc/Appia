import type { FileAttachmentProps } from '@rocket.chat/core-typings';
import { isFileAudioAttachment, isFileImageAttachment, isFileVideoAttachment } from '@rocket.chat/core-typings';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetModal } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React from 'react';

import FilePreview from './FilePreview';
import { AudioAttachment } from './file/AudioAttachment';
import { GenericFileAttachment } from './file/GenericFileAttachment';
import { ImageAttachment } from './file/ImageAttachment';
import { VideoAttachment } from './file/VideoAttachment';
import { useMediaUrl } from '../../Attachments/context/AttachmentContext';

const Attachment: FC<FileAttachmentProps> = (attachment) => {
	if (isFileAudioAttachment(attachment)) {
		return <AudioAttachment {...attachment} />;
	}
	if (isFileVideoAttachment(attachment)) {
		return <VideoAttachment {...attachment} />;
	}

	return <GenericFileAttachment {...(attachment as any)} />; // TODO: fix this
};

export const FileAttachment: FC<FileAttachmentProps> = (attachment) => {
	const getURL = useMediaUrl();
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());

	const onClick = () => {
		if (attachment.title_link) {
			const url = getURL(attachment.title_link);
			setModal(<FilePreview url={url} fileName={attachment.title} fileSize={attachment.file_size} onClose={closeModal} />);
		}
	};

	if (isFileImageAttachment(attachment)) {
		return <ImageAttachment {...attachment} />;
	}

	return (
		<a onClick={onClick}>
			<Attachment {...attachment} />
		</a>
	);
};
