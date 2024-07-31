import { css } from '@rocket.chat/css-in-js';

export const modalStyle = css`
	position: relative;
	width: 90vw;
	height: 90vh;

	.appia-resume-modal-close {
		position: absolute;
		top: -4px;
		right: -32px;
		cursor: pointer;
	}

	.appia-resume-toolbar {
		display: flex;
		height: 40px;
		background-color: #fff;
		align-items: center;
		justify-content: center;
		box-shadow: 1px 1px 10px 1px hsla(0,0%,47.5%,.2);
		border-bottom: solid 1px #F2F2F2;
		padding: 0 10px;
	}

	.appia-resume-name {
		flex: 1;
		padding: 0 5px;
	}

	.appia-resume-wrapper {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}

	.appia-resume-body {
		flex: 1;
	}
`;
