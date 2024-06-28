import { usePrefersReducedData } from '@rocket.chat/fuselage-hooks';
import { useLayout, useUserPreference } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { useMemo } from 'react';

import { getURL } from '../../../../../app/utils/client';
import type { AttachmentContextValue } from '../context/AttachmentContext';
import { AttachmentContext } from '../context/AttachmentContext';

const AttachmentProvider: FC = ({ children }) => {
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
				width: 480,
				height: 360,
			},
		}),
		[collapsedByDefault, reducedData, autoLoadEmbedMedias, saveMobileBandwidth, isMobile],
	);

	return <AttachmentContext.Provider children={children} value={contextValue} />;
};

export default AttachmentProvider;
