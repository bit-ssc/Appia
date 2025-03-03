import { css } from '@rocket.chat/css-in-js';

export const styles = css`
	padding: 28px 32px 32px;

	.actions-wrapper {
		border-radius: 4px;
		border: 1px solid #e5e6eb;
	}

	.action-item {
		padding: 12px;
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.name {
		flex: 1;
		font-size: 16px;
		padding: 0 8px;
	}

	.icon {
		display: flex;
		width: 36px;
		height: 36px;
		padding: 8px;
		font-size: 20px;
		justify-content: center;
		align-items: center;
		background: rgba(240, 242, 244, 1);
		border-radius: 4px;
	}
`;
