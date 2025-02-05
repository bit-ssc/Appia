import { css } from '@rocket.chat/css-in-js';

export const appiaMessageStyle = css`
<<<<<<< HEAD
	--actionWidth: 36px;
	--actionHeight: 30px;
	--actionGap: 40px;

	background: none;

	.rcx-message {
		padding-top: 18px;
		padding-inline: 0.4rem;
	}
=======
	--actionWidth: 42px;
	--actionHeight: 20px;
	--actionGap: 0px;

	background: none;

>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
	.rcx-message:hover {
		background: #e8f2ff;

		.rcx-message-body,
		.rcx-message-attachments {
			background: #e8f2ff;

			* {
				background: #e8f2ff;
			}
		}

		// /* 确保顶部区域不受hover影响 */
		// .rcx-message-top-section,
		// .rcx-message-top-section * {
		// 	background: #f2f3f5 !important;
		// }

		/* 头像和在线状态特殊处理 */
		.rcx-message-top-section {
			display: inline-flex !important;
			.rcx-avatar {
				background: transparent !important;
			}

			.reactive-user-status,
			.ant-badge-status-dot {
				background: transparent !important;
			}
		}
	}

	.rcx-message {
		padding-inline: 0.4rem;
		padding-block: 0 !important;

		.rcx-message-top-section {
			display: inline-flex !important;
		}
	}

	.rcx-message-top-section {
		// background: #f2f3f5 !important;

		.rcx-message-header,
		.rcx-message-header * {
			background: transparent !important;
		}

		.rcx-message-name-container,
		.rcx-message-name-container * {
			background: #f2f3f5 !important;
		}

		/* 头像和在线状态特殊处理 */
		.rcx-avatar {
			background: transparent !important;
		}

		.ant-badge-count,
		.reactive-user-status,
		.ant-badge-status-dot {
			background: transparent !important;
		}
	}

	.appia-body-wrapper {
		position: relative;
		width: 100%;

		.rcx-message-body {
<<<<<<< HEAD
			display: inline-block;
			padding: 12px 16px;
			background: #fff;
			border-radius: 4px;
			margin-top: 6px;
=======
			display: block;
			width: 100%;
			line-height: normal;
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
		}

		.appia-message-body-docCloud-wrapper,
		.appia-message-body-meeting_room-wrapper,
		.appia-message-body-approval-wrapper {
			padding: 0;
		}
<<<<<<< HEAD
=======

		.appia-message-body-voiceChatMsg-wrapper {
			padding: 0;
			background: transparent;
		}
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')

		.message-actions .rc-icon {
			width: 18px;
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
<<<<<<< HEAD
		min-height: var(--actionHeight);
		margin-bottom: 14px;
		position: absolute;
		margin-left: 50%;
		transform: translateX(calc(-50% - 54px + var(--actionGap)));
=======
		position: absolute;
		left: 50%; /* 设置为 50% */
		transform: translateX(-50%); /* 更新为 -50% */
		margin-top: -6px;
		background: transparent !important;
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
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
		* {
			background: #ffffff !important;
		}
	}
	.rcx-message-actions-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		margin-right: var(--actionGap);
<<<<<<< HEAD
=======
		border: 1px solid #dcdcdc;
		border-radius: 2px;
		* {
			background: #ffffff !important;
		}

		.rcx-message-action:first-child {
			border-radius: 2px 0 0 2px;
		}
		.rcx-message-action:last-child {
			border-right: none;
			border-radius: 0 2px 2px 0;
		}
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
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

<<<<<<< HEAD
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

=======
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
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

	.appia-body-wrapper .rcx-message-body {
		padding: 0;
	}

	[data-own='true'] .appia-body-wrapper .rcx-message-body {
		background: #ffffffff;
	}

	[data-own='true'] .appia-body-wrapper .appia-message-body-docCloud-wrapper,
	[data-own='true'] .appia-body-wrapper .appia-message-body-meeting_room-wrapper,
	[data-own='true'] .appia-body-wrapper .rcx-attachment__details .rcx-message-body {
		background: #ffffffff;
	}

<<<<<<< HEAD
	[data-todo='true'] .appia-body-wrapper .message-file-todo,
	[data-todo='true'] .appia-body-wrapper .rcx-message-body,
	[data-todo='true'] .appia-body-wrapper .rcx-attachment__details .rcx-message-body {
=======
	[data-todo='true'] {
		border: 1px solid #ff8c00 !important;
	}

	[data-todo='true'] {
>>>>>>> a8c77c9e35 (Merge branch 'zfc/0129_line' into 'prd/250129')
		background: #fff7e8;

		.rcx-message-body,
		.rcx-message-attachments {
			background: #fff7e8;

			* {
				background: #fff7e8;
			}
		}

		/* 确保顶部区域不受影响 */
		.rcx-message-top-section,
		.rcx-message-top-section * {
			background: #f2f3f5 !important;
			display: inline-flex !important;
		}

		/* 头像和在线状态特殊处理 */
		.rcx-message-top-section {
			display: inline-flex !important;
			.rcx-avatar {
				background: transparent !important;
			}

			.reactive-user-status,
			.ant-badge-status-dot {
				background: transparent !important;
			}
		}
	}

	[data-qa-selected='true'] {
		background: #e5e6eb !important;

		.rcx-message-body,
		.rcx-message-attachments {
			background: #e5e6eb !important;

			* {
				background: #e5e6eb !important;
			}
		}

		/* 确保顶部区域不受影响 */
		.rcx-message-top-section,
		.rcx-message-top-section * {
			display: inline-flex !important;
			background: #f2f3f5 !important;
		}

		/* 头像和在线状态特殊处理 */
		.rcx-message-top-section {
			.rcx-avatar {
				background: transparent !important;
			}

			.reactive-user-status,
			.ant-badge-status-dot {
				background: transparent !important;
			}
		}
	}

	.upload-progress {
		position: absolute;
		bottom: 8px;
		right: 0;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.progress-text {
		margin-left: 5px;
		white-space: nowrap;
		color: rgba(0, 0, 0, 0.5);
		font-size: 14px;
	}

	.read-receipt {
		bottom: 0;
		/* right: 0; */
		left: 100%;
		width: auto;
		margin-left: 10px;
		margin-right: 2px;
		width: 12px;
		height: 12px;
		text-align: center;
		border: 1px solid #91b5fc;
		border-radius: 8px;
		line-height: 1;
	}

	.rcx-message-header__time {
		line-height: 0.75rem;
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

	.message-container {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		margin-right: 50px;
	}

	.message-content-wrapper {
		flex: 1 1 0;
		min-width: 0;
		padding-left: 4px; /* 可以根据需要调整间距 */
	}

	.appia-paragraph {
		line-height: 1.5;
		display: inline !important;
	}

	.rcx-message-container--left {
		width: fit-content;
		flex-direction: row;
		margin-top: 0.125rem !important;
		margin-bottom: 0;
		margin-block: 0;
	}

	.rcx-message-header-name {
		height: 20px;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
`;
