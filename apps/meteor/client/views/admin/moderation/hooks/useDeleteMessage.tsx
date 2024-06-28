import { useEndpoint, useSetModal, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';

import GenericModal from '../../../../components/GenericModal';

const useDeleteMessage = (mid: string, rid: string, onChange: () => void) => {
	const t = useTranslation();
	const deleteMessage = useEndpoint('POST', '/v1/chat.delete');
	const dismissMessage = useEndpoint('POST', '/v1/moderation.dismissReports');
	const dispatchToastMessage = useToastMessageDispatch();
	const setModal = useSetModal();
	const queryClient = useQueryClient();

	const handleDeleteMessages = useMutation({
		mutationFn: deleteMessage,
		onError: (error) => {
			dispatchToastMessage({ type: 'error', message: error });
			setModal();
		},
		onSuccess: async () => {
			dispatchToastMessage({ type: 'success', message: t('Deleted') });
			await handleDismissMessage.mutateAsync({ msgId: mid });
		},
	});

	const handleDismissMessage = useMutation({
		mutationFn: dismissMessage,
		onError: (error) => {
			dispatchToastMessage({ type: 'error', message: error });
		},
		onSuccess: () => {
			dispatchToastMessage({ type: 'success', message: t('Moderation_Reports_dismissed') });
		},
		onSettled: () => {
			onChange();
			queryClient.invalidateQueries({ queryKey: ['moderation.reports'] });
			setModal();
		},
	});

	const onDeleteAll = async () => {
		await handleDeleteMessages.mutateAsync({ msgId: mid, roomId: rid, asUser: true });
	};

	const confirmDeletMessage = (): void => {
		setModal(
			<GenericModal
				confirmText={t('Moderation_Dismiss_and_delete')}
				title={t('Moderation_Delete_this_message')}
				variant='danger'
				onConfirm={() => onDeleteAll()}
				onCancel={() => setModal()}
			>
				{t('Moderation_Are_you_sure_you_want_to_delete_this_message')}
			</GenericModal>,
		);
	};

	return confirmDeletMessage;
};

export default useDeleteMessage;
