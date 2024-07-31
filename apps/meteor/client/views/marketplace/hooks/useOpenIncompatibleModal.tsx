import { useSetModal } from '@rocket.chat/ui-contexts';
import React, { useCallback } from 'react';

import { Apps } from '../../../../ee/client/apps/orchestrator';
import IframeModal from '../IframeModal';
import { handleAPIError } from '../helpers';

export const useOpenIncompatibleModal = () => {
	const setModal = useSetModal();

	return useCallback(
		async (app, actionName, cancelAction) => {
			const handleCancel = () => {
				setModal(null);
				cancelAction();
			};

			const handleConfirm = () => {
				setModal(null);
				cancelAction();
			};

			try {
				const incompatibleData = await Apps.buildIncompatibleExternalUrl(app.id, app.marketplaceVersion, actionName);
				setModal(<IframeModal url={incompatibleData.url} cancel={handleCancel} confirm={handleConfirm} />);
			} catch (e) {
				handleAPIError(e);
			}
		},
		[setModal],
	);
};
