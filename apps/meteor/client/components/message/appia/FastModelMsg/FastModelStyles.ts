import { css } from '@rocket.chat/css-in-js';

export const FastModelStyles = css`
	.fast-model-snippet {
		white-space: pre-wrap;
	}

	.num-sup-tag {
		top: -8px;

		display: inline-flex;

		min-width: 14px;
		height: 14px;
		margin-left: 3px;

		color: #2878ff;
		border-radius: 3px;
		background-color: rgba(40, 120, 255, 0.1);

		font-weight: bold;
		align-items: center;
		justify-content: center;
	}

	.highlight-cell-tag {
		color: #2878ff;
		background-color: #c4f8ef52;
	}

	.fast-model-cell-tag {
		i {
			top: -8px;

			display: inline-flex;

			min-width: 14px;
			height: 14px;
			margin-left: 3px;

			transform: translateY(-2px);

			color: #c8c9cc;
			border-radius: 3px;
			background-color: #f2f5f9;

			font-size: 10.5px;
			font-weight: bold;
			align-items: center;
			justify-content: center;
		}

		span {
			margin-left: 5px;

			color: #2878ff;
			border-radius: 5px;
			cursor: pointer;
		}
	}

	.line {
		width: max-content;
		height: 0;
		margin: 5px 0;

		border-color: #000000;

		border-top-width: 1px;
	}
`;
