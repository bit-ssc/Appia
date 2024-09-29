import React, { memo } from 'react';

import { ContactContextProvider } from '../../views/contact/ContactContext';
import User from '../../views/contact/User';
import InfoPanel from '../InfoPanel';
import VerticalBar from '../VerticalBar';

function UserInfo({
	_id,
	username,
	bio,
	canViewAllInfo,
	email,
	verified,
	showRealNames,
	status,
	phone,
	customStatus,
	lastLogin,
	createdAt,
	utcOffset,
	name,
	data,
	nickname,
	actions,
	employeeID,
	importIds,
	...props
}) {
	return (
		<ContactContextProvider>
			<VerticalBar.ScrollableContent p='x24' {...props}>
				<InfoPanel>
					<InfoPanel.Section>{_id && <User id={username} style={{ padding: 0 }} includeButton={false} />}</InfoPanel.Section>
					{actions && <InfoPanel.Section>{actions}</InfoPanel.Section>}
				</InfoPanel>
			</VerticalBar.ScrollableContent>
		</ContactContextProvider>
	);
}

export default memo(UserInfo);
