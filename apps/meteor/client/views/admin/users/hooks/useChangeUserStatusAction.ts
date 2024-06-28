import type { IUser } from '@rocket.chat/core-typings';
import { useToastMessageDispatch, useTranslation, useEndpoint, usePermission } from '@rocket.chat/ui-contexts';
import { useMemo } from 'react';

import { useConfirmOwnerChanges } from './useConfirmOwnerChanges';
import type { Action } from '../../../hooks/useActionSpread';

export const useChangeUserStatusAction = (userId: IUser['_id'], isActive: boolean, onChange: () => void): Action | undefined => {
	const t = useTranslation();
	const confirmOwnerChanges = useConfirmOwnerChanges();
	const dispatchToastMessage = useToastMessageDispatch();
	const changeActiveStatusRequest = useEndpoint('POST', '/v1/users.setActiveStatus');
	const canEditOtherUserActiveStatus = usePermission('edit-other-user-active-status');
	const changeActiveStatusMessage = isActive ? 'User_has_been_deactivated' : 'User_has_been_activated';

	const activeStatusQuery = useMemo(
		() => ({
			userId,
			activeStatus: !isActive,
			confirmRelinquish: false,
		}),
		[userId, isActive],
	);

	const changeActiveStatus = (): Promise<void> =>
		confirmOwnerChanges(
			async (confirm = false) => {
				if (confirm) {
					activeStatusQuery.confirmRelinquish = confirm;
				}

				try {
					await changeActiveStatusRequest(activeStatusQuery);
					dispatchToastMessage({ type: 'success', message: t(changeActiveStatusMessage) });
					onChange();
				} catch (error) {
					throw error;
				}
			},
			{
				confirmText: t('Yes_deactivate_it'),
			},
			onChange,
		);

	return canEditOtherUserActiveStatus
		? {
				icon: 'user',
				label: isActive ? t('Deactivate') : t('Activate'),
				action: changeActiveStatus,
		  }
		: undefined;
};
