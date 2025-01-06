import { css } from '@rocket.chat/css-in-js';

export const appiaSearchListStyle = css`
	left: 0;
	top: 0;
	background: #fff;
	border-right: 1px solid #eeeff1;

	.appia-sidebar-item {
		margin: 0 12px;
		border-radius: 4px;

		.rcx-sidebar-item {
			padding: 8px;
		}
	}

	.rcx-sidebar-item:active,
	.rcx-sidebar-item--selected {
		background-color: #d7e5ff;
	}

	.rcx-sidebar-item--clickable:hover {
		background-color: #eeeeee;
	}

	.rcx-input-box__wrapper {
		background: #fff;
	}

	.rcx-sidebar-item__title {
		font-weight: 500;
		color: rgb(33, 33, 33);
	}

	.rcx-sidebar-item__subtitle {
		color: #9ca0a3;
	}

	.rcx-badge {
		background: #d91f1b;
	}
`;
