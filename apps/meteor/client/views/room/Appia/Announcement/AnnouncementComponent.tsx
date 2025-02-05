import { css } from '@rocket.chat/css-in-js';
import { Box } from '@rocket.chat/fuselage';
import type { FC } from 'react';
import React from 'react';

const AnnouncementComponent: FC = ({ children }) => {
	const announcementBar = css`
		margin: 8px;
		background: #fff;
		border: 1px solid #e5e6eb;

		box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
		border-radius: 6px;

		color: #86909c;

		transition: transform 0.2s ease-out;
		> * {
			flex: auto;
		}

		.antHeader {
			margin: 0 -8px;
			height: 28px;
			display: flex;
			align-items: center;
			border-bottom: 1px solid #e5e6eb;
			padding: 0 8px;
			flex-direction: row;
		}

		.antTitle1 {
			flex: 1;
			text-align: left;
		}

		.antTitle2 {
			margin-left: 2px;
		}

		.antRow {
			display: flex;
			flex-direction: row;
			margin-left: 5px;
			align-items: center;
			cursor: pointer;
		}

		.antRow1 {
			display: flex;
			flex-direction: row;
			align-items: center;
			cursor: pointer;
			margin-top: auto;
		}

		.antBtn {
			cursor: pointer;
			margin-left: 5px;
		}

		.antItem {
			text-align: left;
			margin: 6px 0;
			width: 100%;
			display: flex;
			flexdirection: row;

			&:not(:last-child) {
				border-bottom: 1px solid #e7e7e7;
			}
		}

		.antItemLeft {
			width: calc(100% - 48px);
		}
	`;

	return (
		<Box
			// onClick={onClickOpen}
			// height='x40'
			pi='x12'
			alignItems='center'
			display='flex'
			fontScale='p2m'
			textAlign='center'
			className={announcementBar}
		>
			<Box withTruncatedText w='none'>
				{children}
			</Box>
		</Box>
	);
};

export default AnnouncementComponent;
