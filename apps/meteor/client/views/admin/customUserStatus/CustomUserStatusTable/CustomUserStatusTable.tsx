import { States, StatesIcon, StatesTitle, Pagination } from '@rocket.chat/fuselage';
import { useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import { escapeRegExp } from '@rocket.chat/string-helpers';
import { useEndpoint, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement, MutableRefObject } from 'react';
import React, { useState, useMemo, useEffect } from 'react';

import CustomUserStatusRow from './CustomUserStatusRow';
import FilterByText from '../../../../components/FilterByText';
import {
	GenericTable,
	GenericTableHeader,
	GenericTableHeaderCell,
	GenericTableBody,
	GenericTableLoadingTable,
} from '../../../../components/GenericTable';
import { usePagination } from '../../../../components/GenericTable/hooks/usePagination';
import { useSort } from '../../../../components/GenericTable/hooks/useSort';

type CustomUserStatusProps = {
	reload: MutableRefObject<() => void>;
	onClick: (id: string) => void;
};

const CustomUserStatus = ({ reload, onClick }: CustomUserStatusProps): ReactElement | null => {
	const t = useTranslation();
	const [text, setText] = useState('');
	const { current, itemsPerPage, setItemsPerPage: onSetItemsPerPage, setCurrent: onSetCurrent, ...paginationProps } = usePagination();
	const { sortBy, sortDirection, setSort } = useSort<'name' | 'statusType'>('name');

	const query = useDebouncedValue(
		useMemo(
			() => ({
				query: JSON.stringify({ name: { $regex: escapeRegExp(text), $options: 'i' } }),
				sort: `{ "${sortBy}": ${sortDirection === 'asc' ? 1 : -1} }`,
				count: itemsPerPage,
				offset: current,
			}),
			[text, itemsPerPage, current, sortBy, sortDirection],
		),
		500,
	);

	const getCustomUserStatus = useEndpoint('GET', '/v1/custom-user-status.list');
	const dispatchToastMessage = useToastMessageDispatch();

	const { data, isLoading, refetch, isFetched } = useQuery(
		['custom-user-statuses', query],
		async () => {
			const { statuses } = await getCustomUserStatus(query);
			return statuses;
		},
		{
			onError: (error) => {
				dispatchToastMessage({ type: 'error', message: error });
			},
		},
	);

	useEffect(() => {
		reload.current = refetch;
	}, [reload, refetch]);

	if (!data) {
		return null;
	}

	return (
		<>
			<FilterByText onChange={({ text }): void => setText(text)} />
			{data.length === 0 && (
				<States>
					<StatesIcon name='magnifier' />
					<StatesTitle>{t('No_results_found')}</StatesTitle>
				</States>
			)}
			{data && data.length > 0 && (
				<>
					<GenericTable>
						<GenericTableHeader>
							<GenericTableHeaderCell key='name' direction={sortDirection} active={sortBy === 'name'} onClick={setSort} sort='name'>
								{t('Name')}
							</GenericTableHeaderCell>
							<GenericTableHeaderCell
								key='presence'
								direction={sortDirection}
								active={sortBy === 'statusType'}
								onClick={setSort}
								sort='statusType'
							>
								{t('Presence')}
							</GenericTableHeaderCell>
						</GenericTableHeader>
						<GenericTableBody>
							{isLoading && <GenericTableLoadingTable headerCells={2} />}
							{data?.map((status) => (
								<CustomUserStatusRow key={status._id} status={status} onClick={onClick} />
							))}
						</GenericTableBody>
					</GenericTable>
					{isFetched && (
						<Pagination
							current={current}
							itemsPerPage={itemsPerPage}
							count={data.length}
							onSetItemsPerPage={onSetItemsPerPage}
							onSetCurrent={onSetCurrent}
							{...paginationProps}
						/>
					)}
				</>
			)}
		</>
	);
};

export default CustomUserStatus;
