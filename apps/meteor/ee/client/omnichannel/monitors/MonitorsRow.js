import { Table, IconButton } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetModal, useToastMessageDispatch, useMethod, useTranslation } from '@rocket.chat/ui-contexts';
import React, { memo } from 'react';

import GenericModal from '../../../../client/components/GenericModal';

function MonitorsRow(props) {
	const { _id, name, username, emails, onDelete } = props;

	const setModal = useSetModal();

	const dispatchToastMessage = useToastMessageDispatch();

	const t = useTranslation();

	const removeMonitor = useMethod('livechat:removeMonitor');

	const handleRemove = useMutableCallback(() => {
		const onDeleteMonitor = async () => {
			try {
				await removeMonitor(username);
				dispatchToastMessage({ type: 'success', message: t('Monitor_removed') });
				onDelete();
			} catch (error) {
				dispatchToastMessage({ type: 'error', message: error });
			}
			setModal();
		};

		setModal(<GenericModal variant='danger' onConfirm={onDeleteMonitor} onCancel={() => setModal()} confirmText={t('Delete')} />);
	});

	return (
		<Table.Row key={_id} role='link' action tabIndex={0}>
			<Table.Cell withTruncatedText>{name}</Table.Cell>
			<Table.Cell withTruncatedText>{username}</Table.Cell>
			<Table.Cell withTruncatedText>{emails?.find(({ address }) => !!address)?.address}</Table.Cell>
			<Table.Cell withTruncatedText>
				<IconButton icon='trash' mini title={t('Remove')} onClick={handleRemove} />
			</Table.Cell>
		</Table.Row>
	);
}

export default memo(MonitorsRow);
