import type { App } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import type { ReactElement } from 'react';
import React from 'react';

import AppRow from './AppRow';

type AppsListProps = {
	apps: App[];
	title: string;
};

const AppsList = ({ apps, title }: AppsListProps): ReactElement => (
	<>
		<Box is='h3' fontScale='h3' color='default' mbe='x20'>
			{title}
		</Box>
		<Box mbe='x24'>
			{apps.map((app) => (
				<AppRow key={app.id} {...app} />
			))}
		</Box>
	</>
);

export default AppsList;
