import { css } from '@rocket.chat/css-in-js';

export const styles = css`
	padding: 16px 20px 20px;

	.container {
		background: rgba(242, 243, 245, 1);
		border-radius: 4px;
		text-align: center;
		padding: 20px 0;

		.qrcode {
			width: 104px;
			height: 104px;
			margin: 0 auto 20px;

			img {
				width: 104px;
				height: 104px;
			}
		}

		.desc {
			padding: 10px 0 0;
			color: #86909c;
		}
	}
`;
