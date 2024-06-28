import type { ILivechatDepartment, ILivechatDepartmentAgents } from '@rocket.chat/core-typings';
import type { ReactElement } from 'react';
import React from 'react';

import CloseChatModal from './CloseChatModal';
import { AsyncStatePhase } from '../../../hooks/useAsyncState';
import { useEndpointData } from '../../../hooks/useEndpointData';
import { FormSkeleton } from '../Skeleton';

const CloseChatModalData = ({
	departmentId,
	visitorEmail,
	onCancel,
	onConfirm,
}: {
	departmentId: ILivechatDepartment['_id'];
	onCancel: () => void;
	visitorEmail?: string;
	onConfirm: (
		comment?: string,
		tags?: string[],
		preferences?: { omnichannelTranscriptPDF: boolean; omnichannelTranscriptEmail: boolean },
	) => Promise<void>;
}): ReactElement => {
	const { value: data, phase: state } = useEndpointData('/v1/livechat/department/:_id', { keys: { _id: departmentId } });

	if ([state].includes(AsyncStatePhase.LOADING)) {
		return <FormSkeleton />;
	}

	// TODO: chapter day: fix issue with rest typing
	// TODO: This is necessary because of a weird problem
	// There is an endpoint livechat/department/${departmentId}/agents
	// that is causing the problem. type A | type B | undefined

	return (
		<CloseChatModal
			onCancel={onCancel}
			onConfirm={onConfirm}
			visitorEmail={visitorEmail}
			department={
				(
					data as {
						department: ILivechatDepartment | null;
						agents?: ILivechatDepartmentAgents[];
					}
				).department
			}
		/>
	);
};
export default CloseChatModalData;
