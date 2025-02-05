import { MessageGenericPreview } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';

import OEmbedPreviewContent from './OEmbedPreviewContent';
import type { OEmbedPreviewMetadata } from './OEmbedPreviewMetadata';
import MessageCollapsible from '../../MessageCollapsible';

type OEmbedCollapsibleProps = { children?: ReactNode } & OEmbedPreviewMetadata;

const OEmbedCollapsible = ({ children, ...props }: OEmbedCollapsibleProps): ReactElement => {
	const t = useTranslation();

	return (
		<MessageCollapsible title={t('Link_Preview')}>
			<MessageGenericPreview>
				{children}
				<OEmbedPreviewContent {...props} />
			</MessageGenericPreview>
		</MessageCollapsible>
	);
};

export default OEmbedCollapsible;
