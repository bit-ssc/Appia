import { useRoute, useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useCallback } from 'react';

import AgentEditWithData from './AgentEditWithData';
import AgentInfo from './AgentInfo';
import AgentInfoActions from './AgentInfoActions';
import VerticalBar from '../../../components/VerticalBar';

const AgentsTab = ({ reload, context, id }: { reload: () => void; context: string; id: string }): ReactElement => {
	const t = useTranslation();
	const agentsRoute = useRoute('omnichannel-agents');

	const handleVerticalBarCloseButtonClick = useCallback((): void => {
		agentsRoute.push({});
	}, [agentsRoute]);

	return (
		<VerticalBar>
			<VerticalBar.Header>
				{context === 'edit' && t('Edit_User')}
				{context === 'info' && t('User_Info')}
				<VerticalBar.Close onClick={handleVerticalBarCloseButtonClick} />
			</VerticalBar.Header>

			{context === 'edit' && <AgentEditWithData uid={id} reload={reload} />}
			{context === 'info' && (
				<AgentInfo uid={id}>
					<AgentInfoActions reload={reload} />
				</AgentInfo>
			)}
		</VerticalBar>
	);
};

export default AgentsTab;
