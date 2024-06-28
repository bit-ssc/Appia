import type { IServerInfo, IStats, Serialized } from '@rocket.chat/core-typings';
import { Box, Button, ButtonGroup, Callout, Grid, Icon } from '@rocket.chat/fuselage';
import type { IInstance } from '@rocket.chat/rest-typings';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { memo } from 'react';

import DeploymentCard from './DeploymentCard';
import FederationCard from './FederationCard';
import LicenseCard from './LicenseCard';
import UsageCard from './UsageCard';
import SeatsCard from '../../../../ee/client/views/admin/info/SeatsCard';
import Page from '../../../components/Page';
import { useIsEnterprise } from '../../../hooks/useIsEnterprise';

type InformationPageProps = {
	canViewStatistics: boolean;
	info: IServerInfo;
	statistics: IStats;
	instances: Serialized<IInstance[]>;
	onClickRefreshButton: () => void;
	onClickDownloadInfo: () => void;
};

const InformationPage = memo(function InformationPage({
	canViewStatistics,
	info,
	statistics,
	instances,
	onClickRefreshButton,
	onClickDownloadInfo,
}: InformationPageProps) {
	const t = useTranslation();

	const { data } = useIsEnterprise();

	if (!info) {
		return null;
	}

	const warningMultipleInstances = !data?.isEnterprise && !statistics?.msEnabled && statistics?.instanceCount > 1;
	const alertOplogForMultipleInstances = warningMultipleInstances && !statistics.oplogEnabled;

	return (
		<Page data-qa='admin-info' bg='tint'>
			<Page.Header title={t('Info')}>
				{canViewStatistics && (
					<ButtonGroup>
						<Button type='button' onClick={onClickDownloadInfo}>
							<Icon name='download' /> {t('Download_Info')}
						</Button>
						<Button primary type='button' onClick={onClickRefreshButton}>
							<Icon name='reload' /> {t('Refresh')}
						</Button>
					</ButtonGroup>
				)}
			</Page.Header>

			<Page.ScrollableContentWithShadow>
				<Box marginBlock='none' marginInline='auto' width='full' color='default'>
					{warningMultipleInstances && (
						<Callout type='warning' title={t('Multiple_monolith_instances_alert')} marginBlockEnd='x16'></Callout>
					)}
					{alertOplogForMultipleInstances && (
						<Callout
							type='danger'
							title={t('Error_RocketChat_requires_oplog_tailing_when_running_in_multiple_instances')}
							marginBlockEnd='x16'
						>
							<Box withRichContent>
								<p>{t('Error_RocketChat_requires_oplog_tailing_when_running_in_multiple_instances_details')}</p>
								<p>
									<a
										rel='noopener noreferrer'
										target='_blank'
										href={
											'https://rocket.chat/docs/installation/manual-installation/multiple-instances-to-improve-' +
											'performance/#running-multiple-instances-per-host-to-improve-performance'
										}
									>
										{t('Click_here_for_more_info')}
									</a>
								</p>
							</Box>
						</Callout>
					)}

					<Grid>
						<Grid.Item xl={3}>
							<DeploymentCard info={info} statistics={statistics} instances={instances} />
						</Grid.Item>
						<Grid.Item xl={3}>
							<LicenseCard />
						</Grid.Item>
						<Grid.Item xl={6} md={8} xs={4} sm={8}>
							<UsageCard vertical={false} statistics={statistics} />
						</Grid.Item>
						<Grid.Item xl={6}>
							<FederationCard />
						</Grid.Item>
						<Grid.Item xl={3}>
							<SeatsCard />
						</Grid.Item>
					</Grid>
				</Box>
			</Page.ScrollableContentWithShadow>
		</Page>
	);
});

export default InformationPage;
