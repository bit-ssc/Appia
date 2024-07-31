import fs from 'fs/promises';

import type { Locator, Page } from '@playwright/test';

export class HomeContent {
	protected readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	get inputMessage(): Locator {
		return this.page.locator('[name="msg"]');
	}

	get messagePopupUsers(): Locator {
		return this.page.locator('role=menu[name="People"]');
	}

	get lastUserMessage(): Locator {
		return this.page.locator('[data-qa-type="message"]').last();
	}

	get lastUserMessageNotThread(): Locator {
		return this.page.locator('div.messages-box [data-qa-type="message"]').last();
	}

	get lastUserMessageBody(): Locator {
		return this.lastUserMessage.locator('[data-qa-type="message-body"]');
	}

	get lastUserMessageNotSequential(): Locator {
		return this.page.locator('[data-qa-type="message"][data-sequential="false"]').last();
	}

	get encryptedRoomHeaderIcon(): Locator {
		return this.page.locator('.rcx-room-header button > i.rcx-icon--name-key');
	}

	get btnJoinRoom(): Locator {
		return this.page.locator('//button[contains(text(), "Join")]');
	}

	async joinRoom(): Promise<void> {
		await this.btnJoinRoom.click();
	}

	async joinRoomIfNeeded(): Promise<void> {
		if (await this.inputMessage.isEnabled()) {
			return;
		}
		if (!(await this.btnJoinRoom.isVisible())) {
			return;
		}
		await this.joinRoom();
	}

	async sendMessage(text: string): Promise<void> {
		await this.joinRoomIfNeeded();
		await this.page.waitForSelector('[name="msg"]:not([disabled])');
		await this.page.locator('[name="msg"]').type(text);
		await this.page.keyboard.press('Enter');
	}

	async dispatchSlashCommand(text: string): Promise<void> {
		await this.joinRoomIfNeeded();
		await this.page.waitForSelector('[name="msg"]:not([disabled])');
		await this.page.locator('[name="msg"]').type(text);
		await this.page.keyboard.press('Enter');
		await this.page.keyboard.press('Enter');
	}

	get btnModalCancel(): Locator {
		return this.page.locator('#modal-root .rcx-button-group--align-end .rcx-button--secondary');
	}

	get modalFilePreview(): Locator {
		return this.page.locator(
			'//div[@id="modal-root"]//header//following-sibling::div[1]//div//div//img | //div[@id="modal-root"]//header//following-sibling::div[1]//div//div//div//i',
		);
	}

	get btnModalConfirm(): Locator {
		return this.page.locator('#modal-root .rcx-button-group--align-end .rcx-button--primary');
	}

	get descriptionInput(): Locator {
		return this.page.locator('//div[@id="modal-root"]//fieldset//div[2]//span//input');
	}

	get getFileDescription(): Locator {
		return this.page.locator('[data-qa-type="message"]:last-child [data-qa-type="message-body"]');
	}

	get fileNameInput(): Locator {
		return this.page.locator('//div[@id="modal-root"]//fieldset//div[1]//span//input');
	}

	get lastMessageFileName(): Locator {
		return this.page.locator('[data-qa-type="message"]:last-child [data-qa-type="attachment-title-link"]');
	}

	get lastMessageTextAttachmentEqualsText(): Locator {
		return this.page.locator('[data-qa-type="message"]:last-child .rcx-attachment__details .rcx-message-body');
	}

	get lastThreadMessageTextAttachmentEqualsText(): Locator {
		return this.page.locator('div.thread-list ul.thread [data-qa-type="message"]').last().locator('.rcx-attachment__details');
	}

	get lastThreadMessageText(): Locator {
		return this.page.locator('div.thread-list ul.thread [data-qa-type="message"]').last();
	}

	get lastThreadMessagePreviewText(): Locator {
		return this.page.locator('div.messages-box ul.messages-list [role=link]').last();
	}

	get btnOptionEditMessage(): Locator {
		return this.page.locator('[data-qa-id="edit-message"]');
	}

	get btnOptionDeleteMessage(): Locator {
		return this.page.locator('[data-qa-id="delete-message"]');
	}

	get btnOptionPinMessage(): Locator {
		return this.page.locator('[data-qa-id="pin-message"]');
	}

	get btnOptionStarMessage(): Locator {
		return this.page.locator('[data-qa-id="star-message"]');
	}

	get btnOptionFileUpload(): Locator {
		return this.page.locator('[data-qa-id="file-upload"]');
	}

	get btnVideoMessage(): Locator {
		return this.page.locator('[data-id="video-message"]');
	}

	get btnRecordAudio(): Locator {
		return this.page.locator('[data-qa-id="audio-record"]');
	}

	get btnMenuMoreActions() {
		return this.page.locator('[data-qa-id="menu-more-actions"]');
	}

	get linkUserCard(): Locator {
		return this.page.locator('[data-qa="UserCard"] a');
	}

	get btnContactInformation(): Locator {
		return this.page.locator('[data-qa-id="ToolBoxAction-user"]');
	}

	get btnContactEdit(): Locator {
		return this.page.locator('.rcx-vertical-bar button:has-text("Edit")');
	}

	get inputModalClosingComment(): Locator {
		return this.page.locator('#modal-root input:nth-child(1)[name="comment"]');
	}

	get btnSendTranscript(): Locator {
		return this.page.locator('[data-qa-id="ToolBoxAction-mail-arrow-top-right"]');
	}

	get btnSendTranscriptToEmail(): Locator {
		return this.page.locator('li.rcx-option', { hasText: 'Send via email' });
	}

	get btnSendTranscriptAsPDF(): Locator {
		return this.page.locator('li.rcx-option', { hasText: 'Export as PDF' });
	}

	get btnCannedResponses(): Locator {
		return this.page.locator('[data-qa-id="ToolBoxAction-canned-response"]');
	}

	get btnNewCannedResponse(): Locator {
		return this.page.locator('.rcx-vertical-bar button:has-text("Create")');
	}

	get inputModalAgentUserName(): Locator {
		return this.page.locator('#modal-root input:nth-child(1)');
	}

	get inputModalAgentForwardComment(): Locator {
		return this.page.locator('[data-qa-id="ForwardChatModalTextAreaInputComment"]');
	}

	async pickEmoji(emoji: string, section = 'icon-people') {
		await this.page.locator('role=toolbar[name="Composer Primary Actions"] >> role=button[name="Emoji"]').click();
		await this.page.locator(`//*[contains(@class, "emoji-picker")]//*[contains(@class, "${section}")]`).click();
		await this.page.locator(`//*[contains(@class, "emoji-picker")]//*[contains(@class, "${emoji}")]`).first().click();
	}

	async dragAndDropFile(): Promise<void> {
		const contract = await fs.readFile('./tests/e2e/fixtures/files/any_file.txt', 'utf-8');

		const dataTransfer = await this.page.evaluateHandle((contract) => {
			const data = new DataTransfer();
			const file = new File([`${contract}`], 'any_file.txt', {
				type: 'text/plain',
			});
			data.items.add(file);
			return data;
		}, contract);

		await this.inputMessage.dispatchEvent('dragenter', { dataTransfer });

		await this.page.locator('[role=dialog][data-qa="DropTargetOverlay"]').dispatchEvent('drop', { dataTransfer });
	}

	async openLastMessageMenu(): Promise<void> {
		await this.page.locator('[data-qa-type="message"]').last().hover();
		await this.page.locator('[data-qa-type="message"]').last().locator('[data-qa-type="message-action-menu"][data-qa-id="menu"]').waitFor();
		await this.page.locator('[data-qa-type="message"]').last().locator('[data-qa-type="message-action-menu"][data-qa-id="menu"]').click();
	}

	async openLastThreadMessageMenu(): Promise<void> {
		await this.page.locator('//main//aside >> [data-qa-type="message"]').last().hover();
		await this.page
			.locator('//main//aside >> [data-qa-type="message"]')
			.last()
			.locator('[data-qa-type="message-action-menu"][data-qa-id="menu"]')
			.waitFor();
		await this.page
			.locator('//main//aside >> [data-qa-type="message"]')
			.last()
			.locator('[data-qa-type="message-action-menu"][data-qa-id="menu"]')
			.click();
	}

	async toggleAlsoSendThreadToChannel(isChecked: boolean): Promise<void> {
		await this.page.locator('//main//aside >> [name="alsoSendThreadToChannel"]').setChecked(isChecked);
	}

	get takeOmnichannelChatButton(): Locator {
		return this.page.locator('role=button[name="Take it!"]');
	}

	get lastSystemMessageBody(): Locator {
		return this.page.locator('[data-qa-type="system-message-body"]').last();
	}

	get resumeOnHoldOmnichannelChatButton(): Locator {
		return this.page.locator('button.rcx-button--primary >> text="Resume"');
	}

	get btnOnHold(): Locator {
		return this.page.locator('[data-qa-id="ToolBoxAction-pause-unfilled"]');
	}

	get btnCall(): Locator {
		return this.page.locator('[data-qa-id="ToolBoxAction-phone"]');
	}

	get btnStartCall(): Locator {
		return this.page.locator('#video-conf-root .rcx-button--primary.rcx-button >> text="Start call"');
	}

	get btnDeclineCall(): Locator {
		return this.page.locator('.rcx-button--secondary-danger.rcx-button >> text="Decline"');
	}

	ringCallText(text: string): Locator {
		return this.page.locator(`#video-conf-root .rcx-box.rcx-box--full >> text="${text}"`);
	}

	get videoConfMessageBlock(): Locator {
		return this.page.locator('.rcx-videoconf-message-block');
	}

	get btnAnonymousSignIn(): Locator {
		return this.page.locator('footer >> role=button[name="Sign in to start talking"]');
	}

	get btnAnonymousTalk(): Locator {
		return this.page.locator('role=button[name="Or talk as anonymous"]');
	}
}
