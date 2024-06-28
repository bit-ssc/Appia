import { API } from '../../../app/api/server/api';
import type { NonEnterpriseTwoFactorOptions, Options } from '../../../app/api/server/definition';
import { use } from '../../../app/settings/server/Middleware';
import { isEnterprise } from '../../app/license/server/license';

// Overwrites two factor method to enforce 2FA check for enterprise APIs when
// no license was provided to prevent abuse on enterprise APIs.

const isNonEnterpriseTwoFactorOptions = (options?: Options): options is NonEnterpriseTwoFactorOptions =>
	!!options && 'forceTwoFactorAuthenticationForNonEnterprise' in options && Boolean(options.forceTwoFactorAuthenticationForNonEnterprise);

API.v1.processTwoFactor = use(API.v1.processTwoFactor, function ([params, ...context], next) {
	if (isNonEnterpriseTwoFactorOptions(params.options) && !isEnterprise()) {
		const options: NonEnterpriseTwoFactorOptions = {
			...params.options,
			twoFactorOptions: {
				disableRememberMe: true,
				requireSecondFactor: true,
				disablePasswordFallback: false,
			},
			twoFactorRequired: true,
			authRequired: true,
		};

		return next(
			{
				...params,
				options,
			},
			...context,
		);
	}

	return next(params, ...context);
});
