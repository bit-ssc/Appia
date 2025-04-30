import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { IRoom, IRoomAnnouncement } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetModal, useTranslation, usePermission } from '@rocket.chat/ui-contexts';
import DOMPurify from 'dompurify';
import { debounce } from 'lodash';
import moment from 'moment/moment';
import type { FC } from 'react';
import React, { memo, useState, useEffect, useCallback, useRef } from 'react';

import { ArrowIcon } from '../../../../components/AppiaIcon';
import AnnouncementHeaderIcon from '../../../../components/AppiaIcon/Meeting/AnnouncementHeaderIcon';
import { Modal, Checkbox, message } from '../../../../components/AppiaUI';
import FileIcon from '../../../../components/FileIcon';
import { EditIcon, DeleteIcon } from '../../../../components/SvgIcons';
import VerticalBarClose from '../../../../components/VerticalBar/VerticalBarClose';
import { useMediaUrl } from '../../../../components/message/Attachments/context/AttachmentContext';
import { useEndpointActionExperimental } from '../../../../hooks/useEndpointActionExperimental';
import { useRoomContext } from '../../contexts/RoomContext';
import AnnouncementComponent from './AnnouncementComponent';
import { AnnouncementType } from './AnnouncementType';
import Edit from './Edit';
import CreateMeetingModal from './Meeting/CreateMeetingModal';
import { CreateMeetingSummaryModal } from './Summary';
import { openImage } from '../../../../lib/openImage';

import SummaryHeaderIcon from '/client/components/AppiaIcon/Meeting/SummaryHeaderIcon';

import EditMeeting from './component/EditMeeting';

const separator = '\u0001\u0002';

type AnnouncementParams = {
	announcement: IRoomAnnouncement;
	room: IRoom;
};

enum ItemFoldStatus {
	default = '0',
	fold = '1',
	unfold = '2',
}

const Announcement: FC<AnnouncementParams> = ({ announcement, room }) => {
	const t = useTranslation();
	const saveAction = useEndpointActionExperimental('POST', 'v1/rooms.saveRoomSettings');
	const setModal = useSetModal();
	const closeFileModal = useMutableCallback(() => setModal());
	const getURL = useMediaUrl();
	// const [showFoldBtn, setShowFoldBtn] = useState(false);
	const [currentFoldIndex, setCurrentFoldIndex] = useState(-1);
	const { setRoomTopView, roomTopView } = useRoomContext();
	const elementRef = useRef(null);

	const genenateFormattedData = useCallback((date) => {
		const givenDate = moment(date);
		const offset = givenDate.utcOffset();
		const offsetHours = offset / 60;
		let utcOffsetString;
		if (offset === 0) {
			// 如果偏移量为0，则为UTC时间
			utcOffsetString = 'UTC';
		} else {
			// 否则，创建带有正确符号的偏移字符串
			const hours = Math.abs(offsetHours);
			const sign = offset > 0 ? '+' : '-';
			utcOffsetString = `UTC${sign}${hours}`;
		}

		return givenDate.utcOffset(offset).format(`YYYY/MM/DD HH:mm (${utcOffsetString})`);
	}, []);

	const handleAnnouncementData = () => {
		const datas = room.announcements || [];

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

	const handleRows = () => {
		const newRows = dataSource.map((item, index) => {
			let foldStatus = ItemFoldStatus.default;
			const divElement = document.getElementById(`announcement-row-${index}`);
			if (divElement) {
				// const isSingleLine = divElement.clientHeight <= 20;
				const isMultiLine = divElement.scrollWidth > divElement.clientWidth || divElement.clientHeight > 20 || /\r|\n/.test(item.message);
				// console.info('divElement', divElement.clientWidth, divElement.scrollWidth);
				// console.info('foldStatus', foldStatus);
				// console.info('找到single', index, isMultiLine, item.foldStatus, item.message);
				if (isMultiLine) {
					foldStatus = index === currentFoldIndex ? ItemFoldStatus.unfold : ItemFoldStatus.fold;
					// if (index === 0 && folded && rows[0] === ItemFoldStatus.unfold) {
					// 	return ItemFoldStatus.fold;
					// }
				}
			}

			return foldStatus;
		});
		setRows(newRows);
		// console.info('rows', newRows);
	};

	// let rows: ItemFoldStatus[] = [];
	// const rowsRef = useRef<ItemFoldStatus[]>([]);
	const [rows, setRows] = useState<ItemFoldStatus[]>([]);

	const [datas, setDatas] = useState<IRoomAnnouncement[]>([]);

	// useEffect(() => {
	// 	setDatas([]);
	// }, [room._id]);
	const [folded, setFolded] = useState(false);

	const handleData = () => {
		const datas = handleAnnouncementData();

		handleRows();
		return datas;
	};

	const [refreshCount, setRefreshCount] = useState(0);

	useEffect(() => {
		const dataSource = handleData();

		setDatas(folded ? dataSource.slice(0, 1) : dataSource);
		setRefreshCount(refreshCount + 1);
	}, [room.announcement, room.announcements, folded, currentFoldIndex]);

	useEffect(() => {
		const dataSource = handleData();
		// console.info('dataSource改变了', dataSource);

		setDatas(folded ? dataSource.slice(0, 1) : dataSource);
	}, [currentFoldIndex]);

	useEffect(() => {
		// const dataSource = handleData();
		handleRows();
		// console.info('dataSource又改变了', dataSource);

		setDatas(folded ? dataSource.slice(0, 1) : dataSource);
	}, [refreshCount]);

	const canEdit = usePermission('edit-team-channel', room._id);

	const handleFoldItem = (index: number) => {
		setCurrentFoldIndex(index === currentFoldIndex ? -1 : index);
	};

	// 更新窗口宽度的函数
	const handleResize = () => {
		// console.info('handleResize', window.innerWidth);
		handleRows();
	};

	// 使用防抖包装处理函数
	const debouncedHandleResize = debounce(handleResize, 250);

	// useEffect(() => {
	// 	// 添加窗口大小变化监听器
	// 	window.addEventListener('resize', debouncedHandleResize);

	// 	// 组件卸载时移除监听器
	// 	return () => {
	// 		window.removeEventListener('resize', debouncedHandleResize);
	// 	};
	// }, []); // 空依赖数组确保事件监听器只在挂载时添加一次

	useEffect(() => {
		const resizeObserver = new ResizeObserver((_) => {
			// console.info('resizeObserver');
			debouncedHandleResize();
		});

		const currentElement = elementRef.current;
		if (currentElement) {
			resizeObserver.observe(currentElement);
		}

		return () => {
			if (currentElement) {
				resizeObserver.unobserve(currentElement);
			}
		};
	}, [elementRef.current]);

	const handleDelete = (item: IRoomAnnouncement) => {
		const meeting = typeof item.announcementType === 'number' && item.announcementType === AnnouncementType.meeting;
		Modal.confirm({
			title: meeting ? t('Cancel_This_Meeting') : t('Announcement_Delete_Toast'),
			icon: <ExclamationCircleOutlined />,
			okText: t('Confirm'),
			cancelText: t('Cancel'),
			onOk: () => deleteAnnouncement(item._id),
		});
	};
	const deleteAnnouncement = async (_id: string) => {
		const roomAnnouncementData = {
			_id,
			type: 'delete',
		};

		await saveAction({
			rid: room.rid,
			roomAnnouncementData,
		});
	};

	const renderAnnouncementHeader = (announcement: IRoomAnnouncement, index: number) => {
		// meeting
		if (typeof announcement.announcementType === 'number' && announcement.announcementType === AnnouncementType.meeting) {
			return (
				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', fontSize: 16, color: '#1D2129' }}>
					<AnnouncementHeaderIcon />
					<span style={{ marginLeft: 5 }}>{announcement?.meetingRoomBookRecord?.subject || ''}</span>
				</div>
			);
		}

		// summary
		if (typeof announcement.announcementType === 'number' && announcement.announcementType === AnnouncementType.summary) {
			return (
				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', fontSize: 16, color: '#1D2129' }}>
					<SummaryHeaderIcon />
					<span style={{ marginLeft: 5 }}>{announcement?.meeting?.topic || ''}</span>
				</div>
			);
		}

		// normal
		const headerText = announcement.updateTime
			? t('Room_announcement_title_time', { username: announcement?.u?.name, time: genenateFormattedData(announcement.updateTime) })
			: t('Room_announcement_title_time1', { username: announcement?.u?.name });

		return (
			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', whiteSpace: 'pre-wrap' }}>
				<div className='antTitle3'>{`(${index + 1})  `}</div> {headerText}
			</div>
		);
	};

	const ref = useRef(false);

	const handleDeleteMeeting = (_id: string) => {
		Modal.confirm({
			title: t('Cancel_This_Meeting'),
			content: (
				<Checkbox defaultValue={ref.current} onChange={(e) => (ref.current = e.target.checked)}>
					{t('Cancel_Periodic_Meeting')}
				</Checkbox>
			),
			icon: <ExclamationCircleOutlined />,
			okText: t('Confirm'),
			cancelText: t('Cancel'),
			onOk: () => deleteMeeting(_id),
			onCancel: () => (ref.current = false),
		});
	};

	const cancelSingleMeetingApi = useEndpointActionExperimental('POST', 'v1/cancelPeriodicSingleMeeting');

	const deleteMeeting = async (_id: string) => {
		try {
			if (ref?.current) {
				await deleteAnnouncement(_id);
				message.success('取消周期会议成功');
			} else {
				await cancelSingleMeetingApi({ rid: room._id, announcementId: _id });
				message.success('取消单次会议成功');
			}
			ref.current = false;
		} catch (e) {
			message.error('取消会议失败');
		}
	};

	const renderEditAndDeleteIcon = (item: IRoomAnnouncement) => {
		if (!item) return null;

		if (
			typeof item.announcementType === 'number' &&
			item.announcementType === AnnouncementType.meeting &&
			item.meetingRoomBookRecord.periodic
		) {
			return (
				<Box style={{ width: '48px', display: 'flex', flexDirection: 'row' }}>
					<EditMeeting editMeeting={{ ...item.meetingRoomBookRecord, announcementId: item._id }} />
					<div style={{ marginLeft: 16, cursor: 'pointer' }} onClick={() => handleDeleteMeeting(item._id)}>
						<DeleteIcon />
					</div>
				</Box>
			);
		}
		return (
			<Box style={{ width: '48px', display: 'flex', flexDirection: 'row' }}>
				<div
					style={{ cursor: 'pointer' }}
					onClick={() => {
						if (
							// 编辑会议
							typeof item.announcementType === 'number' &&
							item.announcementType === AnnouncementType.meeting
						) {
							setModal(
								<CreateMeetingModal
									room={room}
									editMeeting={{ ...item.meetingRoomBookRecord, announcementId: item._id }}
									closeModal={() => setModal()}
								/>,
							);
							return;
						}
						if (
							// 编辑纪要
							typeof item.announcementType === 'number' &&
							item.announcementType === AnnouncementType.summary
						) {
							setModal(
								<CreateMeetingSummaryModal
									room={room}
									editSummary={{ ...item.meeting, announcementId: item._id }}
									closeModal={() => setModal()}
								/>,
							);
							return;
						}
						setModal(<Edit announcement={item} rid={room._id} onClose={closeFileModal} />);
					}}
				>
					<EditIcon />
				</div>
				<div style={{ marginLeft: 16, cursor: 'pointer' }} onClick={() => handleDelete(item)}>
					<DeleteIcon />
				</div>
			</Box>
		);
	};

	const dataSource = handleAnnouncementData();
	const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
	return dataSource.length > 0 ? (
		<AnnouncementComponent>
			<div className='antHeader' ref={elementRef}>
				<div className='antTitle1'>{t('Announcement')}</div>
				<div className='antRow' onClick={() => setRoomTopView(roomTopView === 'Announcement' ? '' : 'Announcement')}>
					<VerticalBarClose />
				</div>
			</div>
			<div style={{ flexDirection: 'column', display: 'flex', maxHeight: '70vh', overflowY: 'scroll' }}>
				{datas.map((item, index) => {
					const files = item.files || [];
					// console.info('index', `announcement-row-${index}`);
					// console.info('rows==========', rows[index]);
					return (
						<Box className='antItem' key={index}>
							<Box className='antItemLeft'>
								<Box display='flex' style={{ fontSize: '12px', color: '#555555' }}>
									{renderAnnouncementHeader(item, index)}
								</Box>
								<Box
									style={{
										fontSize: '14px',
										marginTop: '5px',
										textOverflow: 'ellipsis',
										overflowX: 'hidden',
										overflowY: 'scroll',
										whiteSpace: rows[index] !== ItemFoldStatus.unfold ? 'nowrap' : 'pre-wrap',
										wordBreak: 'break-word',
										maxHeight: '500px',
									}}
									dangerouslySetInnerHTML={{
										__html: DOMPurify.sanitize(item.message).replace(
											/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
											(text) => `<a target="_blank" rel="nofollow noopener noreferrer" href='${text}' style="color: #5297FF">${text}</a>`,
										),
									}}
									id={`announcement-row-${index}`}
								></Box>

								<Box display='flex' flexDirection='row' flexWrap='wrap' style={{ marginTop: '5px' }}>
									{files.length > 0
										? files.map((element) => (
												<Box key={element.fileUrl} display='flex' alignItems='center' style={{ cursor: 'pointer', marginRight: '10px' }}>
													<FileIcon fileName={element.fileName} fontSize={16} style={{ flexShrink: 0 }} />
													<Box
														color='#5297FF'
														onClick={() => {
															const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(element.fileName);
															if (isImage) {
																openImage(getURL(element.fileUrl));
															} else {
																window.location.href = getURL(element.fileUrl);
															}
														}}
														textAlign='left'
														margin='0 0 0 5px'
													>
														{element.fileName}
													</Box>
												</Box>
										  ))
										: null}
								</Box>
							</Box>
							<Box style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: 'auto', minWidth: '48px' }}>
								{canEdit ? renderEditAndDeleteIcon(item) : null}
								{rows[index] !== ItemFoldStatus.default ? (
									<div className='antRow1' onClick={() => handleFoldItem(index)}>
										<ArrowIcon
											fontSize='16px'
											style={{
												transform: `rotate(${rows[index] === ItemFoldStatus.fold ? 0 : 180}deg)`,
												transition: 'transform 0.5s ease',
											}}
										/>
										<div className='antTitle2'>{rows[index] === ItemFoldStatus.fold ? t('Announcement_Unfold') : t('fold')}</div>
									</div>
								) : null}
							</Box>
						</Box>
					);
				})}
			</div>
		</AnnouncementComponent>
	) : (
		<AnnouncementComponent>
			<div className='antHeader' ref={elementRef}>
				<div className='antTitle1'>{t('Announcement')}</div>
				<div className='antRow' onClick={() => setRoomTopView(roomTopView === 'Announcement' ? '' : 'Announcement')}>
					<VerticalBarClose />
				</div>
			</div>
			<div
				style={{
					flexDirection: 'column',
					display: 'flex',
					maxHeight: '70vh',
					overflowY: 'scroll',
					minHeight: '30px',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				{t('No_Announcement_Currently')}
			</div>
		</AnnouncementComponent>
	);
};

export default memo(Announcement);
