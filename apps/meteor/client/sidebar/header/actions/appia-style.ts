import { css } from '@rocket.chat/css-in-js';

export const searchInputStyle = css`
	height: 100%;
	align-items: center;
	padding-top: 0;
	padding-bottom: 0;
	padding-block: 0;

	&.rcx-input-box__wrapper {
		background: transparent;
		min-width: 50px;
		border: none;
	}

	.rcx-icon--name-magnifier {
		color: #86909c;
	}
	
	.ant-input-affix-wrapper {
		border: none;
		box-shadow: none;
	}
	
	.ant-input {
		background-color: transparent;
	}
`;
