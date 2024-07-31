import type { ILivechatPriority, Serialized } from '@rocket.chat/core-typings';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';

import GenericTable, { GenericTableCell, GenericTableRow } from '../../../../client/components/GenericTable';
import { PriorityIcon } from './PriorityIcon';

type PrioritiesTableProps = {
	data?: Serialized<ILivechatPriority>[];
	onRowClick: (id: string) => void;
};

export const PrioritiesTable = ({ data, onRowClick }: PrioritiesTableProps): ReactElement => {
	const t = useTranslation();

	const renderRow = useCallback(
		({ _id, name, i18n, sortItem, dirty }) => (
			<GenericTableRow key={_id} tabIndex={0} role='link' onClick={(): void => onRowClick(_id)} action qa-row-id={_id}>
				<GenericTableCell withTruncatedText>
					<PriorityIcon level={sortItem} />
				</GenericTableCell>
				<GenericTableCell withTruncatedText>{dirty ? name : t(i18n)}</GenericTableCell>
			</GenericTableRow>
		),
		[onRowClick, t],
	);

	const header = useMemo(
		() => [
			<GenericTable.HeaderCell key='icon' w='100px'>
				{t('Icon')}
			</GenericTable.HeaderCell>,
			<GenericTable.HeaderCell key='name'>{t('Name')}</GenericTable.HeaderCell>,
		],
		[t],
	);

	return <GenericTable results={data} header={header} renderRow={renderRow} pagination={false} />;
};
