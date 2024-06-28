import type { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';

import { getWorkspaceAccessToken } from '../../../../app/cloud/server';
import { settings } from '../../../../app/settings/server';
import { Info } from '../../../../app/utils/server';
import { fetch } from '../../../../server/lib/http/fetch';

type installAction = 'install' | 'update' | 'uninstall';

export async function notifyAppInstall(marketplaceBaseUrl: string, action: installAction, appInfo: IAppInfo): Promise<void> {
	const headers: { Authorization?: string } = {};

	try {
		const token = await getWorkspaceAccessToken();
		headers.Authorization = `Bearer ${token}`;

		// eslint-disable-next-line no-empty
	} catch {}

	let siteUrl = '';
	try {
		siteUrl = settings.get<string>('Site_Url');

		// eslint-disable-next-line no-empty
	} catch {}

	const data = {
		action,
		appName: appInfo.name,
		appSlug: appInfo.nameSlug,
		appVersion: appInfo.version,
		rocketChatVersion: Info.version,
		engineVersion: Info.marketplaceApiVersion,
		siteUrl,
	};

	const pendingSentUrl = `${marketplaceBaseUrl}/v1/apps/${appInfo.id}/install`;

	try {
		await fetch(pendingSentUrl, {
			method: 'POST',
			headers,
			body: JSON.stringify(data),
		});

		// eslint-disable-next-line no-empty
	} catch {}
}
