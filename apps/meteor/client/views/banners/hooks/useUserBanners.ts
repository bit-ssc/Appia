import { useUser } from '@rocket.chat/ui-contexts';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import { useEffect } from 'react';

import { useDismissUserBannerMutation } from './useDismissUserBannerMutation';
import * as banners from '../../../lib/banners';

export const useUserBanners = () => {
	const user = useUser();

	const { mutate: dismissUserBanner } = useDismissUserBannerMutation();

	useEffect(() => {
		if (!user?.banners || Object.keys(user.banners).length === 0) {
			return;
		}

		const firstBanner = Object.values(user.banners)
			.filter((b) => b.read !== true)
			.sort((a, b) => b.priority - a.priority)[0];

		if (!firstBanner) {
			return;
		}

		banners.open({
			id: firstBanner.id,
			title: TAPi18n.__(firstBanner.title),
			text: TAPi18n.__(firstBanner.text, {
				postProcess: 'sprintf',
				sprintf: firstBanner.textArguments ?? [],
			}),
			modifiers: firstBanner.modifiers,
			action() {
				if (firstBanner.link) {
					window.open(firstBanner.link, '_system');
				}
			},
			onClose() {
				dismissUserBanner({ id: firstBanner.id });
			},
		});
	}, [dismissUserBanner, user?.banners]);
};
