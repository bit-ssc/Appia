import { Sidebar } from '@rocket.chat/fuselage';
import { useUser, useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { memo } from 'react';

// import Administration from './actions/Administration';
import CreateRoom from './actions/CreateRoom';
// import Directory from './actions/Directory';
// import Home from './actions/Home';
import Login from './actions/Login';
import Search from './actions/Search';
// import Sort from './actions/Sort';

const TopBarSection: React.FC<{ className?: string }> = ({ children, className }) => (
	<Sidebar.TopBar className={['rcx-sidebar-topbar--section', className].filter(Boolean).join(' ')}>
		<Sidebar.TopBar.Wrapper children={children} />
	</Sidebar.TopBar>
);

// TODO: Remove styles from here
const HeaderWithData = (): ReactElement => {
	const user = useUser();
	const t = useTranslation();

	return (
		<TopBarSection style={{ flexShrink: 0 }}>
			<Search title={t('Search')} />
			<Sidebar.TopBar.Actions>
				{/* <Home title={t('Home')} />*/}
				{user && (
					<>
						{/* <Directory title={t('Directory')} />*/}
						{/* <Sort title={t('Display')} />*/}
						<CreateRoom title={t('Create_new')} data-qa='sidebar-create' />
						{/* <Administration title={t('Administration')} />*/}
					</>
				)}
				{!user && <Login title={t('Login')} />}
			</Sidebar.TopBar.Actions>
		</TopBarSection>
	);
};

export default memo(HeaderWithData);
