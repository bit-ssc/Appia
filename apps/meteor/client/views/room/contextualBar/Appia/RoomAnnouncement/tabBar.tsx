import type { FC, LazyExoticComponent } from 'react';
import React, { lazy } from 'react';

import { AnnouncementIcon } from '../../../../../components/AppiaIcon';
import { addAction } from '../../../lib/Toolbox';

addAction('room-announcement', {
	groups: ['channel', 'group', 'direct_multiple', 'team'],
	id: 'room-announcement',
	anonymous: true,
	full: true,
	title: 'Announcement',
	icon: () => (
		<span style={{ fontSize: 24 }}>
			<AnnouncementIcon />
		</span>
	),
	template: lazy(() => import('./Announcement')) as LazyExoticComponent<FC>,
	order: 2,
});
