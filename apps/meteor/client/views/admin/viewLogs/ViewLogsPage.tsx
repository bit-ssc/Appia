import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import ServerLogs from './ServerLogs';
import Page from '../../../components/Page';

const ViewLogsPage = (): ReactElement => {
	const t = useTranslation();

	return (
		<Page>
			<Page.Header title={t('View_Logs')} />
			<Page.Content>
				<ServerLogs />
			</Page.Content>
		</Page>
	);
};

export default ViewLogsPage;
