import { onStartup } from '../../../server/lib/onStartup';
import { settingsRegistry } from '../../settings/server';

onStartup(async () => {
	await settingsRegistry.add('AutoTranslate_Enabled', false, {
		type: 'boolean',
		group: 'Message',
		section: 'AutoTranslate',
		public: true,
	});

	await settingsRegistry.add('AutoTranslate_ServiceProvider', 'google-translate', {
		type: 'select',
		group: 'Message',
		section: 'AutoTranslate',
		values: [
			{
				key: 'google-translate',
				i18nLabel: 'AutoTranslate_Google',
			},
			{
				key: 'deepl-translate',
				i18nLabel: 'AutoTranslate_DeepL',
			},
			{
				key: 'microsoft-translate',
				i18nLabel: 'AutoTranslate_Microsoft',
			},
		],
		enableQuery: [{ _id: 'AutoTranslate_Enabled', value: true }],
		i18nLabel: 'AutoTranslate_ServiceProvider',
		public: true,
	});

	await settingsRegistry.add('AutoTranslate_GoogleAPIKey', '', {
		type: 'string',
		group: 'Message',
		section: 'AutoTranslate_Google',
		public: false,
		i18nLabel: 'AutoTranslate_APIKey',
		enableQuery: [
			{
				_id: 'AutoTranslate_Enabled',
				value: true,
			},
			{
				_id: 'AutoTranslate_ServiceProvider',
				value: 'google-translate',
			},
		],
	});

	await settingsRegistry.add('AutoTranslate_DeepLAPIKey', '', {
		type: 'string',
		group: 'Message',
		section: 'AutoTranslate_DeepL',
		public: false,
		i18nLabel: 'AutoTranslate_APIKey',
		enableQuery: [
			{
				_id: 'AutoTranslate_Enabled',
				value: true,
			},
			{
				_id: 'AutoTranslate_ServiceProvider',
				value: 'deepl-translate',
			},
		],
	});

	await settingsRegistry.add('AutoTranslate_MicrosoftAPIKey', '', {
		type: 'string',
		group: 'Message',
		section: 'AutoTranslate_Microsoft',
		public: false,
		i18nLabel: 'AutoTranslate_Microsoft_API_Key',
		enableQuery: [
			{
				_id: 'AutoTranslate_Enabled',
				value: true,
			},
			{
				_id: 'AutoTranslate_ServiceProvider',
				value: 'microsoft-translate',
			},
		],
	});
});
