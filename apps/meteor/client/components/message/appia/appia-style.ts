import { css } from '@rocket.chat/css-in-js';

export const appiaMessageStyle = css`
	background: none;

	.rcx-message:hover {
		background: #ececec;
	}

	.appia-body-wrapper {
		position: relative;
		margin-right: 35px;
		padding-right: 10px;

		.rcx-message-body {
			display: inline-block;
			padding: 12px 16px;
			background: #fff;
			border-radius: 4px;
			margin-top: 6px;
		}

		.appia-message-body-docCloud-wrapper,
		.appia-message-body-approval-wrapper {
			padding: 0;
		}

		.rcx-message-toolbox {
			position: absolute;
			z-index: 2;
			transform: translateY(15%);
			right: -50px;
			user-select: none;
			color: #1f2329;
			font-size: 1.25rem;
			background: #f3f3f3;
			padding: 0;
			margin: 0;
			box-sizing: border-box;
			border-radius: 6px;
			border: none;
		}

		.rcx-message-toolbox-tab-right {
			right: -57px;
		}

		.rcx-message-toolbox-nontab-right {
			right: -30px;
		}

		.message-actions .rc-icon {
			width: 18px;
			height: 18px;
		}
	}

	.rcx-message-content-container {
		display: flex;
	}

	.rcx-message-actions-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	.rcx-message-action {
		width: 40px;
		height: 36px;
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

	.rcx-message-action:first-child {
		border-radius: 6px 0 0 6px;
	}
	.rcx-message-action:last-child {
		border-right: none;
		border-radius: 0 6px 6px 0;
	}
	.rcx-message-action:only-child {
		border-right: none;
		border-radius: 6px;
		width: 40px;
		background: #f5f5f5;
	}

	.rcx-message:hover .rcx-message-action:only-child {
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
`;
