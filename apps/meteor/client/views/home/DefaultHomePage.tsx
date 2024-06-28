import { Box, Grid } from '@rocket.chat/fuselage';
import { useAtLeastOnePermission, useSetting, useTranslation, useRole, usePermission } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import HomePageHeader from './HomePageHeader';
import HomepageGridItem from './HomepageGridItem';
import AddUsersCard from './cards/AddUsersCard';
import CreateChannelsCard from './cards/CreateChannelsCard';
import CustomContentCard from './cards/CustomContentCard';
import DesktopAppsCard from './cards/DesktopAppsCard';
import DocumentationCard from './cards/DocumentationCard';
import JoinRoomsCard from './cards/JoinRoomsCard';
import MobileAppsCard from './cards/MobileAppsCard';
import Page from '../../components/Page/Page';
import PageScrollableContent from '../../components/Page/PageScrollableContent';

const CREATE_CHANNEL_PERMISSIONS = ['create-c', 'create-p'];

const DefaultHomePage = (): ReactElement => {
	const t = useTranslation();
	const canAddUsers = usePermission('view-user-administration');
	const isAdmin = useRole('admin');
	const canCreateChannel = useAtLeastOnePermission(CREATE_CHANNEL_PERMISSIONS);
	const workspaceName = useSetting('Site_Name');
	const isCustomContentBodyEmpty = useSetting('Layout_Home_Body') === '';
	const isCustomContentVisible = Boolean(useSetting('Layout_Home_Custom_Block_Visible'));

	return (
		<Page color='default' is='main' data-qa='page-home' data-qa-type='default' background='tint'>
			<HomePageHeader />
			<PageScrollableContent>
				<Box is='h2' fontScale='h1' mb='x20' role='heading' data-qa-id='homepage-welcome-text'>
					{t('Welcome_to', { Site_Name: workspaceName || 'Rocket.Chat' })}
				</Box>
				<Box is='h3' fontScale='h3' mb='x16'>
					{t('Some_ideas_to_get_you_started')}
				</Box>
				<Grid margin='neg-x8'>
					{canAddUsers && (
						<HomepageGridItem>
							<AddUsersCard />
						</HomepageGridItem>
					)}
					{canCreateChannel && (
						<HomepageGridItem>
							<CreateChannelsCard />
						</HomepageGridItem>
					)}
					<HomepageGridItem>
						<JoinRoomsCard />
					</HomepageGridItem>
					<HomepageGridItem>
						<MobileAppsCard />
					</HomepageGridItem>
					<HomepageGridItem>
						<DesktopAppsCard />
					</HomepageGridItem>
					<HomepageGridItem>
						<DocumentationCard />
					</HomepageGridItem>
				</Grid>
				{(isAdmin || (isCustomContentVisible && !isCustomContentBodyEmpty)) && (
					<Box pbs='x16' mbe='x32'>
						<CustomContentCard />
					</Box>
				)}
			</PageScrollableContent>
		</Page>
	);
};

export default DefaultHomePage;
