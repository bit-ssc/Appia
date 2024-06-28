import type { IDepartment, IStaff } from '@rocket.chat/core-typings';
import { useSetting } from '@rocket.chat/ui-contexts';
import { useEffect, useMemo } from 'react';

import { settings } from '../../../app/settings/client';
import { useEndpointData } from '../../hooks/useEndpointData';
import type { AsyncStatePhase } from '../../lib/asyncState';

export const getDepartment = (str: string): string[] => {
	const arr = [] as string[];

	str.split(',').forEach((id) => {
		if (id.includes('OU=')) {
			arr.push(id.replace('OU=', ''));
		}
	});

	arr.reverse();

	return arr;
};

export const getRoles = (str: string): string[] => {
	const arr = [] as string[];

	str.split(',').forEach((id) => {
		if (id.includes('RO=')) {
			arr.push(id.replace('RO=', ''));
		}
	});

	return arr;
};

export const companyId = settings.get('Enterprise_ID');
export const companyName = settings.get('Enterprise_Name');

let cache = {};

const useContact = (): { userMap: Record<string, IStaff>; departmentMap: Record<string, IDepartment>; phase: AsyncStatePhase } => {
	const update = useSetting('Appia_Hrm_Update_Time') as string;
	// eslint-disable-next-line
	const query = useMemo(() => ({ }), [update]);
	const { value = cache, phase } = useEndpointData('v1/hrm/users.list', query);

	useEffect(() => {
		cache = value;
	}, [value]);

	return {
		departmentMap: value?.data?.departmentMap || {},
		userMap: value?.data?.userMap || {},
		phase,
	};
};

export default useContact;
