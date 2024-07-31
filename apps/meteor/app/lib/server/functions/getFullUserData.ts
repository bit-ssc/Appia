import type { IUser } from '@rocket.chat/core-typings';
import { Users } from '@rocket.chat/models';

import { Logger } from '../../../logger/server';
import { settings } from '../../../settings/server';
import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';

const logger = new Logger('getFullUserData');

const defaultFields = {
	name: 1,
	username: 1,
	nickname: 1,
	status: 1,
	utcOffset: 1,
	type: 1,
	active: 1,
	bio: 1,
	reason: 1,
	statusText: 1,
	avatarETag: 1,
	extension: 1,
	federated: 1,
	employeeID: 1,
	importIds: 1,
	emails: 1,
	employeeStatus: 1,
	employeeType: 1,
	sexId: 1,
	workPlaceName: 1,
	jobName: 1,
	phone: 1,
} as const;

const fullFields = {
	emails: 1,
	phone: 1,
	statusConnection: 1,
	bio: 1,
	createdAt: 1,
	lastLogin: 1,
	requirePasswordChange: 1,
	requirePasswordChangeReason: 1,
	roles: 1,
	employeeID: 1,
	importIds: 1,
} as const;

let publicCustomFields: Record<string, 0 | 1> = {};
let customFields: Record<string, 0 | 1> = {};

settings.watch<string>('Accounts_CustomFields', (settingValue) => {
	publicCustomFields = {};
	customFields = {};

	const value = settingValue?.trim();
	if (!value) {
		return;
	}

	try {
		const customFieldsOnServer = JSON.parse(value);
		Object.keys(customFieldsOnServer).forEach((key) => {
			const element = customFieldsOnServer[key];
			if (element.public) {
				publicCustomFields[`customFields.${key}`] = 1;
			}
			customFields[`customFields.${key}`] = 1;
		});
	} catch (e) {
		logger.warn(`The JSON specified for "Accounts_CustomFields" is invalid. The following error was thrown: ${e}`);
	}
});

const getCustomFields = (canViewAllInfo: boolean): Record<string, 0 | 1> => (canViewAllInfo ? customFields : publicCustomFields);

const getFields = (canViewAllInfo: boolean): Record<string, 0 | 1> => ({
	...defaultFields,
	...(canViewAllInfo && fullFields),
	...getCustomFields(canViewAllInfo),
});

export async function getFullUserDataByIdOrUsername(
	userId: string,
	{ filterId, filterUsername }: { filterId: string; filterUsername?: undefined } | { filterId?: undefined; filterUsername: string },
): Promise<IUser | null> {
	const caller = await Users.findOneById(userId, { projection: { username: 1 } });
	if (!caller) {
		return null;
	}
	const targetUser = (filterId || filterUsername) as string;
	const myself = (filterId && targetUser === userId) || (filterUsername && targetUser === caller.username);
	const canViewAllInfo = !!myself || (await hasPermissionAsync(userId, 'view-full-other-user-info'));

	const fields = getFields(canViewAllInfo);

	const options = {
		projection: {
			...fields,
			...(myself && { services: 1 }),
		},
	};

	const user = await Users.findOneByIdOrUsername(targetUser, options);
	if (!user) {
		return null;
	}

	user.canViewAllInfo = canViewAllInfo;

	if (user?.services?.password) {
		(user.services.password as any) = true;
	}

	return user;
}
