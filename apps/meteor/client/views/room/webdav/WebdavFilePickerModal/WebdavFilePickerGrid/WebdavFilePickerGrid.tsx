import type { IWebdavNode } from '@rocket.chat/core-typings';
import { css } from '@rocket.chat/css-in-js';
import { Box, Icon, Skeleton, States, StatesIcon, StatesTitle, Palette } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement, ComponentProps } from 'react';
import React from 'react';

import WebdavFilePickerGridItem from './WebdavFilePickerGridItem';
import { getNodeIconType } from '../lib/getNodeIconType';

type WebdavFilePickerGridProps = {
	webdavNodes: IWebdavNode[];
	onNodeClick: (file: IWebdavNode) => void;
	isLoading: boolean;
};

const WebdavFilePickerGrid = ({ webdavNodes, onNodeClick, isLoading }: WebdavFilePickerGridProps): ReactElement => {
	const t = useTranslation();

	const hoverStyle = css`
		&:hover {
			background-color: ${Palette.surface['surface-neutral']};
			cursor: pointer;
		}
	`;

	return (
		<Box display='flex' flexWrap='wrap'>
			{isLoading &&
				Array(6)
					.fill('')
					.map((_, index) => (
						<WebdavFilePickerGridItem p='x4' key={index}>
							<Skeleton variant='rect' width='full' height='full' />
						</WebdavFilePickerGridItem>
					))}
			{!isLoading &&
				webdavNodes.map((webdavNode, index) => {
					const { icon } = getNodeIconType(webdavNode.basename, webdavNode.type, webdavNode.mime);

					return (
						<WebdavFilePickerGridItem key={index} className={hoverStyle} onClick={(): void => onNodeClick(webdavNode)}>
							<Icon mie='x4' size='x72' name={icon as ComponentProps<typeof Icon>['name']} />
							<Box textAlign='center'>{webdavNode.basename}</Box>
						</WebdavFilePickerGridItem>
					);
				})}
			{!isLoading && webdavNodes?.length === 0 && (
				<States>
					<StatesIcon name='magnifier' />
					<StatesTitle>{t('No_results_found')}</StatesTitle>
				</States>
			)}
		</Box>
	);
};

export default WebdavFilePickerGrid;
