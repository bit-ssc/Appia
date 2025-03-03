import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { IRoom, IPeriodicInfo, ISelectedUser, IMeeting, timeOption } from '@rocket.chat/core-typings';
import { Modal } from '@rocket.chat/fuselage';
import { useTranslation, useUser, useEndpoint } from '@rocket.chat/ui-contexts';
import dayjs from 'dayjs';
import moment from 'moment/moment';
import type { ReactElement } from 'react';
import React, { useState, useEffect, useMemo } from 'react';

import { DatePicker, Select, Switch, Input, InputNumber, message, Button, Tooltip } from '../../../../../components/AppiaUI';
import { useRecordList } from '../../../../../hooks/lists/useRecordList';
import { useEndpointActionExperimental } from '../../../../../hooks/useEndpointActionExperimental';
import type { IUserOption, IRepeatOption } from './SelectOptions';
import {
	endDayOptions,
	getRepeatOptions,
	repeatMap,
	getFrequencyCountOption,
	frequencyCycleOptions,
	filterUserOptions,
	getStartOptions,
	getEndOptions,
	defaultTimeOption,
	durationOptions,
} from './SelectOptions';
import { calculateDuration, calculateEndTime, getTimestamp, getUTCOffset } from './TimeUtils';
import RoomItemView from './component/RoomItemView';
import { useMembersList } from './hook/useMembersList';
import { useEditPeriodicInfo } from './hook/useEditPeriodicInfo';
import { appiaCreateMeetingModalStyle } from './styles';
import type { IRoomInfo } from './types';

import { ArrowIcon } from '/client/components/AppiaIcon';

type ICreateMeetingModal = {
	room?: IRoom;
	editMeeting?: IMeeting;
	closeModal: () => void;
	all?: boolean;
};

const endDayMap: Record<string, string> = {
	TO_DATE: '某天',
	COUNT: '限定会议次数',
};

type UserRecord = Record<string, ISelectedUser>;

const CreateMeetingModal = ({ room, editMeeting, closeModal, all = false }: ICreateMeetingModal): ReactElement => {
	const rid = room?._id;
	const t = useTranslation();
	const loginUser = useUser();
	const [meeting, setMeeting] = useState<IMeeting>();
	const [repeatOptions, setRepeatOptions] = useState<IRepeatOption[]>();
	const [periodicItem, setPeriodicItem] = useState<IRepeatOption>({ label: '不重复 ', value: '0' });
	const [startDay, setStartDay] = useState<string>(getTimestamp(editMeeting?.startTime ?? new Date().toDateString()).ymd);
	const [endDay, setEndDay] = useState<string>(getTimestamp(editMeeting?.periodicInfo?.periodicEndDate ?? new Date().toDateString()).ymd);
	const frequencyCountOptions = getFrequencyCountOption();
	const [userOptions, setUserOptions] = useState<IUserOption[]>([]);
	const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);
	const [startTimeOptions, setStartTimeOptions] = useState<timeOption[]>([]);
	const [endTimeOptions, setEndTimeOptions] = useState<timeOption[]>([]);
	const [startTime, setStartTime] = useState<timeOption>(
		editMeeting?.startTime ? { label: getTimestamp(editMeeting.startTime).hm, value: -1 } : defaultTimeOption,
	);
	const [endTime, setEndTime] = useState<timeOption>(
		editMeeting?.endTime ? { label: getTimestamp(editMeeting.endTime).hm, value: -1 } : defaultTimeOption,
	);
	const [periodicInfo, setPeriodicInfo] = useState<IPeriodicInfo>();
	const [limit, setLimit] = useState<boolean>(false);
	const [userMap, setUserMap] = useState<UserRecord>({});
	const [showAllMessage, setShowAllMessage] = useState(false);
	const [duration, setDuration] = useState('15分钟');

	const bookMeetingApi = useEndpoint('POST', 'v1/meetingRoomBook');
	const updateMeetingApi = useEndpoint('POST', 'v1/meetingRoomBookRecordUpdate');
	const updateSingleMeeting = useEndpointActionExperimental('POST', 'v1/editPeriodicSingleMeeting');
	const singleEdit = editMeeting?.periodic && !all;

	const [loading, setLoading] = useState<boolean>(false);

	const editPeriodicInfo = useEditPeriodicInfo(editMeeting);
	// 编辑周期会议初始化的时候应显示自定义周期
	const [initShowPer, setInitShowPer] = useState<boolean>(Boolean(editMeeting?.periodicInfo));

	const changeRoomAndTime = (roomInfo: IRoomInfo) => {
		roomInfo.startTime && setStartTime(roomInfo.startTime);
		roomInfo.endTime && setEndTime(roomInfo.endTime);
		getDuration(roomInfo.startTime?.label, roomInfo.endTime?.label);

		setMeeting({
			...meeting,
			extraMeetingRoom: roomInfo?.extraMeetingRoom,
			roomId: roomInfo?.roomId,
			meetingRoomName: roomInfo?.meetingRoomName,
		});
	};

	const getDuration = (startOptionTime?: string, endOptionTime?: string) => {
		const temp = calculateDuration(startOptionTime, endOptionTime);
		temp && setDuration(temp);
	};

	const changeEndTimeForDuration = (durationValue: number) => {
		const endTimeLabel = calculateEndTime(startTime.label, durationValue);
		endTimeLabel && setEndTime({ label: endTimeLabel, value: -1 });
	};

	// 获取房间成员，默认邀请所有人参会
	const { membersList } = useMembersList(
		// @ts-ignore
		useMemo(() => ({ rid, type: 'all', roomType: room?.t, limit: 5000 }), [room?._id, room?.t]),
	);
	const { items } = useRecordList(membersList);

	useEffect(() => {
		const temp = getStartOptions(startDay);
		setStartTimeOptions(getStartOptions(startDay));
		if (!editMeeting?.startTime) {
			setStartTime(temp[0]);
		}
	}, [startDay]);

	useEffect(() => {
		const temp = getEndOptions(startTimeOptions, startTime?.value);
		setEndTimeOptions(temp);
		if (!endTime || endTime.label <= startTime.label) {
			setEndTime(temp[0]);
		}
	}, [startTimeOptions, startTime]);

	useEffect(() => {
		const options = [];
		const usernames = [];
		const users: UserRecord = {};
		const timezone = getUTCOffset();

		// 初始化参会人员
		if (items && items.length > 0) {
			for (const user of items) {
				options.push({ label: user.name, value: user.username });
				usernames.push(user.username);
				users[user.username] = user;
			}
			// @ts-ignore
			setUserOptions(options);
			setUserMap(users);
		}
		if (editMeeting) {
			setMeeting({
				id: editMeeting.id,
				subject: editMeeting.subject,
				desc: editMeeting.desc,
				meetingMaterials: editMeeting.meetingMaterials,
				meetCode: editMeeting.meetCode,
				meetUrl: editMeeting.meetUrl,
				endTime: editMeeting.endTime,
				startTime: editMeeting.startTime,
				extraMeetingRoom: editMeeting.extraMeetingRoom,
				periodic: editMeeting.periodic,
				periodicInfo: editMeeting.periodicInfo,
				roomId: editMeeting.roomId,
				meetingRoomName: editMeeting.meetingRoomName,
				meetingId: editMeeting.meetingId,
				// todo 有待商榷，编辑理论上默认不能创建会议
				createTxMeeting: false,
				periodicId: editMeeting.periodicId,
				announcementId: editMeeting.announcementId,
				rid,
				enableNotification: true,
				mediaSetType: editMeeting.mediaSetType,
				timezone,
			} as unknown as IMeeting);
			setStartDay(getTimestamp(editMeeting.startTime).ymd);
			// @ts-ignore
			setSelectedUsernames(editMeeting?.users?.map((u) => u.username));
			const start = getTimestamp(editMeeting?.startTime);
			const end = getTimestamp(editMeeting?.endTime);
			setStartDay(start.ymd);
			setStartTime({ label: start.hm, value: -1 });
			setEndTime({ label: end.hm, value: -1 });
			getDuration(start.hm, end.hm);
			if (editMeeting?.periodic) {
				setEndDay(getTimestamp(editMeeting?.endTime).ymd);
			}

			setPeriodicInfo({ ...editMeeting.periodicInfo });

			setLimit(editMeeting?.periodicInfo?.periodicCountType === 'COUNT');
		} else {
			setSelectedUsernames(rid ? usernames : [loginUser.username]);
			setPeriodicInfo({ ...periodicInfo, periodicCountType: 'TO_DATE' });
			setMeeting({
				...meeting,
				createTxMeeting: true,
				periodic: false,
				enableNotification: true,
				mediaSetType: 0, // 默认关闭专网会议设置, 0 公网会议 1 专网会议
				rid,
				timezone,
			});
		}
	}, [editMeeting, items, loginUser]);

	useEffect(() => {
		if (startDay) {
			setRepeatOptions(getRepeatOptions(startDay, Boolean(editMeeting)));
		}
	}, [startDay, editMeeting]);

	const createOrUpdateMeeting = async () => {
		setLoading(true);
		// todo 请求创建会议
		const start = `${startDay} ${startTime.label}:00`;
		const end = `${startDay} ${endTime.label}:00`;
		if (new Date() > new Date(start)) {
			setLoading(false);
			message.error('会议开始时间不能小于当前时间');
			return;
		}
		if (end < start) {
			setLoading(false);
			message.error('会议结束时间不能小于会议开始时间');
			return;
		}
		if (!meeting?.createTxMeeting && (!meeting?.meetUrl || !meeting?.meetCode)) {
			setLoading(false);
			message.error('不自动创建会议需要填写会议号和会议链接');
			return;
		}
		let bookMeeting: IMeeting = {
			...meeting,
			startTime: start,
			endTime: end,
			users: selectedUsernames?.map((username) => userMap[username])?.filter((user) => user),
			meetCode: meeting.createTxMeeting ? '' : meeting.meetCode,
			meetUrl: meeting.createTxMeeting ? '' : meeting.meetUrl,
			// @ts-ignore
			subject: meeting.subject ?? `${loginUser?.name}的会议`,
		};
		if (meeting?.periodic) {
			// @ts-ignore
			if (!limit && periodicInfo.periodicEndDate < end) {
				setLoading(false);
				message.error('周期会议结束时间不能小于当前时间');
				return;
			}
			bookMeeting = { ...bookMeeting, periodicInfo: periodicInfo as unknown as IPeriodicInfo };
		}
		console.log('dxd========bookeemeeeeting', bookMeeting);
		try {
			if (editMeeting) {
				bookMeeting.tencentMeetingId = editMeeting?.tencentMeetingId;
				if (all) {
					// 更新整个周期会议
					await updateMeetingApi(bookMeeting).then((res) => {
						if (res.success) {
							// 成功
							closeModal?.();
							message.success(t('Update_Meeting_Success'));
						}
						setLoading(false);
					});
				} else {
					if (bookMeeting.periodic) {
						// 更新周期单次会议
						await updateSingleMeeting(bookMeeting).then((res) => {
							if (res.success) {
								// 成功
								closeModal?.();
							}
							message.success(t('Update_Meeting_Success'));
							setLoading(false);
						});
						return;
					}

					// 更新普通会议
					await updateMeetingApi(bookMeeting).then((res) => {
						if (res.success) {
							// 成功
							closeModal?.();
							message.success(t('Update_Meeting_Success'));
						}
						setLoading(false);
					});
				}
			} else {
				// 预定会议
				await bookMeetingApi(bookMeeting).then((res) => {
					if (res.success) {
						// 成功
						closeModal?.();
						message.success(t('Create_Meeting_Success'));
					}
					setLoading(false);
				});
			}
		} catch (e) {
			console.error(e);
			message.error(e?.message ?? t(editMeeting ? 'Update_Meeting_Fail' : 'Create_Meeting_Fail'));
			setLoading(false);
		}
	};

	const renderPeriodic = () => {
		// 不重复并且编辑会议时也不是周期会议
		if ((!periodicItem || periodicItem.value === '0') && !editMeeting?.periodic) return null;

		const renderFrequence = () => (
			<div className='create-meeting-item'>
				<span className='create-meeting-label'>{t('Frequency')}:</span>
				<Select
					disabled={singleEdit}
					style={{ marginRight: 20, width: 200 }}
					defaultValue={editMeeting?.periodicInfo ? editPeriodicInfo?.editPeriodicInterval : 2}
					options={frequencyCountOptions}
					getPopupContainer={(trigger) => trigger.parentNode}
					onChange={(value) => {
						setPeriodicInfo({ ...periodicInfo, periodicInterval: value });
					}}
				/>
				<Select
					disabled={singleEdit}
					defaultValue={editMeeting?.periodicInfo ? editPeriodicInfo?.editPeriodicUnit : 'DAILY'}
					style={{ width: 200 }}
					options={frequencyCycleOptions}
					getPopupContainer={(trigger) => trigger.parentNode}
					onChange={(value) => setPeriodicInfo({ ...periodicInfo, periodicUnit: value })}
				/>
			</div>
		);

		const renderEndTime = () => (
			<div className='create-meeting-item'>
				<span className='create-meeting-label'>{t('Ends_At')}:</span>
				<Select
					style={{ marginRight: 20, width: 200 }}
					defaultValue={editMeeting?.periodicInfo ? editPeriodicInfo?.editPeriodicCountType : 'TO_DATE'}
					options={endDayOptions}
					getPopupContainer={(trigger) => trigger.parentNode}
					onChange={(value) => {
						setLimit(value === 'COUNT');
						setPeriodicInfo({ ...periodicInfo, periodicCountType: value, periodicCount: 7 });
					}}
					disabled={singleEdit}
				/>
				{limit ? (
					<InputNumber
						disabled={singleEdit}
						defaultValue={editPeriodicInfo?.editPeriodicCount || 7}
						onChange={(value) => {
							setPeriodicInfo({ ...periodicInfo, periodicCount: value as number });
						}}
					/>
				) : (
					<DatePicker
						disabled={singleEdit}
						defaultValue={editMeeting?.periodicInfo ? dayjs(editMeeting?.periodicInfo?.periodicEndDate) : dayjs()}
						disabledDate={(current) => current && current < moment().startOf('day')}
						onChange={(_, dateString) => {
							// @ts-ignore
							setEndDay(dateString);
							setPeriodicInfo({ ...periodicInfo, periodicCountType: 'TO_DATE', periodicEndDate: `${dateString} 24:00:00` });
						}}
						allowClear={false}
						// @ts-ignore
						getPopupContainer={(trigger) => trigger.parentNode}
					/>
				)}
			</div>
		);

		console.log('dxd========initShowPer', initShowPer, editMeeting?.periodicInfo);
		// 非自定义重复
		if ((periodicItem.value > '0' && periodicItem.value < '6') && !initShowPer) {
			return renderEndTime();
		}

		// 自定义重复
		return (
			<>
				{renderFrequence()}
				{renderEndTime()}
			</>
		);
	};

	const renderMeetingCodeAndUrl = () => {
		if (meeting?.createTxMeeting) return null;

		return (
			<>
				<div className='create-meeting-items'>
					<span className='create-meeting-label' style={{ marginTop: 5 }}>
						{t('Meeting_Code')}:
					</span>
					<div className='create-meeting-value-container'>
						<Input
							disabled={singleEdit}
							defaultValue={editMeeting?.meetCode}
							placeholder={t('Code_Placeholder')}
							onChange={(e) => setMeeting({ ...meeting, meetCode: e.target.value })}
						/>
						<div className='create-meeting-value-tips'>{t('Code_Tips')}</div>
					</div>
				</div>
				<div className='create-meeting-items'>
					<span className='create-meeting-label' style={{ marginTop: 5 }}>
						{t('Meeting_Url')}:
					</span>
					<div className='create-meeting-value-container'>
						<Input
							disabled={singleEdit}
							defaultValue={editMeeting?.meetUrl}
							placeholder={t('Url_Placeholder')}
							onChange={(e) => setMeeting({ ...meeting, meetUrl: e.target.value })}
						/>
						<div className='create-meeting-value-tips'>{t('Url_Tips')}</div>
					</div>
				</div>
			</>
		);
	};

	// @ts-ignore
	return (
		<Modal className={appiaCreateMeetingModalStyle}>
			<Modal.Header>
				<Modal.Title>{t('Book_Meeting')}</Modal.Title>
			</Modal.Header>
			<Modal.Content className='modal-content'>
				<div className='modal-content-style'>
					{showAllMessage ? (
						<div className='create-meeting-item'>
							<span className='create-meeting-label'>{t('Meeting_Subject')}:</span>
							<Input
								disabled={singleEdit}
								defaultValue={editMeeting?.subject}
								placeholder={t('Subject_Placeholder')}
								onChange={(e) => setMeeting({ ...meeting, subject: e.target.value })}
							/>
						</div>
					) : null}
					<div className='create-meeting-item'>
						<span className='create-meeting-label'>{t('Attendances')}:</span>
						<Select
							disabled={singleEdit}
							mode={'multiple'}
							allowClear
							options={userOptions}
							dropdownStyle={{ maxHeight: 200, overflowY: 'auto' }}
							style={{ width: '100%' }}
							onChange={(value) => {
								setSelectedUsernames(value);
							}}
							filterOption={(inputValue, option) => filterUserOptions(inputValue, option)}
							value={selectedUsernames}
							getPopupContainer={(trigger) => trigger.parentNode}
						/>
					</div>
					<div className='create-meeting-item'>
						<span className='create-meeting-label'>{t('Meeting_Time')}:</span>
						<DatePicker
							defaultValue={editMeeting ? dayjs(startDay) : dayjs()}
							style={{ marginRight: 20 }}
							disabledDate={(current) => current && current < moment().startOf('day')}
							onChange={(_, dateString) => {
								// @ts-ignore
								setStartDay(dateString);
							}}
							allowClear={false}
							// @ts-ignore
							getPopupContainer={(trigger) => trigger.parentNode}
						/>
						<Select
							style={{ marginRight: 20 }}
							options={startTimeOptions}
							value={startTime?.label}
							onChange={(_, option) => {
								setStartTime(option as unknown as timeOption);
								if (option.value >= endTime.value) {
									setDuration('15分钟');
								} else {
									getDuration(option.label, endTime.label);
								}
							}}
							getPopupContainer={(trigger) => trigger.parentNode}
						/>
						<Select
							options={endTimeOptions}
							value={endTime?.label}
							onChange={(_, option) => {
								setEndTime(option as unknown as timeOption);
								getDuration(startTime.label, option.label);
							}}
							getPopupContainer={(trigger) => trigger.parentNode}
						/>
						<div style={{ marginLeft: 20 }}>{getUTCOffset()}</div>
					</div>
					<div className='create-meeting-item'>
						<span className='create-meeting-label'>{t('Meeting_Duration')}:</span>
						<Select
							disabled={singleEdit}
							mode={'combobox'}
							options={durationOptions}
							style={{ width: '100%' }}
							value={duration}
							onChange={(_, option) => {
								setDuration(option.label);
								changeEndTimeForDuration(option.value);
							}}
							getPopupContainer={(trigger) => trigger.parentNode}
						/>
					</div>
					{showAllMessage ? (
						<>
							<div className='create-meeting-item'>
								<span className='create-meeting-label'>{t('Meeting_Room')}:</span>
								<RoomItemView dayTime={startDay} editMeeting={editMeeting} changeRoomAndTime={changeRoomAndTime} />
							</div>
							{(!editMeeting || editMeeting.periodic) && (
								<>
									<div className='create-meeting-item'>
										<span className='create-meeting-label'>{t('Periodic')}:</span>
										<Select
											disabled={singleEdit}
											size={'middle'}
											// todo 这部分逻辑应该需要更改
											defaultValue={editMeeting?.periodic ? editPeriodicInfo?.editPeriodicTypeInterval : '不重复'}
											onChange={(value, option) => {
												// @ts-ignore
												setPeriodicItem(option);
												setMeeting({ ...meeting, periodic: value !== '0' });
												const end = `${endDay} 23:00:00`;
												// 选择周期会议方式
												if (value > '0' && value < '6') {
													// @ts-ignore
													setPeriodicInfo({
														...periodicInfo,
														periodicUnit: option.unit,
														periodicInterval: option.interval,
														periodicEndDate: end,
													});
													setInitShowPer(false);
												}
												// 自定义周期会议方式
												if (value === '6') {
													// 默认重复方式
													// @ts-ignore
													setPeriodicInfo({ ...periodicInfo, periodicUnit: 'DAILY', periodicInterval: 2, periodicEndDate: end });
												}
											}}
											style={{
												width: 200,
											}}
											options={repeatOptions}
											getPopupContainer={(trigger) => trigger.parentNode}
										/>
									</div>
									{renderPeriodic()}
								</>
							)}
							<div className='create-meeting-item'>
								<div className='create-meeting-row'>
									<span className='create-meeting-label'>{t('Auto_Create_Meeting_Online')}:</span>
									<Switch
										disabled={singleEdit}
										checked={meeting?.createTxMeeting}
										defaultChecked={meeting?.createTxMeeting}
										onClick={() => setMeeting({ ...meeting, createTxMeeting: !meeting?.createTxMeeting })}
									/>
								</div>
								<div className='create-meeting-row'>
									<span className='create-meeting-label'>{t('Send_Meeting_Notification')}:</span>
									<Switch
										disabled={singleEdit}
										checked={meeting?.enableNotification}
										defaultChecked={meeting?.enableNotification}
										onClick={() => setMeeting({ ...meeting, enableNotification: !meeting?.enableNotification })}
									/>
								</div>
								<div className='create-meeting-row private-meet-container'>
									<span className='create-meeting-label'>
										<Tooltip
											zIndex={10001}
											title={
												<>
													{t('Meeting_Participants_Less_Than_50')}
													<br />
													<ol style={{ listStyleType: 'decimal', paddingLeft: '1em' }}>
														<li>{t('AMT_EMT_PMT_Periodic_Meeting')}</li>
														<li>{t('Meeting_Content_Confidential')}</li>
													</ol>
												</>
											}
										>
											<div className='icon-container'>
												<ExclamationCircleOutlined />
											</div>
										</Tooltip>
										{t('Private_Network_Meeting')}:
									</span>
									<Switch
										disabled={singleEdit}
										checked={!!meeting?.mediaSetType}
										defaultChecked={!!meeting?.mediaSetType}
										onClick={() => setMeeting({ ...meeting, mediaSetType: meeting?.mediaSetType === 1 ? 0 : 1 })}
									/>
								</div>
							</div>
							{renderMeetingCodeAndUrl()}
							{/**
					 <div className='create-meeting-item'>
					<span className='create-meeting-label'>项目总览表</span>
					<Input onChange={(e) => changeMeetingValue({ key: 'code', value: e.target.value })} />
				</div>
							 */}
							<div className='create-meeting-item'>
								<span className='create-meeting-label'>{t('Meeting_Materials')}:</span>
								<Input
									disabled={singleEdit}
									defaultValue={editMeeting?.meetingMaterials}
									placeholder={t('Materials_Placeholder')}
									onChange={(e) => setMeeting({ ...meeting, meetingMaterials: e.target.value })}
								/>
							</div>
							<div className='create-meeting-item'>
								<span className='create-meeting-label'>{t('Meeting_Description')}:</span>
								<Input
									disabled={singleEdit}
									defaultValue={editMeeting?.desc}
									placeholder={t('Des_Placeholder')}
									onChange={(e) => setMeeting({ ...meeting, desc: e.target.value })}
								/>
							</div>
						</>
					) : null}
				</div>
				<div className='create-meeting-fold'>
					<span onClick={() => setShowAllMessage((prevState) => !prevState)} style={{ cursor: 'pointer' }}>
						{showAllMessage ? t('fold') : t('Meeting_Edit_More')}
					</span>
					<ArrowIcon
						fontSize='16px'
						style={{
							transform: `rotate(${showAllMessage ? 180 : 0}deg)`,
							transition: 'transform 0.5s ease',
						}}
					/>
				</div>
				<div className='create-meeting-button-container'>
					<Button onClick={closeModal}>{t('Cancel')}</Button>
					<Button style={{ marginLeft: 20 }} type='primary' loading={loading} onClick={createOrUpdateMeeting}>
						{t('Confirm')}
					</Button>
				</div>
			</Modal.Content>
		</Modal>
	);
};

export default CreateMeetingModal;
