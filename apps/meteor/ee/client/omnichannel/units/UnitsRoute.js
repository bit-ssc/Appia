import { Table } from '@rocket.chat/fuselage';
import { useDebouncedValue, useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useEndpoint, useRouteParameter, useRoute, usePermission, useTranslation } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useCallback, useState } from 'react';

import GenericTable from '../../../../client/components/GenericTable';
import NotAuthorizedPage from '../../../../client/views/notAuthorized/NotAuthorizedPage';
import { useHasLicenseModule } from '../../hooks/useHasLicenseModule';
import RemoveUnitButton from './RemoveUnitButton';
import UnitEdit from './UnitEdit';
import UnitEditWithData from './UnitEditWithData';
import UnitsPage from './UnitsPage';

const sortDir = (sortDir) => (sortDir === 'asc' ? 1 : -1);

const useQueryFilter = ({ text, itemsPerPage, current }, [column, direction]) =>
	useMemo(
		() => ({
			fields: JSON.stringify({ name: 1 }),
			text,
			sort: JSON.stringify({
				[column]: sortDir(direction),
				usernames: column === 'name' ? sortDir(direction) : undefined,
			}),
			...(itemsPerPage && { count: itemsPerPage }),
			...(current && { offset: current }),
		}),
		[text, itemsPerPage, current, column, direction],
	);

function UnitsRoute() {
	const t = useTranslation();
	const canViewUnits = usePermission('manage-livechat-units');
	const isEnterprise = useHasLicenseModule('livechat-enterprise');

	const [params, setParams] = useState({ text: '', current: 0, itemsPerPage: 25 });
	const [sort, setSort] = useState(['name', 'asc']);

	const debouncedParams = useDebouncedValue(params, 500);
	const debouncedSort = useDebouncedValue(sort, 500);
	const query = useQueryFilter(debouncedParams, debouncedSort);
	const unitsRoute = useRoute('omnichannel-units');
	const context = useRouteParameter('context');
	const id = useRouteParameter('id');

	const onHeaderClick = useMutableCallback((id) => {
		const [sortBy, sortDirection] = sort;

		if (sortBy === id) {
			setSort([id, sortDirection === 'asc' ? 'desc' : 'asc']);
			return;
		}
		setSort([id, 'asc']);
	});

	const onRowClick = useMutableCallback(
		(id) => () =>
			unitsRoute.push({
				context: 'edit',
				id,
			}),
	);

	const getUnits = useEndpoint('GET', '/v1/livechat/units', { params: query });
	const { data, refetch: reload } = useQuery(['/v1/livechat/units'], () => getUnits());

	const header = useMemo(
		() =>
			[
				<GenericTable.HeaderCell key={'name'} direction={sort[1]} active={sort[0] === 'name'} onClick={onHeaderClick} sort='name'>
					{t('Name')}
				</GenericTable.HeaderCell>,
				<GenericTable.HeaderCell
					key={'visibility'}
					direction={sort[1]}
					active={sort[0] === 'visibility'}
					onClick={onHeaderClick}
					sort='visibility'
				>
					{t('Visibility')}
				</GenericTable.HeaderCell>,
				<GenericTable.HeaderCell key={'remove'} w='x60'>
					{t('Remove')}
				</GenericTable.HeaderCell>,
			].filter(Boolean),
		[sort, onHeaderClick, t],
	);

	const renderRow = useCallback(
		({ _id, name, visibility }) => (
			<Table.Row key={_id} tabIndex={0} role='link' onClick={onRowClick(_id)} action qa-user-id={_id}>
				<Table.Cell withTruncatedText>{name}</Table.Cell>
				<Table.Cell withTruncatedText>{visibility}</Table.Cell>
				<RemoveUnitButton _id={_id} reload={reload} />
			</Table.Row>
		),
		[reload, onRowClick],
	);

	if (context === 'edit') {
		return <UnitEditWithData title={t('Edit_Unit')} unitId={id} reload={reload} allUnits={data} />;
	}

	if (context === 'new') {
		return <UnitEdit title={t('New_Unit')} reload={reload} isNew={true} />;
	}

	if (!(isEnterprise && canViewUnits)) {
		return <NotAuthorizedPage />;
	}

	return (
		<UnitsPage
			setParams={setParams}
			params={params}
			onHeaderClick={onHeaderClick}
			data={data}
			reload={reload}
			header={header}
			renderRow={renderRow}
			title={t('Units')}
		></UnitsPage>
	);
}

export default UnitsRoute;
