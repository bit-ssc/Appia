import faker from '@faker-js/faker';
import type { Page } from '@playwright/test';

import { Users } from './fixtures/userStates';
import { HomeChannel } from './page-objects';
import { createTargetChannel } from './utils';
import { test, expect } from './utils/test';

test.use({ storageState: Users.admin.state });

test.describe.serial('channel-management', () => {
	let poHomeChannel: HomeChannel;
	let targetChannel: string;
	let regularUserPage: Page;

	test.beforeAll(async ({ api, browser }) => {
		targetChannel = await createTargetChannel(api);
		regularUserPage = await browser.newPage({ storageState: Users.user2.state });
		await regularUserPage.goto('/home');
		await regularUserPage.waitForSelector('[data-qa-id="home-header"]');
	});

	test.beforeEach(async ({ page }) => {
		poHomeChannel = new HomeChannel(page);

		await page.goto('/home');
	});

	test('expect add "user1" to "targetChannel"', async () => {
		await poHomeChannel.sidenav.openChat(targetChannel);
		await poHomeChannel.tabs.btnTabMembers.click();
		await poHomeChannel.tabs.members.showAllUsers();
		await poHomeChannel.tabs.members.addUser('user1');

		await expect(poHomeChannel.toastSuccess).toBeVisible();
	});

	test('expect create invite to the room', async () => {
		await poHomeChannel.sidenav.openChat(targetChannel);
		await poHomeChannel.tabs.btnTabMembers.click();
		await poHomeChannel.tabs.members.inviteUser();

		await expect(poHomeChannel.toastSuccess).toBeVisible();
	});

	test('expect mute "user1"', async () => {
		await poHomeChannel.sidenav.openChat(targetChannel);
		await poHomeChannel.tabs.btnTabMembers.click();
		await poHomeChannel.tabs.members.showAllUsers();
		await poHomeChannel.tabs.members.muteUser('user1');
	});

	test('expect set "user1" as owner', async () => {
		await poHomeChannel.sidenav.openChat(targetChannel);
		await poHomeChannel.tabs.btnTabMembers.click();
		await poHomeChannel.tabs.members.showAllUsers();
		await poHomeChannel.tabs.members.setUserAsOwner('user1');
	});

	test('expect set "user1" as moderator', async () => {
		await poHomeChannel.sidenav.openChat(targetChannel);
		await poHomeChannel.tabs.btnTabMembers.click();
		await poHomeChannel.tabs.members.showAllUsers();
		await poHomeChannel.tabs.members.setUserAsModerator('user1');
	});

	test('expect edit topic of "targetChannel"', async () => {
		await poHomeChannel.sidenav.openChat(targetChannel);
		await poHomeChannel.tabs.btnRoomInfo.click();
		await poHomeChannel.tabs.room.btnEdit.click();
		await poHomeChannel.tabs.room.inputTopic.fill('hello-topic-edited');
		await poHomeChannel.tabs.room.btnSave.click();
	});

	test('expect edit announcement of "targetChannel"', async () => {
		await poHomeChannel.sidenav.openChat(targetChannel);
		await poHomeChannel.tabs.btnRoomInfo.click();
		await poHomeChannel.tabs.room.btnEdit.click();
		await poHomeChannel.tabs.room.inputAnnouncement.fill('hello-announcement-edited');
		await poHomeChannel.tabs.room.btnSave.click();
	});

	test('expect edit description of "targetChannel"', async () => {
		await poHomeChannel.sidenav.openChat(targetChannel);
		await poHomeChannel.tabs.btnRoomInfo.click();
		await poHomeChannel.tabs.room.btnEdit.click();
		await poHomeChannel.tabs.room.inputDescription.fill('hello-description-edited');
		await poHomeChannel.tabs.room.btnSave.click();
	});

	test('expect edit name of "targetChannel"', async ({ page }) => {
		await poHomeChannel.sidenav.openChat(targetChannel);
		await poHomeChannel.tabs.btnRoomInfo.click();
		await poHomeChannel.tabs.room.btnEdit.click();
		await poHomeChannel.tabs.room.inputName.fill(`NAME-EDITED-${targetChannel}`);
		await poHomeChannel.tabs.room.btnSave.click();
		await poHomeChannel.sidenav.openChat(`NAME-EDITED-${targetChannel}`);

		await expect(page).toHaveURL(`/channel/NAME-EDITED-${targetChannel}`);
	});

	test.skip('expect edit notification preferences of "targetChannel"', async () => {
		await poHomeChannel.sidenav.openChat(targetChannel);
		await poHomeChannel.tabs.kebab.click({ force: true });
		await poHomeChannel.tabs.btnNotificationPreferences.click({ force: true });
		await poHomeChannel.tabs.notificationPreferences.updateAllNotificationPreferences();
		await poHomeChannel.tabs.notificationPreferences.btnSave.click();

		await expect(poHomeChannel.toastSuccess).toBeVisible();
	});

	test('expect "readOnlyChannel" to show join button', async () => {
		const channelName = faker.datatype.uuid();

		await poHomeChannel.sidenav.openNewByLabel('Channel');
		await poHomeChannel.sidenav.inputChannelName.type(channelName);
		await poHomeChannel.sidenav.checkboxPrivateChannel.click();
		await poHomeChannel.sidenav.checkboxReadOnly.click();
		await poHomeChannel.sidenav.btnCreate.click();

		await regularUserPage.goto(`/channel/${channelName}`);
		await expect(regularUserPage.locator('button', { hasText: 'Join' })).toBeVisible();
	});

	test.skip('expect all notification preferences of "targetChannel" to be "Mentions"', async () => {
		await poHomeChannel.sidenav.openChat(targetChannel);
		await poHomeChannel.tabs.kebab.click({ force: true });
		await poHomeChannel.tabs.btnNotificationPreferences.click({ force: true });

		await expect(poHomeChannel.tabs.notificationPreferences.getPreferenceByDevice('Desktop')).toContainText('Mentions');
		await expect(poHomeChannel.tabs.notificationPreferences.getPreferenceByDevice('Mobile')).toContainText('Mentions');
		await expect(poHomeChannel.tabs.notificationPreferences.getPreferenceByDevice('Email')).toContainText('Mentions');
	});
});
