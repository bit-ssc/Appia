import { Callout } from '@rocket.chat/fuselage';
import { useRouteParameter, useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';

import EditCustomFieldsPage from './EditCustomFieldsPage';
import Page from '../../../components/Page';
import PageSkeleton from '../../../components/PageSkeleton';
import { AsyncStatePhase } from '../../../hooks/useAsyncState';
import { useEndpointData } from '../../../hooks/useEndpointData';

const EditCustomFieldsPageContainer = ({ reload }) => {
	const t = useTranslation();
	const id = useRouteParameter('id');

	const { value: data, phase: state, error } = useEndpointData('/v1/livechat/custom-fields/:_id', { keys: { _id: id } });

	if (state === AsyncStatePhase.LOADING) {
		return <PageSkeleton />;
	}

	if (!data || !data.success || !data.customField || error) {
		return (
			<Page>
				<Page.Header title={t('Edit_Custom_Field')} />
				<Page.ScrollableContentWithShadow>
					<Callout type='danger'>{t('Error')}</Callout>
				</Page.ScrollableContentWithShadow>
			</Page>
		);
	}

	return <EditCustomFieldsPage customField={data.customField} id={id} reload={reload} />;
};

export default EditCustomFieldsPageContainer;
