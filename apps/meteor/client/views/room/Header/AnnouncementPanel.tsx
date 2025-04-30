import type { IRoom, IRoomAnnouncement } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import { useTranslation, usePermission } from '@rocket.chat/ui-contexts';
import React, { useState, useEffect } from 'react';
import type { FC } from 'react';

import { AnnouncementPanelIcon } from '../../../components/AppiaIcon';
import './style/styles.css';
import FileIcon from '../../../components/FileIcon';
import CreateAnnouncement from '../Appia/Announcement/CreateAnnouncement';
import { openImage } from '../../../lib/openImage';
// import { useRoomContext } from '../contexts/RoomContext';

type AnnouncementPanelParams = {
	room: IRoom;
	showAnnouncementsClick: () => void;
};

const separator = '\u0001\u0002';

const AnnouncementPanel: FC<AnnouncementPanelParams> = ({ room, showAnnouncementsClick }) => {
	const t = useTranslation();
	// const { isAnnouncementOpen } = useRoomContext();

	const [announcements, setAnnouncements] = useState<IRoomAnnouncement[]>([]);
	const [content, setContent] = useState();
	const canEdit = usePermission('edit-team-channel', room._id);

	const fileContent = (fileName, fileUrl) => {
		return (
			<div className='room-panel-image-body'>
				<FileIcon fileName={fileName} fontSize={16} style={{ flexShrink: 0 }} />
				<Box
					color='#5297FF'
					onClick={() => {
						openImage(fileUrl);
					}}
					textAlign='left'
					margin='0 0 0 5px'
					style={{
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						cursor: 'pointer',
					}}
				>
					{fileName}
				</Box>
			</div>
		);
	};

	const handleAnnouncementData = () => {
		const datas = room.announcements || [];
		const { announcement } = room;
		if (
			announcement &&
			announcement.message &&
			announcement.message.length &&
			(datas.length === 0 || !datas.filter((item) => item._id === announcement?._id))
		) {
			const [announcementStr, ...fileArr] = (announcement.message || '').split(separator);
			const announcementTemp = announcementStr.replace(/<br>/g, '\n');
			// announcementTemp = announcementTemp.replace(/\n/g, '<br>');

			const updateTime = announcement?.updateTime;

			const files = fileArr.reduce((acc, current, index, arr) => {
				if (index % 2 === 0) {
					acc.push({ fileName: current, fileUrl: arr[index + 1] });
				}
				return acc;
			}, []);

			const original = { ...announcement, message: announcementTemp, updateTime, files };
			datas.push(original);
		}

		datas.sort((a, b) => {
			if (!a.updateTime && !b.updateTime) {
				return 0;
			}
			if (!a.updateTime) {
				return 1; // 如果a的日期为null，将a放在b之后
			}
			if (!b.updateTime) {
				return -1; // 如果b的日期为null，将b放在a之后
			}
			return (b.updateTime ?? 0).getTime() - (a.updateTime ?? 0).getTime(); // 直接比较日期对象
		});

		// setRows(newRows);
		return datas;
	};

	useEffect(() => {
		const data = handleAnnouncementData();
		setAnnouncements(data);
		let p_content = <div className='room-panel-body'>{t('No_Announcement')}</div>;
		if (data.length > 0) {
			if (data[0]?.message?.length > 0) {
				p_content = <div className='room-panel-body'>{data[0].message}</div>;
			} else if (data[0]?.files?.length > 0) {
				p_content = fileContent(data[0].files[0].fileName, data[0].files[0].fileUrl);
			}
		}
		setContent(p_content);
	}, [room?.announcements?.length, room.announcements, room?._id]);

	return (
		<div className='room-panel-container-announcement'>
			<div className='room-panel-header'>
				<div
					className='room-panel-title'
					onClick={() => {
						showAnnouncementsClick && showAnnouncementsClick();
					}}
				>
					<AnnouncementPanelIcon />
					<div className='room-panel-title-text'>{t('Announcement')}</div>
					{announcements && announcements.length > 0 && <div className='room-panel-title-right'>{`(${announcements?.length})`}</div>}
				</div>
				<div style={{ display: 'flex', alignItems: 'center' }}>{canEdit && <CreateAnnouncement room={room} />}</div>
			</div>
			{content}
		</div>
	);
};

export default AnnouncementPanel;
