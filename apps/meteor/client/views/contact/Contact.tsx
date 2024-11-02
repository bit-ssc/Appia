import { ApartmentOutlined } from '@ant-design/icons';
import { Box, Throbber } from '@rocket.chat/fuselage';
import { useUser, useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import React, { useCallback, useEffect, useState } from 'react';

import { useContactContext } from './ContactContext';
import ContactItem from './ContactItem';
import { useCurrentContext } from './CurrentContext';
import Department from './Department';
import Search from './Search';
import User from './User';
import { Button } from '../../components/AppiaUI';
import UserAvatar from '../../components/avatar/UserAvatar';
import { useLogoSquare } from '../../hooks/useAssets';
import { useEndpointData } from '../../hooks/useEndpointData';

const Contact: React.FC = () => {
	const { getDepartmentsByParentId, loading, root } = useContactContext();
	const { current, setCurrent } = useCurrentContext();
	const user = useUser();
	const t = useTranslation();
	const companyId = root?._id;
	const companyName = useSetting('Enterprise_Name') as string;
	const logoSquare = useLogoSquare();
	const [hasEditPermit, setHasEditPermit] = useState(false);
	const { value } = useEndpointData('v1/hrm/enter-permit-check');
	const onEditPermit = useCallback(() => {
		window.open('/appia_fe/organize', 'edit-organize');
	}, []);

	useEffect(() => {
		setHasEditPermit(value?.code === 1);
	}, [value]);

	if (!companyId) {
		return null;
	}

	const handleClick = (type: 'user' | 'department', value: string) => {
		if (value) {
			setCurrent({ type, value });
		}
	};

	const resetSelected = () => {
		setCurrent({ type: 'department', value: companyId });
	};

	const headBoard = {
		_id: `head_board,${companyId}`,
		name: 'Heads',
		children: [],
		managers: [],
		users: [],
		usersCount: 0,
		usersCountIncludeChildren: 1,
		countIncludeChildren: { all: 1 },
		parent: null,
		display: true,
	};

	return (
		<div className='contact-wrapper'>
			<div className='contact-sidebar sidebar'>
				<div className='contact-header'>
					{/* {t('Organization')} */}
					<Search onClick={handleClick} resetSelected={resetSelected} />
				</div>
				<div className='company-name-wrapper' onClick={() => handleClick('department', companyId)}>
					<Box is='img' w={48} h={48} src={logoSquare} />
					<div className='company-name'>{companyName}</div>
					{hasEditPermit ? (
						<Button icon={<ApartmentOutlined />} size='small' style={{ marginRight: 8 }} onClick={onEditPermit}>
							TKP组织管理
						</Button>
					) : null}
				</div>

				<div className='contact-content-wrapper'>
					<div className='contact-content'>
						{user && (
							<div
								key={user._id}
								className={`contact-content-item-content-user${
									current.type === 'user' && current.value === user.username ? ' contact-content-item-content-user-active' : ''
								}`}
								style={{ paddingLeft: 32 }}
								onClick={() => handleClick('user', user.username)}
							>
								<div className='contact-content-item-content-user-avatar'>
									{user.username && <UserAvatar size='x28' username={user.username} etag={user.avatarETag} />}
									<div className={`contact-content-item-content-user-status contact-content-item-content-user-status-${user.status}`} />
								</div>
								<div className='contact-content-item-content-user-name'>{t('Mine')}</div>
							</div>
						)}
						<ContactItem key={companyId} department={headBoard} />
						{getDepartmentsByParentId(companyId).map((department) => (
							<ContactItem key={department._id} department={department} />
						))}
					</div>

					{loading && (
						<div className='contact-content-loading'>
							<Throbber elevation='0' />
						</div>
					)}
				</div>
			</div>

			{Boolean(current.type === 'user' && current.value) && (
				<div className='contact-info-wrapper'>
					<div className='contact-info-content-wrapper'>
						<User id={current.value as string} />
					</div>
				</div>
			)}
			{Boolean(current.type === 'department' && current.value) && <Department id={current.value as string} />}
		</div>
	);
};

export default Contact;
