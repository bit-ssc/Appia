import { faker } from '@faker-js/faker';

import { IS_EE } from './config/constants';
import { Users } from './fixtures/userStates';
import { Admin } from './page-objects';
import { test, expect } from './utils/test';

test.use({ storageState: Users.admin.state });

test.describe.parallel('administration', () => {
	let poAdmin: Admin;

	test.beforeEach(async ({ page }) => {
		poAdmin = new Admin(page);
	});

	test.describe('Info', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/admin/info');
		});

		test('expect download info as JSON', async ({ page }) => {
			const [download] = await Promise.all([page.waitForEvent('download'), page.locator('button:has-text("Download Info")').click()]);

			await expect(download.suggestedFilename()).toBe('statistics.json');
		});
	});

	test.describe('Users', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/admin/users');
		});

		test('expect find "user1" user', async ({ page }) => {
			await poAdmin.inputSearchUsers.type('user1');

			await expect(page.locator('table tr[qa-user-id="user1"]')).toBeVisible();
		});

		test('expect create a user', async () => {
			await poAdmin.tabs.users.btnNew.click();
			await poAdmin.tabs.users.inputName.type(faker.name.firstName());
			await poAdmin.tabs.users.inputUserName.type(faker.internet.userName());
			await poAdmin.tabs.users.inputEmail.type(faker.internet.email());
			await poAdmin.tabs.users.checkboxVerified.click();
			await poAdmin.tabs.users.inputPassword.type('any_password');
			await poAdmin.tabs.users.addRole('user');
			await poAdmin.tabs.users.btnSave.click();
		});
	});

	test.describe('Rooms', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/admin/rooms');
		});

		test('expect find "general" channel', async ({ page }) => {
			await poAdmin.inputSearchRooms.type('general');
			await page.waitForSelector('[qa-room-id="GENERAL"]');
		});
	});

	test.describe('Permissions', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/admin/permissions');
		});

		test('expect open upsell modal if not enterprise', async ({ page }) => {
			test.skip(IS_EE);
			await poAdmin.btnCreateRole.click();
			await page.waitForSelector('dialog[id="custom-roles"]');
		});
	});

	test.describe('Settings', () => {
		test.describe('General', () => {
			test.beforeEach(async ({ page }) => {
				await page.goto('/admin/settings/General');
			});

			test('expect be able to reset a setting after a change', async () => {
				await poAdmin.inputSiteURL.type('any_text');
				await poAdmin.btnResetSiteURL.click();
			});
		});
	});
});
