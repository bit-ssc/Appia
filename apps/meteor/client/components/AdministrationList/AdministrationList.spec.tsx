import { render, screen } from '@testing-library/react';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import React from 'react';

import type * as AdministrationListModule from './AdministrationList';

describe('AdministrationList', () => {
	const loadMock = (stubs?: Record<string, unknown>) => {
		return proxyquire.noCallThru().load<typeof AdministrationListModule>('./AdministrationList', {
			'../../../app/ui-utils/client/lib/AccountBox': {
				AccountBoxItem: {},
				isAppAccountBoxItem: () => false,
			},
			'../../../ee/client/hooks/useHasLicenseModule': {
				useHasLicenseModule: () => true,
			},
			'./AdministrationModelList': () => <p>Administration Model List</p>,
			'./AppsModelList': () => <p>Apps Model List</p>,
			'./AuditModelList': () => <p>Audit Model List</p>,
			...stubs,
		}).default;
	};

	it('should render all model list', async () => {
		const AdministrationList = loadMock({
			'../../../ee/client/hooks/useHasLicenseModule': {
				useHasLicenseModule: () => true,
			},
			'@rocket.chat/ui-contexts': {
				usePermission: (key: string) => ['can-audit-log', 'manage-apps', 'can-audit'].includes(key),
				useAtLeastOnePermission: (keys: string[]) => keys.some((key) => ['manage-emoji'].includes(key)),
			},
		});

		render(<AdministrationList accountBoxItems={[{} as any]} onDismiss={() => null} />);

		expect(screen.getByText('Administration Model List')).to.exist;
		expect(screen.getByText('Apps Model List')).to.exist;
		expect(screen.getByText('Audit Model List')).to.exist;
	});

	it('should render administration model list when has account box item', async () => {
		const AdministrationList = loadMock({
			'../../../ee/client/hooks/useHasLicenseModule': {
				'useHasLicenseModule': () => false,

				'@rocket.chat/ui-contexts': {
					usePermission: () => false,
					useAtLeastOnePermission: () => false,
				},
			},
		});

		render(<AdministrationList accountBoxItems={[{} as any]} onDismiss={() => null} />);

		expect(screen.getByText('Administration Model List')).to.exist;
		expect(screen.queryByText('Apps Model List')).to.exist;
		expect(screen.queryByText('Audit Model List')).to.not.exist;
	});

	it('should render apps model list when has app account box item', async () => {
		const AdministrationList = loadMock({
			'../../../app/ui-utils/client/lib/AccountBox': {
				AccountBoxItem: {},
				isAppAccountBoxItem: () => true,
			},
			'../../../ee/client/hooks/useHasLicenseModule': {
				'useHasLicenseModule': () => false,

				'@rocket.chat/ui-contexts': {
					usePermission: () => false,
					useAtLeastOnePermission: () => false,
				},
			},
		});

		render(<AdministrationList accountBoxItems={[{} as any]} onDismiss={() => null} />);

		expect(screen.getByText('Apps Model List')).to.exist;
		expect(screen.queryByText('Administration Model List')).to.not.exist;
		expect(screen.queryByText('Audit Model List')).to.not.exist;
	});
});
