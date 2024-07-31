import { css } from '@rocket.chat/css-in-js';

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
