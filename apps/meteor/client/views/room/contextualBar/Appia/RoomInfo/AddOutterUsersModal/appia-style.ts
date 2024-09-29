import { css } from '@rocket.chat/css-in-js';

export const styles = css`
	padding: 16px 20px 20px;
`;

export const dropdownOptionsStyles = css`
	max-height: 200px;
	overflow: hidden;
	padding: 12px;
	font-size: 14px;

	.option {
		display: flex;
		padding: 12px;
		align-items: center;
	}

	.avatar {
		width: 32px;
		height: 32px;

		img {
			width: 32px;
			height: 32px;
			display: block;
		}
	}

	.name {
		display: flex;
		margin-left: 8px;
		flex: 1;
	}

	.tag {
		margin-left: 4px;
	}

	.empty {
		padding: 12px;
		line-height: 22px;
		color: rgba(0, 0, 0, 0.26);
	}
`;
