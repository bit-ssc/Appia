import { useAbsoluteUrl, useSetting } from '@rocket.chat/ui-contexts';

export const useLogoSquare = (): string => {
	const absoluteUrl = useAbsoluteUrl();
	const logoSquare = useSetting('Assets_logo_square') as {
		url?: string;
	};
	const enterpriseId = useSetting('Enterprise_ID') as string;

	if (logoSquare?.url) {
		return logoSquare.url;
	}

	let path = 'test';

	// 根据 Enterprise_ID 来枚举
	if (enterpriseId?.toLowerCase() === 'test') {
		path = 'test';
	}

	return absoluteUrl(`/images/${path}.png`);
};
