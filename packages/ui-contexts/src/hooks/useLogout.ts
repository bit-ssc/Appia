import { useContext } from 'react';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';

import { useRoute } from './useRoute';
import { UserContext } from '../UserContext';

export const useLogout = (): (() => void) => {
	const router = useRoute('home');
	const { logout } = useContext(UserContext);

	const handleLogout = useMutableCallback(() => {
		logout();
		router.push({});
	});

	return handleLogout;
};
