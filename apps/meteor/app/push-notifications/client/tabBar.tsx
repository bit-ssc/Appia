import React, { lazy, useMemo } from 'react';
import { useUserSubscription } from '@rocket.chat/ui-contexts';

import { addAction } from '../../../client/views/room/lib/Toolbox';
import { SettingsIcon } from './Icons';

addAction('push-notifications', ({ room }) => {
	const subscription = useUserSubscription(room?._id);

	return useMemo(
		() =>
			subscription
				? {
						groups: ['channel', 'group', 'direct', 'direct_multiple', 'team'],
						id: 'push-notifications',
						title: 'Settings',
						icon: () => (
							<span style={{ fontSize: 24 }}>
								<SettingsIcon />
							</span>
						),
						template: lazy(() => import('../../../client/views/room/contextualBar/NotificationPreferences')),
						order: 8,
				  }
				: null,
		[subscription],
	);
});
