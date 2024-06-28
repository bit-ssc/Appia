import { Button, Icon, Pagination, States, StatesIcon, StatesActions, StatesAction, StatesTitle } from '@rocket.chat/fuselage';
import { useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import { escapeRegExp } from '@rocket.chat/string-helpers';
import { useRoute, useRouteParameter, usePermission, useTranslation, useEndpoint, useToastMessageDispatch } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React, { useMemo, useState, useCallback } from 'react';

import AddCustomSound from './AddCustomSound';
import CustomSoundRow from './CustomSoundRow';
import EditCustomSound from './EditCustomSound';
import FilterByText from '../../../components/FilterByText';
import { GenericTable } from '../../../components/GenericTable/V2/GenericTable';
import { GenericTableBody } from '../../../components/GenericTable/V2/GenericTableBody';
import { GenericTableHeader } from '../../../components/GenericTable/V2/GenericTableHeader';
import { GenericTableHeaderCell } from '../../../components/GenericTable/V2/GenericTableHeaderCell';
import { GenericTableLoadingTable } from '../../../components/GenericTable/V2/GenericTableLoadingTable';
import { usePagination } from '../../../components/GenericTable/hooks/usePagination';
import { useSort } from '../../../components/GenericTable/hooks/useSort';
import Page from '../../../components/Page';
import VerticalBar from '../../../components/VerticalBar';
import NotAuthorizedPage from '../../notAuthorized/NotAuthorizedPage';

const CustomSoundsRoute = (): ReactElement => {
	const t = useTranslation();
	const id = useRouteParameter('id');
	const route = useRoute('custom-sounds');
	const context = useRouteParameter('context');
	const canManageCustomSounds = usePermission('manage-sounds');

	const { sortBy, sortDirection, setSort } = useSort<'name'>('name');
	const { current, itemsPerPage, setItemsPerPage: onSetItemsPerPage, setCurrent: onSetCurrent, ...paginationProps } = usePagination();

	const [text, setParams] = useState('');

	const query = useDebouncedValue(
		useMemo(
			() => ({
				query: JSON.stringify({ name: { $regex: escapeRegExp(text), $options: 'i' } }),
				sort: `{ "${sortBy}": ${sortDirection === 'asc' ? 1 : -1} }`,
				...(itemsPerPage && { count: itemsPerPage }),
				...(current && { offset: current }),
			}),
			[text, itemsPerPage, current, sortBy, sortDirection],
		),
		500,
	);

	const getSounds = useEndpoint('GET', '/v1/custom-sounds.list');
	const dispatchToastMessage = useToastMessageDispatch();

	const { data, refetch, isLoading, isError, isSuccess } = useQuery(
		['custom-sounds', query],
		async () => {
			const { sounds } = await getSounds(query);

			return sounds;
		},
		{
			onError: (error) => {
				dispatchToastMessage({ type: 'error', message: error });
			},
		},
	);

	const handleItemClick = useCallback(
		(_id) => (): void => {
			route.push({
				context: 'edit',
				id: _id,
			});
		},
		[route],
	);

	const handleNewButtonClick = useCallback(() => {
		route.push({ context: 'new' });
	}, [route]);

	const handleClose = useCallback(() => {
		route.push({});
	}, [route]);

	const handleChange = useCallback(() => {
		refetch();
	}, [refetch]);

	const headers = useMemo(
		() => [
			<GenericTableHeaderCell key='name' direction={sortDirection} active={sortBy === 'name'} onClick={setSort} sort='name'>
				{t('Name')}
			</GenericTableHeaderCell>,
			<GenericTableHeaderCell w='x40' key='action' />,
		],
		[setSort, sortBy, sortDirection, t],
	);

	if (!canManageCustomSounds) {
		return <NotAuthorizedPage />;
	}

	return (
		<Page flexDirection='row'>
			<Page name='admin-custom-sounds'>
				<Page.Header title={t('Custom_Sounds')}>
					<Button primary onClick={handleNewButtonClick} aria-label={t('New')}>
						<Icon name='plus' /> {t('New')}
					</Button>
				</Page.Header>
				<Page.Content>
					<>
						<FilterByText onChange={({ text }): void => setParams(text)} />
						{isLoading && (
							<GenericTable>
								<GenericTableHeader>{headers}</GenericTableHeader>
								<GenericTableBody>
									<GenericTableLoadingTable headerCells={2} />
								</GenericTableBody>
							</GenericTable>
						)}
						{isSuccess && data && data.length > 0 && (
							<>
								<GenericTable>
									<GenericTableHeader>{headers}</GenericTableHeader>
									<GenericTableBody>
										{data?.map((sound) => (
											<CustomSoundRow key={sound._id} sound={sound} onClick={handleItemClick} />
										))}
									</GenericTableBody>
								</GenericTable>
								<Pagination
									divider
									current={current}
									itemsPerPage={itemsPerPage}
									count={data.length || 0}
									onSetItemsPerPage={onSetItemsPerPage}
									onSetCurrent={onSetCurrent}
									{...paginationProps}
								/>
							</>
						)}
						{isSuccess && data?.length === 0 && (
							<States>
								<StatesIcon name='magnifier' />
								<StatesTitle>{t('No_results_found')}</StatesTitle>
							</States>
						)}

						{isError && (
							<States>
								<StatesIcon name='warning' variation='danger' />
								<StatesTitle>{t('Something_went_wrong')}</StatesTitle>
								<StatesActions>
									<StatesAction onClick={() => refetch()}>{t('Reload_page')}</StatesAction>
								</StatesActions>
							</States>
						)}
					</>
				</Page.Content>
			</Page>
			{context && (
				<VerticalBar flexShrink={0}>
					<VerticalBar.Header>
						{context === 'edit' && <VerticalBar.Text>{t('Custom_Sound_Edit')}</VerticalBar.Text>}
						{context === 'new' && <VerticalBar.Text>{t('Custom_Sound_Add')}</VerticalBar.Text>}
						<VerticalBar.Close onClick={handleClose} />
					</VerticalBar.Header>
					{context === 'edit' && <EditCustomSound _id={id} close={handleClose} onChange={handleChange} />}
					{context === 'new' && <AddCustomSound goToNew={handleItemClick} close={handleClose} onChange={handleChange} />}
				</VerticalBar>
			)}
		</Page>
	);
};

export default CustomSoundsRoute;
