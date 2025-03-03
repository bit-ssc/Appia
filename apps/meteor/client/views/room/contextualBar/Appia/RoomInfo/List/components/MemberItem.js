import { Option, OptionContent, ActionButton, Icon } from '@rocket.chat/fuselage';
import { usePrefersReducedMotion } from '@rocket.chat/fuselage-hooks';
import { useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import React, { useState, useMemo } from 'react';

import { FederationIcon } from '../../../../../../../components/AppiaIcon';
import { Tag, Tooltip } from '../../../../../../../components/AppiaUI';
import companyKV from '../../../../../../../components/Contacts/companyKV';
import { RPIcon } from '../../../../../../../components/SvgIcons';
import { ReactiveUserStatus } from '../../../../../../../components/UserStatus';
import UserAvatar from '../../../../../../../components/avatar/UserAvatar';
import { usePreventPropagation } from '../../../../../../../hooks/usePreventPropagation';
import UserActions from './UserActions';

const optimizedUserTypeMap = {
	L3D_OFFICIAL_CADRE: 'L3D',
	L3D_DEPUTY_CADRE: 'L3D',
	PMT_OFFICIAL_CADRE: 'PMT',
	PMT_DEPUTY_CADRE: 'PMT',
	PMT_SPONSOR: 'PMT',
	L1D_SPONSOR: 'L1D',
	L1D_OFFICIAL_CADRE: 'L1D',
	L1D_DEPUTY_CADRE: 'L1D',
	PDT_MANAGER: 'L1D',
	L1D_STAFF: 'L1D',
	CURRENT: 'L1D',
};

// 定义优先级顺序
const priorityOrder = ['L3D', 'PMT', 'L1D'];

export const MemberItem = ({
	_id,
	status,
	name,
	username,
	onClickView,
	style,
	rid,
	reload,
	roles,
	isTeam,
	federated,
	jobName,
	userType,
}) => {
	const [showButton, setShowButton] = useState();
	const t = useTranslation();

	const isReduceMotionEnabled = usePrefersReducedMotion();
	const handleMenuEvent = {
		[isReduceMotionEnabled ? 'onMouseEnter' : 'onTransitionEnd']: setShowButton,
	};

	const emtUsernames = (useSetting('Appia_EMT_Settings') || '').split(',').filter(Boolean);

	const onClick = usePreventPropagation();
	const roleMap = {};
	roles?.forEach((role) => {
		roleMap[role] = 1;
	});
	let content = null;
	if (isTeam && roleMap.owner) {
		content = (
			<>
				<RPIcon fontSize={12} style={{ marginBottom: -1 }} /> {t('role_name_owner1')}
			</>
		);
	} else if (roleMap.owner) {
		content = (
			<>
				<RPIcon fontSize={12} style={{ marginTop: -1 }} /> {t('role_name_owner2')}
			</>
		);
	} else if (isTeam && roleMap.moderator) {
		content = (
			<>
				<Icon name='shield-alt' size='x16' style={{ marginTop: -2 }}></Icon> {t('role_name_moderator1')}
			</>
		);
	} else if (roleMap.moderator) {
		content = (
			<>
				<Icon name='shield-alt' size='x16' style={{ marginTop: -2 }}></Icon> {t('role_name_moderator2')}
			</>
		);
	}

	/* 	let pdt = null;
	if (roleMap.pdt) {
		pdt = (
			<Tag style={{ border: 0, background: '#F2F3F5' }}>
				<Icon name='shield-alt' size='x16' style={{ marginTop: -2 }}></Icon> {t('role_name_pdt')}
			</Tag>
		);
	} */

	const getOrgTooltip = () => companyKV[_id]?.name;

	// 查找最高优先级的标签
	function findHighestPriorityLabel(userTypes) {
		let highestPriorityLabel = null;
		let highestPriorityIndex = priorityOrder.length; // 设置为最低的可能优先级

		userTypes.forEach((type) => {
			const label = optimizedUserTypeMap[type];
			if (label) {
				const currentIndex = priorityOrder.indexOf(label);
				if (currentIndex !== -1 && currentIndex < highestPriorityIndex) {
					highestPriorityLabel = label;
					highestPriorityIndex = currentIndex;
				}
			}
		});

		return highestPriorityLabel || 'L1D';
	}
	const getRank = () => {
		if (username === 'micree.zhan') {
			return 'EMT';
		}

		const isEMT = emtUsernames.includes(username);
		if (isEMT) {
			return 'EMT';
		}

		if (userType) {
			return findHighestPriorityLabel(userType);
		}

		return federated ? '' : 'L1D';
	};

	const userJobTag = useMemo(() => getRank() || jobName, [_id]);

	// 根据jobTag动态修改tag样式
	const jobTagStyle = {
		EMT: { fontColor: '#3C26BA', background: '#DFDBF5B2' },
		L3D: { fontColor: '#3D8A69', background: '#CDF7E5' },
		PMT: { fontColor: '#1B5BFF', background: '#CCE6FF' },
		L1D: { fontColor: '#384D7C', background: '#DBDFE8' },
	};

	return (
		<Option
			id={_id}
			style={{ padding: '6px 12px' }}
			data-username={username}
			presence={status}
			onClick={!federated ? onClickView : undefined}
			{...handleMenuEvent}
		>
			<Option.Avatar>
				<div style={{ display: 'flex', alignItems: 'end' }}>
					<UserAvatar username={username} size='x28'></UserAvatar>
					<ReactiveUserStatus uid={_id} />
				</div>
			</Option.Avatar>
			<OptionContent>
				<div style={{ display: 'flex', flexDirection: 'row' }}>
					<div style={{ minWidth: '56px', fontSize: '14px', lineHeight: '22px', fontWeight: '400' }}>{name}</div>
					{userJobTag ? (
						<Tooltip title={jobName}>
							<Tag
								style={{
									border: 0,
									background: jobTagStyle[userJobTag].background || '#F2F3F5',
									marginLeft: 10,
									color: jobTagStyle[userJobTag].fontColor || '#4E5969',
								}}
							>
								{userJobTag}
							</Tag>
						</Tooltip>
					) : null}{' '}
					{content ? <Tag style={{ border: 0, background: '#F2F3F5', marginLeft: 10, color: '#4E5969' }}>{content}</Tag> : null}
					{federated ? (
						<Tooltip title={getOrgTooltip() || ''}>
							<span style={{ verticalAlign: '-.125em', lineHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
								<FederationIcon />
							</span>
						</Tooltip>
					) : null}
				</div>
			</OptionContent>
			<Option.Menu onClick={onClick}>
				{showButton ? (
					<UserActions name={name} roleMap={roleMap} username={username} rid={rid} _id={_id} reload={reload} federated={federated} />
				) : (
					<ActionButton ghost tiny icon='kebab' />
				)}
			</Option.Menu>
		</Option>
	);
};

MemberItem.Skeleton = Option.Skeleton;
