import { usePrefersReducedData } from '@rocket.chat/fuselage-hooks';
import type { AttachmentContextValue } from '@rocket.chat/ui-contexts';
import { AttachmentContext, useLayout, useUserPreference } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { useMemo } from 'react';

import { getURL } from '../../app/utils/client';

const AttachmentProvider: FC<{
	width?: number;
	height?: number;
}> = ({ children, width = 360, height = 360 }) => {
	const { isMobile } = useLayout();
	const reducedData = usePrefersReducedData();
	const collapsedByDefault = !!useUserPreference<boolean>('collapseMediaByDefault');
	const autoLoadEmbedMedias = !!useUserPreference<boolean>('autoImageLoad');
	const saveMobileBandwidth = !!useUserPreference<boolean>('saveMobileBandwidth');

	const contextValue: AttachmentContextValue = useMemo(
		() => ({
			getURL: (url: string): string => getURL(url, { full: true }),
			collapsedByDefault,
			autoLoadEmbedMedias: !reducedData && autoLoadEmbedMedias && (!saveMobileBandwidth || !isMobile),
			dimensions: {
				width,
				height,
			},
		}),
		[collapsedByDefault, reducedData, autoLoadEmbedMedias, saveMobileBandwidth, isMobile, width, height],
	);

	return <AttachmentContext.Provider children={children} value={contextValue} />;
};

export default AttachmentProvider;
