import { useEndpoint, useRoute, useTranslation } from '@rocket.chat/ui-contexts';
import React, { useCallback } from 'react';

import UserAvatar from '../../components/avatar/UserAvatar';
import { appLayout } from '../../lib/appLayout';

interface IFederatedUserProps {
	name: string;
	username: string;
}

// eslint-disable-next-line complexity, react/no-multi-comp
const FederatedUser: React.FC<IFederatedUserProps> = (user) => {
	const t = useTranslation();
	console.info('setCurrent========', user);
	const getOpenDirectRoom = useEndpoint('POST', '/v1/appia/openDirectRoom');
	const groupRoute = useRoute('group');

	const openDirectDm = useCallback(async () => {
		const res = await getOpenDirectRoom({ username: user.username });
		if (res?.data?.name) {
			groupRoute.push({
				name: res.data.name,
			});
			appLayout.updateActiveModule({
				name: 'home',
			});
		}
	}, [getOpenDirectRoom, groupRoute, user.username]);

	const username = user.username || '';

	return (
		<div className='contact-info-content'>
			<div className='contact-info-media-wrapper'>
				<div className='contact-info-user-avatar' style={{ width: 65, height: 65 }}>
					{username && (
						<>
							<UserAvatar size='x124' style={{ width: 65, height: 65 }} username={username} etag={user.avatarETag} />
						</>
					)}
				</div>
				<div className='contact-info-user'>
					<div className='contact-info-user-name-wrapper'>
						<div>{user?.name ?? ''}</div>
					</div>
				</div>
			</div>

			<div onClick={openDirectDm} className='contact-info-user-btn-federted'>
				{t('Direct_Message')}
			</div>
		</div>
	);
};

export default FederatedUser;
