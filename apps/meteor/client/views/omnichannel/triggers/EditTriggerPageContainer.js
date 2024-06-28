import { Callout } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';

import EditTriggerPage from './EditTriggerPage';
import PageSkeleton from '../../../components/PageSkeleton';
import { AsyncStatePhase } from '../../../hooks/useAsyncState';
import { useEndpointData } from '../../../hooks/useEndpointData';

const EditTriggerPageContainer = ({ id, onSave }) => {
	const t = useTranslation();
	const { value: data, phase: state } = useEndpointData('/v1/livechat/triggers/:_id', { keys: { _id: id } });

	if (state === AsyncStatePhase.LOADING) {
		return <PageSkeleton />;
	}

	if (state === AsyncStatePhase.REJECTED || !data?.trigger) {
		return <Callout>{t('Error')}: error</Callout>;
	}

	return <EditTriggerPage data={data.trigger} onSave={onSave} />;
};

export default EditTriggerPageContainer;
