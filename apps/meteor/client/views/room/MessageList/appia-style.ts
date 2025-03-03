import { css } from '@rocket.chat/css-in-js';

export const appiaMessageList = css`
	background: none;

	.rcx-message-divider__wrapper {
		background: none;
	}

	.rcx-message-system__block {
		justify-content: center;

		em {
			font-style: normal;
		}
	}

	.rcx-message-divider--unread {
		display: none;
	}
`;
