import { Banner, Icon } from '@rocket.chat/fuselage';
import type { FC } from 'react';
import React, { useCallback, useEffect } from 'react';

import type { LegacyBannerPayload } from '../../lib/banners';
import * as banners from '../../lib/banners';

type LegacyBannerProps = {
	config: LegacyBannerPayload;
};

const LegacyBanner: FC<LegacyBannerProps> = ({ config }) => {
	const { closable = true, title, text, html, icon, modifiers } = config;

	const inline = !modifiers?.includes('large');
	const variant = modifiers?.includes('danger') ? 'danger' : 'info';

	useEffect(() => {
		if (!config.timer) {
			return;
		}

		const timer = setTimeout(() => {
			config.onClose?.call(undefined);
			banners.close();
		}, config.timer);

		return (): void => {
			clearTimeout(timer);
		};
	}, [config.onClose, config.timer]);

	const handleAction = useCallback(() => {
		config.action?.call(undefined);
	}, [config.action]);

	const handleClose = useCallback(() => {
		config.onClose?.call(undefined);
		banners.close();
	}, [config.onClose]);

	return (
		<Banner
			inline={inline}
			actionable={!!config.action}
			closeable={closable}
			icon={icon ? <Icon name={icon} size={20} /> : undefined}
			title={title}
			variant={variant}
			onAction={handleAction}
			onClose={handleClose}
		>
			{text}
			{html && <div dangerouslySetInnerHTML={{ __html: html }} />}
		</Banner>
	);
};

export default LegacyBanner;
