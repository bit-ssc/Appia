import { Box, MessageGenericPreviewImage } from '@rocket.chat/fuselage';
import type { ReactElement } from 'react';
import React from 'react';

import type { UrlPreviewMetadata } from './UrlPreviewMetadata';
import { useOembedLayout } from '../../hooks/useOembedLayout';

const UrlImagePreview = ({ url }: Pick<UrlPreviewMetadata, 'url'>): ReactElement => {
	const { maxHeight: oembedMaxHeight } = useOembedLayout();

	return (
		<Box maxHeight={oembedMaxHeight} maxWidth={'100%'}>
			<MessageGenericPreviewImage className='gallery-item' url={url || ''} />
		</Box>
	);
};

export default UrlImagePreview;
