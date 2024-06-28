import type { IRoom } from '@rocket.chat/core-typings';
import { Button, Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { usePermission, useSetModal } from '@rocket.chat/ui-contexts';
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

const separator = '\u0001\u0002';
const Content: React.FC<{ room: IRoom; rid: string; onAdd: () => void; onEdit: () => void; reload: () => Promise<void> }> = ({
	room,
	onAdd,
	onEdit,
	rid,
	reload,
}) => {
	const saveAction = useEndpointActionExperimental('POST', '/v1/rooms.saveRoomSettings', '删除成功');
	const getURL = useMediaUrl();
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());
	const [announcement, ...fileArr] = (room.announcement?.message || '').split(separator);
	const updateTime = room.announcement?.updateTime;

	let announcementTemp = announcement.replace(/\r\n/g, '<br>');
	announcementTemp = announcementTemp.replace(/\n/g, '<br>');
	// announcementTemp = announcementTemp.replaceAll('<br>', '\\\n');

	const filesDefault: IFileInfo[] = [];
	for (let index = 0; index < fileArr.length; index++) {
		if (index + 1 === fileArr.length) {
			break;
		}
		const element1 = fileArr[index];
		const element2 = fileArr[index + 1];
		const eles: IFileInfo = { fileName: element1, fileUrl: element2 };
		filesDefault.push(eles);
		index++;
	}

	const user = room.announcement?.u;
	const isEmpty = !(announcement || filesDefault.length > 0);
	const canEdit = usePermission('edit-team-channel', room._id);
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

	const picExts = ['.png', '.jpg', '.jpeg', '.gif', 'svg'];
	const pictures = filesDefault.filter((a) => picExts.some((b) => a.fileUrl.trimRight().endsWith(b)));
	const files = filesDefault.filter((a) => !picExts.some((b) => a.fileUrl.trimRight().endsWith(b)));
	return (
		<>
			<VerticalBar.Content>
				{isEmpty ? (
					<Box display='flex' flexGrow={1} flexShrink={0} alignContent='center'>
						<EmptyAnnouncement />
					</Box>
				) : (
					<Box pb='x24'>
						<Box display='flex' alignItems='center'>
							<Box style={{ marginRight: '8px' }}>
								<img
									src={`/avatar/${user?.username}`}
									style={{
										width: 36,
										height: 36,
										borderRadius: 4,
									}}
								/>
							</Box>
							<Box flexGrow={1}>
								<Box style={{ fontWeight: 600, fontSize: '14px', lineHeight: '22px' }}>{user?.name}</Box>
								{updateTime ? (
									<Box style={{ fontWeight: 400, fontSize: '12px', lineHeight: '20px', color: 'rgba(0, 0, 0, 0.4)' }}>
										{moment(updateTime).format('更新于MM月DD日 HH:mm')}
									</Box>
								) : null}
							</Box>
							{canEdit ? (
								<svg
									width='16'
									height='16'
									viewBox='0 0 16 16'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
									style={{ cursor: 'pointer', marginLeft: 5 }}
									onClick={onDelete}
								>
									<path d='M6 12V6H7V12H6Z' fill='#C5C5C5' />
									<path d='M9 6V12H10V6H9Z' fill='#C5C5C5' />
									<path
										d='M10.5 3H14V4H13V14C13 14.5523 12.5523 15 12 15H4C3.44772 15 3 14.5523 3 14V4H2V3H5.5L5.5 1.8C5.5 1.35817 5.85817 1 6.3 1H9.7C10.1418 1 10.5 1.35817 10.5 1.8V3ZM6.5 3H9.5L9.5 2L6.5 2V3ZM4 4V14H12V4H4Z'
										fill='#C5C5C5'
									/>
								</svg>
							) : null}
						</Box>
						<Box
							pb={8}
							style={{
								display: 'flex',
								wordBreak: 'break-all',
								maxHeight: '300px',
								overflowY: 'auto',
								flexDirection: 'column',
								flexGrow: 1,
							}}
						>
							{announcementTemp}
						</Box>

						{pictures.length > 0 ? (
							<Box display='flex' flexDirection='row' flexWrap='wrap'>
								{pictures.map((element) => (
									<Box
										margin='5px 5px 5px 0'
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
					</Box>
				)}
			</VerticalBar.Content>
			<VerticalBar.Footer>
				{isEmpty && canEdit ? (
					<Button primary onClick={onAdd} display='flex' w='100%' alignItems='center' justifyContent='center'>
						<Box display='flex' is='span' margin='0 5px 0 0' alignContent='center'>
							<svg width='17' height='16' viewBox='0 0 17 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
								<path d='M8 8.5H5V7.5H8V4.5H9V7.5H12V8.5H9V11.5H8V8.5Z' fill='#F0F8FF' />
								<path
									d='M8.5 15C12.366 15 15.5 11.866 15.5 8C15.5 4.13401 12.366 1 8.5 1C4.63401 1 1.5 4.13401 1.5 8C1.5 11.866 4.63401 15 8.5 15ZM8.5 14C5.18629 14 2.5 11.3137 2.5 8C2.5 4.68629 5.18629 2 8.5 2C11.8137 2 14.5 4.68629 14.5 8C14.5 11.3137 11.8137 14 8.5 14Z'
									fill='#F0F8FF'
								/>
							</svg>
						</Box>
						添加公告
					</Button>
				) : null}
				{canEdit && !isEmpty ? (
					<Button primary onClick={onEdit} display='flex' w='100%' alignItems='center' justifyContent='center'>
						<Box display='flex' is='span' margin='0 5px 0 0' alignContent='center'>
							<svg width='17' height='16' viewBox='0 0 17 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
								<path d='M11.3819 1.73689L14.6253 4.98027L15.3324 4.27316L12.089 1.02979L11.3819 1.73689Z' fill='#F0F8FF' />
								<path
									d='M2.85217 13.8632L6.46513 13.1406L13.7627 5.84298L10.5194 2.5996L3.22175 9.8972L2.49916 13.5102C2.45717 13.7201 2.64225 13.9052 2.85217 13.8632ZM10.5194 4.01382L12.3485 5.84298L5.97212 12.2194L3.68566 12.6767L4.14295 10.3902L10.5194 4.01382Z'
									fill='#F0F8FF'
								/>
							</svg>
						</Box>
						编辑公告
					</Button>
				) : null}
			</VerticalBar.Footer>
		</>
	);
};

export default Content;
