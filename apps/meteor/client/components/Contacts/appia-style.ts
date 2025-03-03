import { css } from '@rocket.chat/css-in-js';

export const styles = css`
	padding: 16px 20px 20px;

	.hidden {
		display: none !important;
	}

	.modal-contacts-body {
		display: flex;
		flex: 1;
		border: 1px solid #dcdcdc;
		border-radius: 4px;
		overflow: hidden;
		height: 460px;

		.side {
			display: flex;
			flex-direction: column;
			width: 50%;

			&:last-child {
				border-left: 1px solid #dcdcdc;
			}
		}

		.search {
			padding: 16px 16px 0;
			flex-shrink: 0;
		}

		.selectedTitle {
			box-sizing: content-box;
			padding: 16px 16px 0;
			height: 32px;
			color: rgba(0, 0, 0, 0.6);
			line-height: 32px;
			flex-shrink: 0;
		}

		.content {
			overflow: hidden;
			display: flex;
			flex-direction: column;
			flex: 1;
		}

		.panel {
			flex: 1;
			overflow: auto;
			padding: 0 20px;
			margin-bottom: 8px;
		}

		.groupItem {
			padding: 8px;
			display: flex;
			align-items: center;
			cursor: pointer;

			&:hover {
				border-radius: 4px;
				background: #eee;
			}

			.checkbox {
				flex-shrink: 0;
				margin: 4px;
			}

			.arrow {
				flex-shrink: 0;
				color: rgba(0, 0, 0, 0.4);
				margin-right: 10px;
			}

			.icon {
				flex-shrink: 0;
				margin-right: 8px;
				background-color: rgba(204, 230, 255, 1);
				border-radius: 4px;
				color: #2878ff;
				font-size: 20px;
				line-height: 0;

				img {
					display: block;
					border-radius: 4px;
					width: 32px !important;
					height: 32px !important;
				}
			}

			.name {
				flex: 1;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		.item {
			padding: 8px;
			display: flex;
			align-items: center;
			cursor: pointer;

			&:hover,
			&.active {
				border-radius: 4px;
			}

			.checkbox {
				flex-shrink: 0;
				margin: 4px;
			}

			.avatar {
				margin-right: 8px;
				width: 32px;
				height: 32px;

				img {
					display: block;
					border-radius: 4px;
					width: 32px;
					height: 32px;
				}
			}

			.name {
				flex: 1;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.remove {
				border-radius: 50%;
				font-size: 14px;
				color: rgba(0, 0, 0, 0.4);
				cursor: pointer;
			}
		}
	}
`;

export const footerStyles = css`
	padding-top: 20px;
	text-align: center;
`;

export const headerStyles = css`
	position: relative;

	.title {
		font-size: 16px;
		font-weight: 600;
		line-height: 24px;
		padding-bottom: 20px;
		display: flex;
		align-items: center;

		&::before {
			display: inline-block;
			content: ' ';
			border-radius: 2px 0px;
			background: linear-gradient(180deg, #2878ff 0%, rgba(40, 120, 255, 0.4) 100%);
			margin-right: 8px;
			width: 4px;
			height: 16px;
		}
	}

	.close {
		position: absolute;
		top: 0;
		right: 0;
	}
`;

export const tabsStyle = css`
	display: flex;
	height: 48px;
	justify-content: space-between;
	align-items: center;
	font-size: 14px;
	line-height: 48px;
	border-bottom: 1px solid rgb(220, 220, 220);
	margin-bottom: -1px;
	text-align: center;

	.tab {
		flex: 1;
		cursor: pointer;
	}

	.active {
		color: #2878ff;
		border-bottom: 2px solid #2878ff;
	}
`;
