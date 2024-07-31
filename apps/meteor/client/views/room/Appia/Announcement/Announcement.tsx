import type { IRoom, IRoomAnnouncement } from '@rocket.chat/core-typings';
import { Avatar, Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useTranslation } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import type { FC, MouseEvent } from 'react';
import React, { useCallback } from 'react';

import AnnouncementComponent from './AnnouncementComponent';
import { RoomRoles } from '../../../../../app/models/client/models/RoomRoles';
import FileIcon from '../../../../components/FileIcon';
import { useEndpointActionExperimental } from '../../../../hooks/useEndpointActionExperimental';
import { useReactiveValue } from '../../../../hooks/useReactiveValue';
import { useTabBarOpen } from '../../contexts/ToolboxContext';

const separator = '\u0001\u0002';

type AnnouncementParams = {
	announcement: IRoomAnnouncement;
	room: IRoom;
};

const Announcement: FC<AnnouncementParams> = ({ announcement, room }) => {
	const t = useTranslation();
	const message = announcement?.message || '';
	const username = announcement?.u && (announcement.u?.name || announcement.u?.username);
	const readAction = useEndpointActionExperimental('POST', '/v1/rooms.roomAnnouncementRead', t('Room_announcement_read'));

	const roles = useReactiveValue(
		useCallback(
			() =>
				RoomRoles.findOne({
					'rid': room._id,
					'roles': 'leader',
					'u._id': { $ne: Meteor.userId() },
				}),
			[room._id],
		),
	);

	const openTabBar = useTabBarOpen();
	const closeModal = useMutableCallback(async () => {
		const id = announcement?._id;
		if (!id) {
			return;
		}
		const read = () =>
			readAction({
				rid: room._id,
				announcementId: id,
			});
		await Promise.all([read()].filter(Boolean));
	});

	const handleContactLeader = (e: MouseEvent<HTMLAnchorElement>): void => {
		e.stopPropagation();
		if ((e.target as HTMLAnchorElement).href) {
			return;
		}

		if (window?.getSelection()?.toString() !== '') {
			return;
		}
		openRoom('d', roles?.u.username ?? '');
	};

	const handleClick = (e: MouseEvent<HTMLAnchorElement>): void => {
		e.stopPropagation();
		if ((e.target as HTMLAnchorElement).href) {
			return;
		}

		if (window?.getSelection()?.toString() !== '') {
			return;
		}

		openTabBar('room-announcement');
		closeModal();
	};
	const [content, ...fileArr] = (message || '').split(separator);

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

	return message ? (
		<AnnouncementComponent>
			<div style={{ flexDirection: 'row', display: 'flex' }}>
				<Box
					style={{ textAlign: 'left', margin: '12px 0', flex: '1' }}
					onClick={(e: MouseEvent<HTMLAnchorElement>): void => handleClick(e)}
				>
					<Box display='flex' style={{ fontSize: '12px', color: '#555555' }}>
						<Box flexGrow={1}>{t('Room_announcement_title', { username })}</Box>
						<Box
							onClick={(e) => {
								e.stopPropagation();
								closeModal();
							}}
						>
							x
						</Box>
					</Box>
					<Box style={{ fontSize: '14px', marginTop: '5px' }}>{content}</Box>

					<Box display='flex' flexDirection='row' style={{ marginTop: '5px' }}>
						{filesDefault.length > 0
							? filesDefault.map((element) => (
									<Box key={element.fileUrl} display='flex' alignItems='center' style={{ cursor: 'pointer', marginRight: '10px' }}>
										<FileIcon fileName={element.fileName} fontSize={16} style={{ flexShrink: 0 }} />
										<Box color='#5297FF' textAlign='left' margin='0 0 0 5px'>
											{element.fileName}
										</Box>
									</Box>
							  ))
							: null}
					</Box>
				</Box>
				{roles && (
					<Box
						display='flex'
						flexDirection='row'
						style={{ marginLeft: 12 }}
						onClick={(e: MouseEvent<HTMLAnchorElement>): void => handleContactLeader(e)}
					>
						<div style={{ flexDirection: 'row', backgroundColor: '#F2F3F5', width: 1 }}></div>
						<Box display='flex' flexDirection='row' alignItems='center' justifyContent='center' style={{ marginLeft: 12 }}>
							<Avatar username={roles?.u.username ?? ''} />
							<div style={{ marginLeft: 5 }}>{roles?.u.name || roles?.u.username || ''}</div>
						</Box>
					</Box>
				)}
			</div>
		</AnnouncementComponent>
	) : null;
};

export default Announcement;
