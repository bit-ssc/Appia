import type { ILivechatDepartment } from '@rocket.chat/core-typings';
import { useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import { useEndpoint } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React, { useState } from 'react';

import ArchivedItemMenu from './ArchivedItemMenu';
import DepartmentsTable from './DepartmentsTable';
import FilterByText from '../../../components/FilterByText';
import { usePagination } from '../../../components/GenericTable/hooks/usePagination';
import { useSort } from '../../../components/GenericTable/hooks/useSort';

const ArchivedDepartmentsPageWithData = (): ReactElement => {
	const [text, setText] = useState('');
	const [debouncedText = ''] = useDebouncedValue(text, 500);

	const pagination = usePagination();
	const sort = useSort<'name' | 'email' | 'active'>('name');

	const getArchivedDepartments = useEndpoint('GET', '/v1/livechat/departments/archived');

	const { data, isLoading } = useQuery(['omnichannel', 'departments', 'archived', debouncedText, pagination, sort], async () =>
		getArchivedDepartments({
			onlyMyDepartments: 'true' as const,
			text,
			sort: JSON.stringify({ [sort.sortBy]: sort.sortDirection === 'asc' ? 1 : -1 }),
			...(pagination.current && { offset: pagination.current }),
			...(pagination.itemsPerPage && { count: pagination.itemsPerPage }),
		}),
	);

	const removeButton = (dep: Omit<ILivechatDepartment, '_updatedAt'>) => <ArchivedItemMenu dep={dep} />;

	return (
		<>
			<FilterByText onChange={({ text }): void => setText(text)} />
			<DepartmentsTable data={data} sort={sort} pagination={pagination} removeButton={removeButton} loading={isLoading}></DepartmentsTable>
		</>
	);
};

export default ArchivedDepartmentsPageWithData;
