import { Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetModal } from '@rocket.chat/ui-contexts';
import React from 'react';

import FileIcon from '../../../../../../components/FileIcon';
import FilePreview from '../../../../../../components/message/Attachments/FilePreview';
import { useMediaUrl } from '../../../../../../components/message/Attachments/context/AttachmentContext';
import type { Attachment } from '../types';

// import useFile from './hooks/useFile';

interface FileTypeProps {
	attachment: Attachment;
}

// 负责文件类的待办
const FileType: React.FC<FileTypeProps> = ({ attachment }) => {
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());
	const getURL = useMediaUrl();
	return (
		<Box
			key={attachment.title_link}
			display='flex'
			alignItems='center'
			style={{ cursor: 'pointer', marginRight: '10px', marginTop: 5, marginBottom: 5 }}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				// setModal(<FilePreview url={getURL(attachment.title_link)} fileName={attachment.title} fileSize={1024} onClose={closeModal} />);
				window.location.href = getURL(attachment.title_link);
			}}
		>
			<FileIcon fileName={attachment.title} fontSize={16} style={{ flexShrink: 0 }} />
			<Box
				color='#5297FF'
				textAlign='left'
				margin='0 0 0 5px'
				style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'pre-wrap' }}
			>
				{attachment.title}
			</Box>
		</Box>
	);
};

export default FileType;
