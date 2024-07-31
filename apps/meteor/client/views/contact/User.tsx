import type { IUser, IDepartment } from '@rocket.chat/core-typings';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useRoute, useSetModal, useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import type { CSSProperties } from 'react';
import React, { useCallback, useMemo } from 'react';

import { MaleIcon, FemaleIcon, EmailIcon, DepartmentIcon, JobNumberIcon, ResumeIcon } from '../../components/AppiaIcon';
import CreateTeam from '../../components/CreateTeam';
import { NewTeamIcon } from '../../components/SvgIcons';
import UserAvatar from '../../components/avatar/UserAvatar';
import { useEndpointData } from '../../hooks/useEndpointData';
import { useContactContext } from './ContactContext';
import OKR from './OKR';
import Resume from './Resume';
import { getDepartment, getRoles } from './useContact';

interface IUserProps {
	id: string;
	style?: CSSProperties;
	includeButton?: boolean;
	open?: () => void;
}

const User: React.FC<IUserProps> = ({ id, includeButton = true, style = {}, open }) => {
	const directRoute = useRoute('direct');
	const companyId = useSetting('Enterprise_ID') as string;
	const roleSortSetting = useSetting('Appia_Role_Sort_Settings') as string;
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());
	const t = useTranslation();
	const query = useMemo(() => ({ params: { userId: id } }), [id]);
	const { getDepartmentsByParentId, getUserById, getDepartmentNamesByUserId } = useContactContext();
	const isOuterUser = id.startsWith('none|');
	const summary = getUserById(id) || {};
	const { value = {} as { user: IUser } } = useEndpointData('v1/users.info', query);
	value.user = value.user || {};
	const { user } = value;
	const selfData = Meteor.user();
	const openDirectDm = useCallback(() => {
		if (user.username) {
			directRoute.push({
				rid: user.username,
			});
		}
	}, [user.username, directRoute]);

	const username = user.username || summary.username;
	const employeeStatus = user.employeeStatus || summary.employeeStatus;
	const employeeType = employeeStatus === '离职' ? '离职' : user.employeeType || summary.employeeType;
	const departments = getDepartmentNamesByUserId(id);
	const openResume = () => {
		if (user.resumeDownloadUrl) {
			setModal(<Resume user={user} onClose={closeModal} />);
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
	const positions = user.positions || {};
	return (
		<div className='contact-info-content' style={style}>
			<div className='contact-info-media-wrapper'>
				<div className='contact-info-user-avatar'>
					{username && (
						<>
							<UserAvatar size='x124' style={{ width: 65, height: 65 }} username={username} etag={user.avatarETag} />
							<div className={`contact-info-user-status contact-info-user-status-${user.status}`} />
						</>
					)}
				</div>
				<div className='contact-info-user'>
					<div className='contact-info-user-name-wrapper'>
						<div>{summary.name || user.name}</div>
						{user.sexId === 2 ? <FemaleIcon style={{ marginLeft: 10 }} /> : <MaleIcon style={{ marginLeft: 10 }} />}
					</div>
					<div className='contact-user-info-second-row'>
						{user.workPlaceName && <div className='contact-user-info-work-type'>{user.workPlaceName}</div>}
						<div className='contact-user-info-work-type'>{user.employeeID}</div>
					</div>
				</div>
				{selfData?._id !== user._id && user._id ? (
					<div
						className='contact-user-info-new-team'
						onClick={() => {
							setModal(<CreateTeam defaultUsers={[{ ...user, display: false }]} defaultType='team' onClose={closeModal} />);
						}}
					>
						<NewTeamIcon />
						<div className='contact-user-info-new-team-title'>{t('New_discussion')}</div>
					</div>
				) : null}
			</div>
			{Boolean(user.statusText) && <div className='contact-info-user-status-text'>“ {user.statusText} ”</div>}

			<div className='contact-info-user-info-wrapper'>
				<div className='contact-info-user-info' style={{ borderWidth: 0 }}>
					<div className='contact-info-user-info-icon'>
						<JobNumberIcon />
					</div>
					<div className='contact-info-user-info-label'>{t('EmployeePosition')}</div>
					<div className='contact-info-user-info-value'>
						{summary.jobName || user.jobName}
						{employeeType && <span className='contact-user-info-tag'>{employeeType}</span>}
					</div>
				</div>
				<div className='contact-info-user-info'>
					<div className='contact-info-user-info-icon'>
						<DepartmentIcon />
					</div>
					<div className='contact-info-user-info-label'>{t('Department')}</div>
					<div className='contact-info-user-info-value'>
						{departments.map((department) => (
							<div key={department}>{department}</div>
						))}
					</div>
				</div>
				<div className='contact-info-user-info'>
					<div className='contact-info-user-info-icon'>
						<EmailIcon />
					</div>
					<div className='contact-info-user-info-label'>{t('Email')}</div>
					<div className='contact-info-user-info-value'>{user.emails?.map((value) => value.address).join(',')}</div>
				</div>
				{user.canViewResume ? (
					<div className='contact-info-user-info'>
						<div className='contact-info-user-info-icon'>
							<ResumeIcon />
						</div>
						<div className='contact-info-user-info-label'>{t('User_Resume')}</div>
						<div className='contact-info-user-info-value'>
							{user.resumeDownloadUrl ? (
								<span onClick={openResume} className='anchor'>
									{t('View_User_Resume')}
								</span>
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
				{user.username && !open && <OKR username={user.username} />}
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
