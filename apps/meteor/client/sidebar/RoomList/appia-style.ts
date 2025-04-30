import { css } from '@rocket.chat/css-in-js';

export const appiaRoomsListStyle = css`
	.appia-sidebar-item {
		margin: 0 12px;
		border-radius: 4px;

		.rcx-sidebar-item {
			padding: 8px;
		}
	}

	.appia-sidebar-favorite-item {
		background-color: rgb(238, 238, 238);
	}

	.rcx-sidebar-item:active,
	.rcx-sidebar-item--selected {
		background-color: #d7e5ff;
	}

	.rcx-sidebar-item--clickable:hover {
		background-color: #eeeeee;
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
