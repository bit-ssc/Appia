import { css } from '@rocket.chat/css-in-js';

export const notJoinedChanelLimitStyle = css`
	position: relative;
	padding: 20px 10px 0;
	line-height: 22px;
	text-align: center;
	color: #86909c;
	z-index: 99;

	svg {
		display: inline-block;
		vertical-align: middle;
		margin-top: -2px;
	}

	span {
		color: #1b5bff;
		cursor: pointer;
	}

	&::after {
		content: ' ';
		position: absolute;
		left: 0;
		right: 0;
		top: 42px;
		height: 198px;
		background: linear-gradient(180deg, #f5f5f5 0%, rgba(245, 245, 245, 0) 100%);
		pointer-events: none;
	}
`;
