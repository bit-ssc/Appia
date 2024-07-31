import { css } from '@rocket.chat/css-in-js';

export const headerStyles = css`
	.title {
		font-size: 16px;
		font-weight: 600;
		line-height: 24px
		padding-bottom: 20px;
		display: flex;
		align-items: center;
    margin-bottom: 20px;

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
`;
