import { Box } from '@rocket.chat/fuselage';
import { useQueryStringParameter, useRoute } from '@rocket.chat/ui-contexts';
import React, { useEffect } from 'react';

const Embed: React.FC = () => {
	const directRoute = useRoute('direct');

	useEffect(() => {
		const handleMessage = (e: MessageEvent<string>): void => {
			const msg = e.data;
			if (msg && msg.type === 'service') {
				directRoute.push({
					rid: msg.name,
				});
			}
		};

		window.addEventListener('message', handleMessage);

		return (): void => {
			window.removeEventListener('message', handleMessage);
		};
	}, [directRoute]);

	const urlStr = useQueryStringParameter('url');

	if (!urlStr) {
		return null;
	}

	const url = new URL(decodeURIComponent(urlStr), window.location.href);

	if (!/^https?:$/i.test(url.protocol) || url.host !== window.location.host) {
		return null;
	}

	url.searchParams.set('v', Date.now());

	return <Box is='iframe' w='100%' h='100%' border='none' src={url.toString()} />;
};

export default Embed;
