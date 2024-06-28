import { Button, ButtonGroup, Throbber } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useEndpoint, useRoute, useSetModal, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import { useQueryClient } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';

import Page from '../../../../client/components/Page';
import { useOmnichannelPriorities } from '../hooks/useOmnichannelPriorities';
import { PrioritiesResetModal } from './PrioritiesResetModal';
import { PrioritiesTable } from './PrioritiesTable';
import type { PriorityFormData } from './PriorityEditForm';
import { PriorityVerticalBar } from './PriorityVerticalBar';

type PrioritiesPageProps = {
	priorityId: string;
	context: 'edit' | undefined;
};

export const PrioritiesPage = ({ priorityId, context }: PrioritiesPageProps): ReactElement => {
	const t = useTranslation();
	const queryClient = useQueryClient();
	const prioritiesRoute = useRoute('omnichannel-priorities');

	const dispatchToastMessage = useToastMessageDispatch();
	const setModal = useSetModal();

	const [isResetting, setResetting] = useState(false);

	const savePriority = useEndpoint('PUT', `/v1/livechat/priorities/:priorityId`, { priorityId });
	const resetPriorities = useEndpoint('POST', '/v1/livechat/priorities.reset');

	const { data: priorities } = useOmnichannelPriorities();

	const isPrioritiesDirty = useMemo(() => !!priorities.length && priorities.some((p) => p.dirty), [priorities]);

	const handleReset = (): void => {
		const onReset = async (): Promise<void> => {
			try {
				setResetting(true);
				setModal(null);

				await resetPriorities();
				await queryClient.invalidateQueries(['/v1/livechat/priorities'], { exact: true });

				prioritiesRoute.push({});
				dispatchToastMessage({ type: 'success', message: t('Priorities_restored') });
			} catch (error) {
				dispatchToastMessage({ type: 'error', message: error });
			} finally {
				setResetting(false);
			}
		};

		setModal(<PrioritiesResetModal onReset={onReset} onCancel={(): void => setModal(null)} />);
	};

	const onRowClick = useMutableCallback((id: string): void => {
		prioritiesRoute.push({ context: 'edit', id });
	});

	const onVerticalBarClose = (): void => {
		prioritiesRoute.push({});
	};

	const onSavePriority = async ({ reset, ...payload }: PriorityFormData): Promise<void> => {
		await savePriority(reset ? { reset } : payload);
		await queryClient.invalidateQueries(['/v1/livechat/priorities']);

		dispatchToastMessage({ type: 'success', message: t('Priority_saved') });
		await queryClient.invalidateQueries(['/v1/livechat/priorities'], { exact: true });
		prioritiesRoute.push({});
	};

	return (
		<Page flexDirection='row'>
			<Page>
				<Page.Header title={t('Priorities')}>
					<ButtonGroup>
						<Button onClick={handleReset} title={t('Reset')} disabled={!isPrioritiesDirty || isResetting}>
							{isResetting ? <Throbber size='x12' inheritColor /> : t('Reset')}
						</Button>
					</ButtonGroup>
				</Page.Header>
				<Page.Content>
					<PrioritiesTable data={priorities} onRowClick={onRowClick} />
				</Page.Content>
			</Page>

			{context === 'edit' && (
				<PriorityVerticalBar priorityId={priorityId} context={context} onSave={onSavePriority} onClose={onVerticalBarClose} />
			)}
		</Page>
	);
};
