import type { App } from '@rocket.chat/core-typings';
import { Accordion } from '@rocket.chat/fuselage';
import { useEndpoint, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React from 'react';

import AppReleasesItem from './AppReleasesItem';
import AccordionLoading from '../../../AccordionLoading';

// TODO: replace useEndpointData
const AppReleases = ({ id }: { id: App['id'] }): ReactElement => {
	const getVersions = useEndpoint('GET', '/apps/:id/versions', { id });
	const dispatchToastMessage = useToastMessageDispatch();
	const t = useTranslation();

	const { data, isLoading, isFetched } = useQuery(
		['apps', id, 'versions'],
		async () => {
			const { apps } = await getVersions();

			if (apps.length === 0) {
				throw new Error(t('No_results_found'));
			}
			return apps;
		},
		{
			onError: (error) => {
				dispatchToastMessage({ type: 'error', message: error });
			},
		},
	);

	return (
		<>
			<Accordion width='100%' alignSelf='center'>
				{isLoading && <AccordionLoading />}
				{isFetched && (
					<>
						{data?.map((release) => (
							<AppReleasesItem release={release} key={release.version} />
						))}
					</>
				)}
			</Accordion>
		</>
	);
};

export default AppReleases;
