import { Meteor } from 'meteor/meteor';
import type { ISetting, SettingValue } from '@rocket.chat/core-typings';
import { Settings } from '@rocket.chat/models';

import { isEnterprise, hasLicense, onValidateLicenses } from '../../license/server/license';
import { use } from '../../../../app/settings/server/Middleware';
import { settings, SettingsEvents } from '../../../../app/settings/server';

export function changeSettingValue(record: ISetting): SettingValue {
	if (!record.enterprise) {
		return record.value;
	}

	if (!isEnterprise()) {
		return record.invalidValue;
	}

	if (!record.modules?.length) {
		return record.value;
	}

	for (const moduleName of record.modules) {
		if (!hasLicense(moduleName)) {
			return record.invalidValue;
		}
	}

	return record.value;
}

settings.set = use(settings.set, (context, next) => {
	const [record] = context;

	if (!record.enterprise) {
		return next(...context);
	}
	const value = changeSettingValue(record);

	return next({ ...record, value });
});

SettingsEvents.on('fetch-settings', (settings: Array<ISetting>): void => {
	for (const setting of settings) {
		const changedValue = changeSettingValue(setting);
		if (changedValue === undefined) {
			continue;
		}
		setting.value = changedValue;
	}
});

async function updateSettings(): Promise<void> {
	const enterpriseSettings = await Settings.findEnterpriseSettings();

	void enterpriseSettings.forEach((record: ISetting) => settings.set(record));
}

Meteor.startup(async () => {
	await updateSettings();

	onValidateLicenses(updateSettings);
});
