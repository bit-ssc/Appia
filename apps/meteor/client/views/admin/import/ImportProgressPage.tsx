import { Box, Margins, Throbber } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useToastMessageDispatch, useRoute, useEndpoint, useTranslation, useStream } from '@rocket.chat/ui-contexts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect } from 'react';

import type { ProgressStep } from './ImportTypes';
import { useErrorHandler } from './useErrorHandler';
import { ImportingStartedStates } from '../../../../app/importer/lib/ImporterProgressStep';
import { numberFormat } from '../../../../lib/utils/stringUtils';
import Page from '../../../components/Page';

const ImportProgressPage = function ImportProgressPage() {
	const queryClient = useQueryClient();
	const streamer = useStream('importers');
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();
	const handleError = useErrorHandler();

	const importHistoryRoute = useRoute('admin-import');
	const prepareImportRoute = useRoute('admin-import-prepare');

	const getCurrentImportOperation = useEndpoint('GET', '/v1/getCurrentImportOperation');
	const getImportProgress = useEndpoint('GET', '/v1/getImportProgress');

	const mutation = useMutation({
		mutationFn: async (props: { step: ProgressStep; completed: number; total: number }) => {
			queryClient.setQueryData<{
				step: ProgressStep;
				completed: number;
				total: number;
			}>(['importers', 'progress'], props);
		},
	});

	const currentOperation = useQuery(
		['ImportProgressPage', 'currentOperation'],
		async () => {
			const { operation } = await getCurrentImportOperation();
			return operation;
		},
		{
			onSuccess: ({ valid, status }) => {
				console.log('currentOperation', valid, status);
				if (!valid) {
					importHistoryRoute.push();
					return;
				}

				if (status === 'importer_done') {
					importHistoryRoute.push();
					return;
				}

				if (!(ImportingStartedStates as string[]).includes(status)) {
					prepareImportRoute.push();
				}
			},
			onError: (error) => {
				handleError(error, t('Failed_To_Load_Import_Data'));
				importHistoryRoute.push();
			},
		},
	);

	const handleProgressUpdated = useMutableCallback(
		({ key, step, completed, total }: { key: string; step: ProgressStep; completed: number; total: number }) => {
			console.log('handleProgressUpdated', key, step, completed, total);
			if (!currentOperation.isSuccess) {
				return;
			}
			if (key.toLowerCase() !== currentOperation.data.importerKey.toLowerCase()) {
				return;
			}

			const message = step[0].toUpperCase() + step.slice(1);

			switch (step) {
				case 'importer_done':
					t.has(message) &&
						dispatchToastMessage({
							type: 'success',
							message: t(message),
						});
					importHistoryRoute.push();
					return;

				case 'importer_import_failed':
				case 'importer_import_cancelled':
					t.has(message) && handleError(message);
					importHistoryRoute.push();
					return;

				default:
					mutation.mutate({ step, completed, total });
					break;
			}
		},
	);

	const progress = useQuery(
		['ImportProgressPage', 'progress'],
		async () => {
			const { key, step, count: { completed = 0, total = 0 } = {} } = await getImportProgress();
			return {
				key,
				step,
				completed,
				total,
			};
		},
		{
			refetchInterval: 1000,
			enabled: !!currentOperation.isSuccess,
			onSuccess: (progress) => {
				console.log('progress', progress);
				if (!progress) {
					dispatchToastMessage({ type: 'warning', message: t('Importer_not_in_progress') });
					prepareImportRoute.push();
					return;
				}
				handleProgressUpdated({
					key: progress.key,
					step: progress.step,
					total: progress.total,
					completed: progress.completed,
				});
			},
			onError: (error) => {
				handleError(error, t('Failed_To_Load_Import_Data'));
				importHistoryRoute.push();
			},
		},
	);

	useEffect(() => {
		return streamer('progress', ({ count: { completed, total }, ...rest }) => {
			handleProgressUpdated({ ...rest, completed, total } as any);
		});
	}, [handleProgressUpdated, streamer]);

	return (
		<Page>
			<Page.Header title={t('Importing_Data')} />

			<Page.ScrollableContentWithShadow>
				<Box marginInline='auto' marginBlock='neg-x24' width='full' maxWidth='x580'>
					<Margins block='x24'>
						{currentOperation.isLoading && <Throbber justifyContent='center' />}
						{progress.fetchStatus !== 'idle' && progress.isLoading && <Throbber justifyContent='center' />}

						{(currentOperation.isError || progress.isError) && <Box is='p'>{t('Failed_To_Load_Import_Data')}</Box>}
						{progress.isSuccess && (
							<>
								<Box is='p' fontScale='p2'>
									{t((progress.data.step[0].toUpperCase() + progress.data.step.slice(1)) as any)}
								</Box>
								<Box display='flex' justifyContent='center'>
									<Box is='progress' value={progress.data.completed} max={progress.data.total} marginInlineEnd='x24' />
									<Box is='span' fontScale='p2'>
										{progress.data.completed}/{progress.data.total} ({numberFormat(progress.data.completed / progress.data.total, 0)}
										%)
									</Box>
								</Box>
							</>
						)}
					</Margins>
				</Box>
			</Page.ScrollableContentWithShadow>
		</Page>
	);
};

export default ImportProgressPage;
