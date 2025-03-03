import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import type { NotificationFormValues } from './NotificationPreferencesWithData';
import NotificationToogle from './components/NotificationToogle';
import { SettingsIcon } from '../../../../../app/push-notifications/client/Icons';
import VerticalBar from '../../../../components/VerticalBar';

type NotificationPreferencesProps = {
	handleClose: () => void;
	formValues: NotificationFormValues;
	formHandlers: Record<string, (e: unknown) => void>;
	formHasUnsavedChanges: boolean;
	handlePlaySound: () => void;
	handleOptions: {
		alerts: [string, string][];
		audio: [string, string][];
		sound: [string, string][];
	};
	handleSaveButton: () => void;
};

const NotificationPreferences = ({ handleClose, formValues, formHandlers }: NotificationPreferencesProps): ReactElement => {
	const t = useTranslation();

	return (
		<>
			<VerticalBar.Header>
				<Box is='span' color='rgba(0, 0, 0, 0.4)' cursor='pointer' alignItems='center' display='flex' fontSize={24}>
					<SettingsIcon />
				</Box>

				<VerticalBar.Text>{t('Notifications_Preferences')}</VerticalBar.Text>
				{handleClose && <VerticalBar.Close onClick={handleClose} />}
			</VerticalBar.Header>
			<VerticalBar.ScrollableContent>
				<NotificationToogle label={t('Show_counter')} onChange={formHandlers?.handleShowCounter} defaultChecked={formValues?.showCounter} />
			</VerticalBar.ScrollableContent>
		</>
	);
};

export default NotificationPreferences;
