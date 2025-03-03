import { css } from '@rocket.chat/css-in-js';

export const departmentStyles = css`
	display: flex;
	justify-content: center;
	align-items: center;
	max-width: 95%;

	.department-item {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 20px;
		line-height: 20px;
		background: #e5e6eb;
		border-radius: 4px;
		margin: 0 4px;
		padding: 0 8px;
		color: #4e5969;
		font-size: 12px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;

		svg {
			margin-right: 4px;
		}
	}
`;
