import type { IDepartment } from '@rocket.chat/core-typings';
import { Icon, ToggleSwitch } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useRoute, useSetModal, useSetting, useTranslation, useUserSubscription } from '@rocket.chat/ui-contexts';
import type { CSSProperties } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
	MaleIcon,
	FemaleIcon,
	EmailIcon,
	DepartmentIcon,
	JobNumberIcon,
	ResumeIcon,
	LeadersIcon,
	OKRIcon,
} from '../../components/AppiaIcon';
import CreateTeam from '../../components/CreateTeam';
import { NewTeamIcon } from '../../components/SvgIcons';
import { ReactiveUserStatus } from '../../components/UserStatus';
import UserAvatar from '../../components/avatar/UserAvatar';
import { useEndpointActionExperimental } from '../../hooks/useEndpointActionExperimental';
import { useContactContext } from './ContactContext';
import OKR from './OKR';
import POTA from './POTA';
import Resume from './Resume';
import { getDepartment, getRoles } from './useContact';
import useUser from './useUser';

interface IUserProps {
	id: string;
	rid?: string;
	from?: string;
	style?: CSSProperties;
	includeButton?: boolean;
	open?: () => void;
}

const MuteNotification: React.FC<{ rid: string }> = ({ rid }) => {
	const t = useTranslation();
	const saveSettings = useEndpointActionExperimental('POST', '/v1/rooms.saveNotification');
	const subscription = useUserSubscription(rid);
	const [state, setState] = useState(Boolean(subscription?.hideUnreadStatus));

	const muteNotificationContent = useMemo(
		() => <ToggleSwitch onChange={(e) => setState(e.target.checked)} checked={state} />,
		[state, setState],
	);

	useEffect(() => {
		saveSettings({
			roomId: rid,
			notifications: {
				disableNotifications: state ? '1' : '0',
				hideUnreadStatus: state ? '1' : '0',
			},
		});
	}, [state]);

	return (
		<div className='contact-info-user-info'>
			<div className='contact-info-user-info-icon'>
				<Icon style={{ marginRight: '2px' }} name='bell-off' size={18} color='#2878FF' />
			</div>
			<div className='contact-info-user-info-label'>{t('Mute_Notification')}</div>
			<div className='contact-info-user-info-value' style={{ textAlign: 'right', flex: 1 }}>
				{muteNotificationContent}
			</div>
		</div>
	);
};

// eslint-disable-next-line react/no-multi-comp
const MuteFavorite: React.FC<{ rid: string }> = ({ rid }) => {
	const t = useTranslation();
	const saveSettings = useEndpointActionExperimental('POST', '/v1/rooms.favorite');
	const subscription = useUserSubscription(rid);
	const [state, setState] = useState(Boolean(subscription?.f));

	const muteNotificationContent = useMemo(
		() => <ToggleSwitch onChange={(e) => setState(e.target.checked)} checked={state} />,
		[state, setState],
	);

	useEffect(() => {
		saveSettings({
			roomId: rid,
			favorite: state,
		});
	}, [state]);

	return (
		<div className='contact-info-user-info'>
			<div className='contact-info-user-info-icon'>
				<Icon style={{ marginRight: '2px' }} name='arrow-stack-up' size={18} color='#2878FF' />
			</div>
			<div className='contact-info-user-info-label'>{t('Favorite')}</div>
			<div className='contact-info-user-info-value' style={{ textAlign: 'right', flex: 1 }}>
				{muteNotificationContent}
			</div>
		</div>
	);
};

// eslint-disable-next-line complexity, react/no-multi-comp
const User: React.FC<IUserProps> = ({ id, includeButton = true, style = {}, open, rid, from }) => {
	const directRoute = useRoute('direct');
	const companyId = useSetting('Enterprise_ID') as string;
	const roleSortSetting = useSetting('Appia_Role_Sort_Settings') as string;
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());
	const t = useTranslation();
	const { getDepartmentsByParentId, getUserById, getDepartmentNamesByUserId } = useContactContext();
	const isOuterUser = id.startsWith('none|');
	const summary = getUserById(id) || {};
	const { user, loaded } = useUser(id);
	const selfData = Meteor.user();
	const openDirectDm = useCallback(() => {
		if (user?.username) {
			directRoute.push({
				rid: user?.username,
			});
		}
	}, [user?.username, directRoute]);

	const username = useMemo(() => user?.username || summary.username, [user?.username, summary.username]);
	const employeeStatus = useMemo(() => user?.employeeStatus || summary.employeeStatus, [user?.employeeStatus, summary.employeeStatus]);
	const employeeType = useMemo(
		() => (employeeStatus === '离职' ? '离职' : user?.employeeType || summary.employeeType),
		[employeeStatus, user?.employeeType, summary.employeeType],
	);

	function findDepartmentName(departments: string[]): string {
		// 默认输出值，如果找不到符合条件的字符串
		const defaultOutput: string = departments.length > 0 ? departments[0].split('/').pop() || '' : '';

		return defaultOutput;
	}

	const departments = getDepartmentNamesByUserId(id);
	const department = findDepartmentName(departments);

	const openResume = () => {
		if (user?.resumeDownloadUrl) {
			setModal(<Resume type='resume' user={user} onClose={closeModal} />);
		}
	};
	const openProfile = () => {
		if (user?.profileUrl) {
			setModal(<Resume type='profile' user={user} onClose={closeModal} />);
		}
	};

	const roleDeps = user?.importIds?.filter((id) => id.indexOf('OU=委员会') > -1);
	if (roleDeps && roleDeps.length > 0) {
		// EMT > AMT > PDT > 其他委员会
		// const sortKeys = ['EMT', 'AMT', 'PDT'].reverse();
		const depsSort = getDepartmentsByParentId(`${companyId},委员会`);
		const sortKeys = depsSort.map((dep: IDepartment) => dep._id.split(',')[2]).reverse();
		roleDeps.sort((a, b) => {
			const depA = getDepartment(a)[2];
			const depB = getDepartment(b)[2];
			return sortKeys.indexOf(depB) - sortKeys.indexOf(depA);
		});
	}
	const roleSort = roleSortSetting ? roleSortSetting.split(',').reverse() : [];
	const positions = user?.positions || {};
	return (
		<div className='contact-info-content' style={{ ...style, width: '100%' }}>
			<div className='contact-info-media-wrapper'>
				<div className='contact-info-user-avatar' style={{ width: 65, height: 65 }}>
					{username && loaded && (
						<>
							<UserAvatar size='x124' style={{ width: 65, height: 65 }} username={username} etag={user?.avatarETag} />
							<ReactiveUserStatus uid={user?._id} style={{ position: 'absolute', right: -1, bottom: 0 }} />
						</>
					)}
				</div>
				<div className='contact-info-user'>
					<div className='contact-info-user-name-wrapper'>
						<div>{summary.name || user?.name}</div>
						{user?.sexId === 2 ? <FemaleIcon style={{ marginLeft: 10 }} /> : <MaleIcon style={{ marginLeft: 10 }} />}
					</div>
					<div className='contact-user-info-second-row'>
						{user?.workPlaceName && <div className='contact-user-info-work-type'>{user?.workPlaceName}</div>}
						{/* <div className='contact-user-info-work-type'>{user?.employeeID || summary.employeeID}</div> */}
					</div>
				</div>
				{selfData?._id !== user?._id && user?._id ? (
					<div
						className='contact-user-info-new-team'
						onClick={() => {
							setModal(<CreateTeam defaultUsers={[{ ...user, display: false }]} defaultType='team' onClose={closeModal} />);
						}}
					>
						<NewTeamIcon fontSize={15} />
						<div className='contact-user-info-new-team-title'>{t('New_Discussion')}</div>
					</div>
				) : null}
			</div>
			{Boolean(user?.statusText) && <div className='contact-info-user-status-text'>“ {user?.statusText} ”</div>}

			<div className='contact-info-user-info-wrapper'>
				{from === 'chat' && rid ? (
					<>
						<MuteNotification rid={rid} />
						<MuteFavorite rid={rid} />
					</>
				) : null}
				<div className='contact-info-user-info'>
					<div className='contact-info-user-info-icon'>
						<JobNumberIcon />
					</div>
					<div className='contact-info-user-info-label'>{t('EmployeePosition')}</div>
					<div className='contact-info-user-info-value'>
						{summary.jobName || user?.jobName}
						{employeeType && <span className='contact-user-info-tag'>{employeeType}</span>}
					</div>
				</div>
				<div className='contact-info-user-info'>
					<div className='contact-info-user-info-icon'>
						<DepartmentIcon />
					</div>
					<div className='contact-info-user-info-label'>{t('Dept')}</div>
					<div className='contact-info-user-info-value'>{department}</div>
				</div>
				{/* {summary?.entryDate && (
					<div className='contact-info-user-info'>
						<div className='contact-info-user-info-icon'>
							<EntryDateIcon />
						</div>
						<div className='contact-info-user-info-label'>{t('Entry_Date')}</div>
						<div className='contact-info-user-info-value'>{summary.entryDate}</div>
					</div>
				)} */}
				{summary?.leaderNames?.length > 0 && (
					<div className='contact-info-user-info'>
						<div className='contact-info-user-info-icon'>
							<LeadersIcon />
						</div>
						<div className='contact-info-user-info-label'>{t('Leaders')}</div>
						<div className='contact-info-user-info-value'>{summary.leaderNames[0]}</div>
					</div>
				)}
				<div className='contact-info-user-info'>
					<div className='contact-info-user-info-icon'>
						<EmailIcon />
					</div>
					<div className='contact-info-user-info-label'>{t('Email')}</div>
					<div className='contact-info-user-info-value'>{user?.emails?.map((value) => value.address).join(',')}</div>
				</div>
				{user?.canViewResume ? (
					<div className='contact-info-user-info'>
						<div className='contact-info-user-info-icon'>
							<ResumeIcon />
						</div>
						<div className='contact-info-user-info-label'>{t('User_Resume')}</div>
						<div className='contact-info-user-info-value'>
							{user?.resumeDownloadUrl || user?.profileUrl ? (
								<>
									{user?.resumeDownloadUrl && (
										<>
											<span onClick={openResume} className='anchor'>
												{t('View_User_Resume')}
											</span>
											{` `}
										</>
									)}
									{user?.profileUrl && (
										<span onClick={openProfile} className='anchor'>
											{t('View_User_Profile')}
										</span>
									)}
								</>
							) : (
								`${t('No_User_Resume')}`
							)}
						</div>
					</div>
				) : null}
				{roleDeps && roleDeps.length > 0 && (
					<div className='contact-info-roles'>
						<div className='contact-info-roles-title'>{t('EmployeeRoles')}</div>
						{roleDeps.map((id) => (
							<div key={id} className='contact-info-roles-dep'>
								<div className='contact-info-role-list'>
									{(positions[id] || getRoles(id))
										?.sort((a, b) => roleSort.indexOf(b) - roleSort.indexOf(a))
										?.map((role) => (
											<span key={role} className='contact-info-role-item'>
												{role}
											</span>
										))}
								</div>
								<span className='contact-info-dep-text'>{getDepartment(id).slice(2).join('/')}</span>
							</div>
						))}
					</div>
				)}
				{/* {!!open && (
					<div className='see-full-profile'>
						<a onClick={open} className='see-full-profile-btn'>
							{t('See_full_profile')}
						</a>
					</div>
				)} */}
				{user?.username && !open && (
					<div className='contact-info-user-info'>
						<div className='contact-info-user-info-icon'>
							<OKRIcon />
						</div>
						<div className='contact-info-user-info-label'>POTA</div>
						<OKR
							username={user?.username}
							onShowOkr={(timeKey) => {
								setModal(<POTA user={{ name: summary.name || user?.name, username }} onClose={closeModal} timeKey={timeKey} />);
							}}
						/>
					</div>
				)}
				{!isOuterUser && includeButton && (
					<div onClick={openDirectDm} className='contact-info-user-btn'>
						{t('Direct_Message')}
					</div>
				)}
			</div>
		</div>
	);
};

export default User;
