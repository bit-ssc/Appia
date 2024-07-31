import type { IRoom, IRoomAnnouncement } from '@rocket.chat/core-typings';
import { css } from '@rocket.chat/css-in-js';
import { Button, Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { usePermission, useSetModal, useTranslation } from '@rocket.chat/ui-contexts';
import DOMPurify from 'dompurify';
import moment from 'moment/moment';
import React, { useCallback } from 'react';

import { EmptyAnnouncement } from '../../../../../components/AppiaIcon';
import FileIcon from '../../../../../components/FileIcon';
import VerticalBar from '../../../../../components/VerticalBar';
import FilePreview from '../../../../../components/message/Attachments/FilePreview';
import { useMediaUrl } from '../../../../../components/message/Attachments/context/AttachmentContext';
import { useEndpointActionExperimental } from '../../../../../hooks/useEndpointActionExperimental';
import type { IFileInfo } from './Edit';

const appiaAnnouncementStyle = css`
	margin-top: 12px;
	border: 1px solid #e7e7e7;
	border-radius: 4px;
	font-family: inherit;
	padding: 12px;

	.annoucementPublisher {
		font-weight: 600;
		font-size: 14px;
		line-height: 22px;
	}

	.announcementTime {
		font-weight: 400;
		font-size: 12px;
		line-height: 20px;
		color: rgba(0, 0, 0, 0.4);
	}

	.annoucementFooter {
		display: flex;
		flex-direction: row;
		border-top: 1px solid #e7e7e7;
		margin: 0 -12px -12px -12px;
		height: 40px;
		align-items: center;
		justify-content: center;
	}

	.announcementButton {
		line-height: 40px;
		font-size: 14px;
		font-weight: 400;
		flex: 1;
		height: 100%;
		text-align: center;
		cursor: pointer;
	}

	.announcementEdit {
		color: #1b5bff;
	}

	.announcementDelete {
		color: #ff1b1b;
		border-right: 1px solid #e7e7e7;
	}
`;

const separator = '\u0001\u0002';
const Content: React.FC<{
	room: IRoom;
	rid: string;
	onAdd: () => void;
	onEdit: (annoncement: IRoomAnnouncement) => void;
	reload: () => Promise<void>;
}> = ({ room, onAdd, onEdit, rid, reload }) => {
	const t = useTranslation();
	const saveAction = useEndpointActionExperimental('POST', '/v1/rooms.saveRoomSettings');
	const getURL = useMediaUrl();
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());

	const handleAnnouncementData = () => {
		const datas = room.announcements || [];

		if (room.announcement && !room.announcements?.filter((item) => item._id === room.announcement?._id)) {
			const [announcement, ...fileArr] = (room.announcement.message || '').split(separator);
			let announcementTemp = announcement.replace(/\r\n/g, '<br>');
			announcementTemp = announcementTemp.replace(/\n/g, '<br>');

			const updateTime = room.announcement?.updateTime;

			const files = fileArr.reduce((acc, current, index, arr) => {
				if (index % 2 === 0) {
					acc.push({ fileName: current, fileUrl: arr[index + 1] });
				}
				return acc;
			}, []);

			const original = { ...room.announcement, message: announcementTemp, updateTime, files };
			datas.push(original);
		}
		return datas;
	};

	const datas = handleAnnouncementData();

	const isEmpty = datas.length === 0;
	const canEdit = usePermission('edit-team-channel', room._id);

	const handleFiles = (item) => {
		const picExts = ['.png', '.jpg', '.jpeg', '.gif', 'svg', 'bmp', 'apng', 'webp'];
		const pictures = item.files.filter((a) => picExts.some((b) => a.fileUrl.trimRight().endsWith(b)));
		const files = item.files.filter((a) => !picExts.some((b) => a.fileUrl.trimRight().endsWith(b)));
		return { pictures, files };
	};

	const onPreview = useCallback(
		(file: IFileInfo) => {
			const url = getURL(file.fileUrl.trimRight());
			setModal(<FilePreview url={url} fileName={file.fileName.trimRight()} fileSize={1024} onClose={closeModal} />);
		},
		[getURL, setModal, closeModal],
	);
	const onDelete = useCallback(async () => {
		await saveAction({
			rid,
			// @ts-ignore
			roomAnnouncement: '',
		});
		await reload();
	}, [rid, saveAction, reload]);

	return (
		<>
			<VerticalBar.Content>
				{isEmpty ? (
					<Box display='flex' flexGrow={1} flexShrink={0} alignContent='center'>
						<EmptyAnnouncement />
					</Box>
				) : (
					datas.map((item) => {
						const { pictures } = handleFiles(item);
						const { files } = handleFiles(item);
						return (
							<Box key={item._id} className={appiaAnnouncementStyle}>
								<Box className='annoucementPublisher'>{t('Room_announcement_title', { username: item.u?.username })}</Box>
								<Box
									pb={8}
									style={{ wordBreak: 'break-all' }}
									dangerouslySetInnerHTML={{
										__html: DOMPurify.sanitize(item.message).replace(
											/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
											(text) => `<a target="_blank" rel="nofollow" href='${text}' style="color: #5297FF">${text}</a>`,
										),
									}}
								/>
								{item.updateTime ? (
									<Box className='announcementTime'>{moment(item.updateTime).format('发布时间：YY/MM/DD HH:mm')}</Box>
								) : null}
								{pictures.length > 0 ? (
									<Box display='flex' flexDirection='row' flexWrap='wrap'>
										{pictures.map((element) => (
											<Box
												margin='5px 5px 5px 0'
												borderRadius='4px'
												border={'1px solid #e7e7e7'}
												width={100}
												height={100}
												style={{ background: `url(${element.fileUrl}) center center / cover no-repeat` }}
												onClick={() => onPreview(element)}
											></Box>
										))}
									</Box>
								) : null}
								{files.length > 0
									? files.map((element) => (
											<Box
												margin='5px 0 10px 0'
												display='flex'
												flexGrow={1}
												alignItems='center'
												style={{ cursor: 'pointer', width: '100%' }}
												onClick={() => onPreview(element)}
											>
												<FileIcon fileName={element.fileName} fontSize={20} style={{ flexShrink: 0 }} />
												<Box flexGrow={1} color='#5297FF' textAlign='left' margin='0 0 0 10px'>
													{element.fileName}
												</Box>
											</Box>
									  ))
									: null}
								{canEdit ? (
									<Box className='annoucementFooter'>
										<Box className='announcementButton announcementDelete' onClick={onDelete}>
											{t('Announcement_Delete')}
										</Box>
										<Box className='announcementButton announcementEdit' onClick={() => onEdit(item)}>
											{t('Announcement_Edit')}
										</Box>
									</Box>
								) : null}
							</Box>
						);
					})
				)}
			</VerticalBar.Content>
			<VerticalBar.Footer>
				{canEdit ? (
					<Button primary onClick={onAdd} display='flex' w='100%' alignItems='center' justifyContent='center'>
						{t('Announcement_New')}
					</Button>
				) : null}
			</VerticalBar.Footer>
		</>
	);
};

export default Content;
