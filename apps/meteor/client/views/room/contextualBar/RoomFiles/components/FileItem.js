import { css } from '@rocket.chat/css-in-js';
import { Box, Avatar, Palette } from '@rocket.chat/fuselage';
import React from 'react';

import FileItemIcon from './FileItemIcon';
import MenuItem from './MenuItem';
import { useFormatDateAndTime } from '../../../../../hooks/useFormatDateAndTime';

const hoverClass = css`
	&:hover {
		cursor: pointer;
		background-color: ${Palette.surface['surface-tint']};
	}
`;

const FileItem = ({ fileData, isDeletionAllowed, onClickDelete, index }) => {
	const format = useFormatDateAndTime();

	const { _id, name, url, uploadedAt, ts, type, typeGroup, style, className, user } = fileData;

	return (
		<Box display='flex' pb='x12' borderRadius='x4' style={style} className={[className, hoverClass]}>
			<Box
				is='a'
				minWidth={0}
				{...(typeGroup === 'image' && { className: 'gallery-item' })}
				download
				rel='noopener noreferrer'
				target='_blank'
				title={name}
				display='flex'
				flexGrow={1}
				flexShrink={1}
				href={url}
				key={index}
			>
				{typeGroup === 'image' ? <Avatar size='x48' url={url} /> : <FileItemIcon type={type} />}
				<Box mis='x8' flexShrink={1} overflow='hidden'>
					<Box withTruncatedText color='default' fontScale='p2m'>
						{name}
					</Box>
					<Box withTruncatedText color='hint' fontScale='p2'>
						@{user?.username}
					</Box>
					<Box color='hint' fontScale='micro'>
						{format(uploadedAt)}
					</Box>
				</Box>
			</Box>

			<MenuItem
				_id={_id}
				name={name}
				url={url}
				onClickDelete={isDeletionAllowed && isDeletionAllowed({ uid: user?._id, ts }) && onClickDelete}
			/>
		</Box>
	);
};

export default FileItem;
