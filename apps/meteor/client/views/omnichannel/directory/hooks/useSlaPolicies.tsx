import { useEndpoint } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import { millisecondsToMinutes } from 'date-fns';

import { useHasLicenseModule } from '../../../../../ee/client/hooks/useHasLicenseModule';

export const useSlaPolicies = () => {
	const isEnterprise = useHasLicenseModule('livechat-enterprise') === true;
	const getSlaPolicies = useEndpoint('GET', '/v1/livechat/sla');
	const { data: { sla } = {}, ...props } = useQuery(['/v1/livechat/sla'], () => getSlaPolicies({}), {
		staleTime: millisecondsToMinutes(10),
		enabled: isEnterprise,
	});

	return {
		data: sla,
		...props,
	};
};
