import { type IMessage } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetModal, useTranslation } from '@rocket.chat/ui-contexts';
import DOMPurify from 'dompurify';
import type { FC } from 'react';
import React, { useState, useEffect } from 'react';

import { APPIA_TAG, hasPermission } from '../../../../lib/utils/permission';
import { useChat } from '../../../views/room/contexts/ChatContext';
import type { IFileInfo } from '../../../views/room/contextualBar/Appia/RoomAnnouncement/Edit';
import { List } from '../../AppiaUI';
import FileIcon from '../../FileIcon';
import { DeleteIcon } from '../../SvgIcons';
import FilePreview from '../Attachments/FilePreview';
import { useMediaUrl } from '../Attachments/context/AttachmentContext';

const separator = '\u0001\u0002';

type AnnouncementParams = {
	message: IMessage;
};

const AnnouncementMsg: FC<AnnouncementParams> = ({ message }) => {
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());
	const getURL = useMediaUrl();
	const t = useTranslation();
	const chat = useChat();

	const allMessage = (message.msg ?? '').split(separator);
	const content = allMessage && allMessage.length > 0 ? allMessage[0] : '';

	const [canDelete, setCanDelete] = useState(false);

	const getType = (message: string) => message && message.split('.')[message.split('.').length - 1].trim();

	const getAllFiles = (value: string[]) => {
		const files = [] as IFileInfo[];
		for (let i = 1; i < value.length; i++) {
			const file = {
				fileName: value[i],
				fileUrl: value[i + 1],
				fileType: getType(value[i + 1]),
			} as IFileInfo;
			files.push(file);
			i++;
		}
		return files;
	};

	const isImage = (type: string) => /png|jpg|jpeg|gif|webp|apng/i.test(type.toLowerCase().trim());

	const getAllImages = (files: IFileInfo[]) => {
		const images = [] as IFileInfo[];
		for (let i = 0; i < files.length; i++) {
			if (isImage(files[i].fileType)) {
				images.push(files[i]);
			}
		}
		return images;
	};

	useEffect(() => {
		getCanDelete();
	}, []);

	const getCanDelete = async () => {
		const localMessage = !message.u.username.includes(':');
		// @ts-ignore
		if (Meteor.user()?.isManager && localMessage && hasPermission(chat?.data.getRoom()?.showAppiaTag, APPIA_TAG.external)) {
			// 外部频道主管可以撤回本地人的消息
			setCanDelete(true);
			return;
		}

		const res = (await chat?.data.canDeleteMessage(message)) ?? false;
		setCanDelete(res);
	};

	const deleteMsg = async () => {
		await chat?.flows.requestMessageDeletion(message);
	};

	const getOtherFiles = (files: IFileInfo[]) => {
		const otherFiles = [] as IFileInfo[];
		for (let i = 0; i < files.length; i++) {
			if (!isImage(files[i].fileType)) {
				otherFiles.push(files[i]);
			}
		}
		return otherFiles;
	};

	const allFiles = getAllFiles(allMessage);
	const allImages = getAllImages(allFiles);
	const otherFiles = getOtherFiles(allFiles);

	return message.msg ? (
		<Box
			style={{
				marginTop: 10,
				padding: 18,
				borderRadius: 8,
				justifyContent: 'center',
				backgroundColor: 'white',
				maxWidth: '70%',
				minWidth: '400px',
				width: 'min-content',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<Box display='flex' flexDirection='row'>
				<Box style={{ fontSize: 18, fontWeight: '600', flex: 1 }}>{t('Announcement')}</Box>
				{canDelete ? (
					<div style={{ cursor: 'pointer' }} onClick={deleteMsg}>
						<DeleteIcon />
					</div>
				) : null}
			</Box>
			<Box
				style={{
					height: 0.5,
					backgroundColor: '#efeff4',
					marginTop: 12,
					marginBottom: 12,
				}}
			></Box>
			<Box
				is='span'
				style={{ fontSize: '14px', marginBottom: '12px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'pre-wrap' }}
				dangerouslySetInnerHTML={{
					__html: DOMPurify.sanitize(content).replace(
						/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
						(text) => `<a target="_blank" rel="nofollow noopener noreferrer" href='${text}' style="color: #5297FF">${text}</a>`,
					),
				}}
			></Box>

			{allImages.length ? (
				<List
					dataSource={allImages}
					grid={{ column: 0, gutter: 10 }}
					className='rocket-search-media-list-center'
					renderItem={(item, index) => {
						if (!item.fileUrl) {
							return null;
						}
						const itemUrl = item.fileUrl.replace('ufs/FileSystem:Uploads', 'file-proxy');
						return (
							<List.Item key={item.fileUrl}>
								<Box
									is='a'
									className={['rocket-search-media-item']}
									minWidth={0}
									download
									rel='noopener noreferrer'
									target='_blank'
									title={item.fileName}
									display='flex'
									// flexGrow={1}
									// flexShrink={1}
									href={itemUrl}
									key={index}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										setModal(<FilePreview url={getURL(itemUrl)} fileName={item.fileName} fileSize={1024} onClose={closeModal} />);
										// window.location.href = getURL(itemUrl);
									}}
								>
									{<img className='rocket-anouncement-media-image' src={itemUrl} style={{ width: '100px' }} />}
								</Box>
							</List.Item>
						);
					}}
				/>
			) : null}
			{otherFiles &&
				otherFiles.map((item) => (
					<Box
						key={item.fileUrl}
						display='flex'
						alignItems='center'
						style={{ cursor: 'pointer', marginRight: '10px' }}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							// setModal(<FilePreview url={getURL(item.fileUrl)} fileName={item.fileName} fileSize={1024} onClose={closeModal} />);
							window.location.href = getURL(item.fileUrl);
						}}
					>
						<FileIcon fileName={item.fileName} fontSize={16} style={{ flexShrink: 0 }} />
						<Box
							color='#5297FF'
							textAlign='left'
							margin='0 0 0 5px'
							style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'pre-wrap' }}
						>
							{item.fileName}
						</Box>
					</Box>
				))}
		</Box>
	) : null;
};

export default AnnouncementMsg;
