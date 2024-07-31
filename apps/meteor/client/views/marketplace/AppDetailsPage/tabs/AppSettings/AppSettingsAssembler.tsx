import type { SettingValue } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import { capitalize } from '@rocket.chat/string-helpers';
import type { ReactElement } from 'react';
import React from 'react';

import AppSetting from './AppSetting';
import type { ISettings } from '../../../../../../ee/client/apps/@types/IOrchestrator';

type AppSettingsAssemblerProps = {
	settings: ISettings;
	values: Record<string, SettingValue>;
	handlers: Record<string, (eventOrValue: SettingValue) => void>;
};
const AppSettingsAssembler = ({ settings, values, handlers }: AppSettingsAssemblerProps): ReactElement => (
	<Box>
		{Object.values(settings).map((current) => {
			const { id } = current;
			return <AppSetting key={id} appSetting={current} value={values[id]} onChange={handlers[`handle${capitalize(id)}`]} />;
		})}
	</Box>
);

export default AppSettingsAssembler;
