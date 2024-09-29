import { css } from '@rocket.chat/css-in-js';

export const appiaMessageStyle = css`
	--actionWidth: 36px;
	--actionHeight: 30px;
	--actionGap: 40px;

	background: none;

	.rcx-message {
		padding-top: 18px;
		padding-inline: 0.4rem;
	}
	.rcx-message:hover {
		background: #ececec;
	}

	.appia-body-wrapper {
		position: relative;

		.rcx-message-body {
			display: inline-block;
			padding: 12px 16px;
			background: #fff;
			border-radius: 4px;
			margin-top: 6px;
		}

		.appia-message-body-docCloud-wrapper,
		.appia-message-body-meeting_room-wrapper,
		.appia-message-body-approval-wrapper {
			padding: 0;
		}

		.message-actions .rc-icon {
			width: 18px;
			height: 18px;
		}
	}

	.rcx-message-toolbox-override {
		z-index: 2;
		user-select: none;
		color: #1f2329;
		font-size: 1.25rem;
		padding: 0;
		box-sizing: border-box;
		border-radius: 6px;
		border: none;
		min-height: var(--actionHeight);
		margin-bottom: 14px;
		position: absolute;
		margin-left: 50%;
		transform: translateX(calc(-50% - 54px + var(--actionGap)));
	}

	.rcx-message-toolbox-override.show-all {
		transform: translateX(calc(-50% + var(--actionGap)));
	}

	.rcx-message-content-container {
		display: flex;
	}

	.rcx-message-actions-containers {
		display: flex;
		flex-direction: row;
	}
	.rcx-message-actions-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		margin-right: var(--actionGap);
	}

	.rcx-message-actions-container-left {
		margin-right: 0;
	}

	.rcx-message-action {
		width: var(--actionWidth);
		height: var(--actionHeight);
		background: #ffffff;
		align-items: center;
		justify-content: center;
		display: flex;
		cursor: pointer;
		border-right: 1px solid #dcdcdc;
		--action-icon-color: #4e5969;

		&:hover {
			background: #f2f3f5;
			--action-icon-color: #185bff;
		}
	}

	.rcx-message-action-disabled {
		cursor: not-allowed;
		--action-icon-color: #c9cdd4;

		&:hover {
			background: #f2f3f5;
			--action-icon-color: #c9cdd4;
		}
	}

	.rcx-message-action:first-child {
		border-radius: 6px 0 0 6px;
	}
	.rcx-message-action:last-child {
		border-right: none;
		border-radius: 0 6px 6px 0;
	}

	.rcx-message:hover {
		background: #ececec;
	}

	@keyframes slideInLeft {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	.rcx-message-action-animation {
		animation: slideInLeft 3s ease forwards;
	}

	.action-popver-content {
		display: flex;
		align-items: center;
		font-size: 14px;
		line-height: 20px;
	}

	.action-popver-icon {
		margin-right: 8px;
		display: flex;
		align-items: center;
	}

	[data-own='true'] .appia-body-wrapper .rcx-message-body {
		background: #d0e2ff;
	}

	[data-own='true'] .appia-body-wrapper .appia-message-body-docCloud-wrapper,
	[data-own='true'] .appia-body-wrapper .appia-message-body-meeting_room-wrapper,
	[data-own='true'] .appia-body-wrapper .rcx-attachment__details .rcx-message-body {
		background: #fff;
	}

	[data-todo='true'] .appia-body-wrapper .message-file-todo,
	[data-todo='true'] .appia-body-wrapper .rcx-message-body,
	[data-todo='true'] .appia-body-wrapper .rcx-attachment__details .rcx-message-body {
		background: #fff7e8;
		border: 1px solid #ff7d00;
	}

	[data-todo='true'] .appia-body-wrapper .message-file-todo {
		border-radius: 4px;
		padding: 2px;
	}

	.upload-progress {
		position: absolute;
		bottom: 8px;
		left: 100%;
		display: flex;
		flex-direction: row;
		margin-left: 10px;
		align-items: center;
	}

	.progress-text {
		margin-left: 5px;
		white-space: nowrap;
		color: rgba(0, 0, 0, 0.5);
		font-size: 14px;
	}

	.read-receipt {
		position: absolute;
		bottom: 0;
		/* right: 0; */
		left: 100%;
		width: auto;
		margin-left: 10px;
		min-width: 16px;
		height: 16px;
		text-align: center;
		border: 1px solid #91b5fc;
		border-radius: 8px;
		line-height: 1;
	}

	.read-receipt-count {
		padding: 0 3px;
		color: #1858d9;
		font-size: 12px;
	}

	.read-receipt-attach {
		bottom: 10px;
		color: rgba(0, 0, 0, 0.6);
	}

	.read-receipt .rcx-icon {
		display: none;
		width: 1em;
		height: 1em;
	}

	.read-receipts-enabled .read-receipt {
		cursor: pointer;
	}

	.read-receipt.read {
		color: #dcdcdc;
		color: var(--rc-color-button-primary);
		border: 1px solid #dcdcdc;
		font-style: normal;
	}

	.read-receipt.read .rcx-icon {
		display: block;
		margin: 0 auto;
		vertical-align: 0;
		color: #dcdcdc;
	}

	.message.temp .read-receipt {
		opacity: 0.4;
	}

	.read-receipts__user {
		display: flex;
		padding: 8px;
		align-items: center;
	}

	.read-receipts__name {
		flex: 1 1 auto;
		margin: 0 10px;
		font-size: 16px;
	}

	.read-receipts__time {
		font-size: 80%;
	}

	.read-receipts__user > .avatar {
		width: 36px;
		width: var(--sidebar-account-thumb-size);
		height: 36px;
		height: var(--sidebar-account-thumb-size);
	}

	.rxc-message_reactions_container {
		background-color: #ffffff;
		color: #4e5969;
		padding-horizontal: 8px;
	}

	.rxc-message_reactions_container_mine {
		border-color: #1b5bff;
		background-color: #ffffff;
		color: #4e5969;
		padding-horizontal: 8px;
	}

	.rxc-message_reaction_title {
		margin-left: 4px;
	}

	.rxc-message_reaction_emoji {
		object-fit: contain;
	}
`;
