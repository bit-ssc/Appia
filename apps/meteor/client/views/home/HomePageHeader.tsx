import { Button, Icon } from '@rocket.chat/fuselage';
import { useSetting, useTranslation, useAllPermissions } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import PageHeader from '../../components/Page/PageHeader';

const EDIT_LAYOUT_PERMISSIONS = ['view-privileged-setting', 'edit-privileged-setting', 'manage-selected-settings'];

const HomepageHeader = (): ReactElement => {
	const t = useTranslation();
	const title = useSetting('Layout_Home_Title') as string;
	const canEditLayout = useAllPermissions(EDIT_LAYOUT_PERMISSIONS);
	return (
		<PageHeader title={title} data-qa-id='home-header' role='heading'>
			{canEditLayout && (
				<Button is='a' href='/admin/settings/Layout' role='button'>
					<Icon name='pencil' size='x16' /> {t('Customize')}
				</Button>
			)}
		</PageHeader>
	);
};

export default HomepageHeader;
