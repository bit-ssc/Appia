import type { FileAttachmentProps } from '@rocket.chat/core-typings';
import { isFileAudioAttachment, isFileImageAttachment, isFileVideoAttachment } from '@rocket.chat/core-typings';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetModal } from '@rocket.chat/ui-contexts';
import type { FC, ReactElement } from 'react';
import React from 'react';

import { AudioAttachment } from './AudioAttachment';
import { GenericFileAttachment } from './GenericFileAttachment';
import { ImageAttachment } from './ImageAttachment';
import { VideoAttachment } from './VideoAttachment';
import FilePreview from '../FilePreview';
import { useMediaUrl } from '../context/AttachmentContext';

export const FileAttachment: FC<FileAttachmentProps> = (attachment) => {
	// const [previewDisplay, setPreviewDisplay] = useState(false);
	const getURL = useMediaUrl();
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());
	const onClick = (): void => {
		if (attachment.title_link) {
			const url = getURL(attachment.title_link);
			setModal(<FilePreview url={url} fileName={attachment.title} fileSize={attachment.file_size} onClose={closeModal} />);
		}
	};

	const renderFile = (): ReactElement => {
		// if (isFileImageAttachment(attachment)) {
		// 	return <ImageAttachment {...attachment} />;
		// }
		if (isFileAudioAttachment(attachment)) {
			return <AudioAttachment {...attachment} />;
		}
		if (isFileVideoAttachment(attachment)) {
			return <VideoAttachment {...attachment} />;
		}
		// if (isFilePDFAttachment(attachment)) { return <PDFAttachment {...attachment} />; }

		return <GenericFileAttachment {...attachment} />;
	};

	if (isFileImageAttachment(attachment)) {
		return <ImageAttachment {...attachment} />;
	}

	return (
		<>
			{/* {previewDisplay && url && <FilePreview url={url} fileName={attachment.title} fileSize={attachment.file_size} />} */}
			<a onClick={onClick}>{renderFile()}</a>
		</>
	);
};

export { GenericFileAttachment, ImageAttachment, VideoAttachment };
