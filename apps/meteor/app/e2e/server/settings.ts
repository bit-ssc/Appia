import { settingsRegistry } from '../../settings/server';

void settingsRegistry.addGroup('E2E Encryption', async function () {
	await this.add('E2E_Enable', false, {
		type: 'boolean',
		i18nLabel: 'Enabled',
		i18nDescription: 'E2E_Enable_description',
		public: true,
		alert: 'E2E_Enable_alert',
	});

	await this.add('E2E_Enabled_Default_DirectRooms', false, {
		type: 'boolean',
		public: true,
		enableQuery: { _id: 'E2E_Enable', value: true },
	});

	await this.add('E2E_Enabled_Default_PrivateRooms', false, {
		type: 'boolean',
		public: true,
		enableQuery: { _id: 'E2E_Enable', value: true },
	});
});
