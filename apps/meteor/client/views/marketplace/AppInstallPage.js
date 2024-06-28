import { Button, ButtonGroup, Icon, Field, FieldGroup, TextInput, Throbber } from '@rocket.chat/fuselage';
import {
	useSetModal,
	useRoute,
	useQueryStringParameter,
	useEndpoint,
	useUpload,
	useTranslation,
	useCurrentRoute,
	useRouteParameter,
} from '@rocket.chat/ui-contexts';
import React, { useCallback, useEffect, useState } from 'react';

import AppPermissionsReviewModal from './AppPermissionsReviewModal';
import AppUpdateModal from './AppUpdateModal';
import { useAppsReload } from './AppsContext';
import AppInstallModal from './components/AppInstallModal/AppInstallModal';
import { handleAPIError, handleInstallError } from './helpers';
import { useAppsCountQuery } from './hooks/useAppsCountQuery';
import { getManifestFromZippedApp } from './lib/getManifestFromZippedApp';
import { Apps } from '../../../ee/client/apps/orchestrator';
import Page from '../../components/Page';
import { useFileInput } from '../../hooks/useFileInput';
import { useForm } from '../../hooks/useForm';

const placeholderUrl = 'https://rocket.chat/apps/package.zip';

function AppInstallPage() {
	const t = useTranslation();

	const reload = useAppsReload();

	const [currentRouteName] = useCurrentRoute();
	if (!currentRouteName) {
		throw new Error('No current route name');
	}

	const router = useRoute(currentRouteName);
	const upgradeRoute = useRoute('upgrade');

	const context = useRouteParameter('context');

	const setModal = useSetModal();

	const appId = useQueryStringParameter('id');
	const queryUrl = useQueryStringParameter('url');

	const [installing, setInstalling] = useState(false);

	const endpointAddress = appId ? `/apps/${appId}` : '/apps';
	const downloadApp = useEndpoint('POST', endpointAddress);
	const uploadAppEndpoint = useUpload(endpointAddress);
	const uploadUpdateApp = useUpload(`${endpointAddress}/update`);

	const appCountQuery = useAppsCountQuery('private');

	const { values, handlers } = useForm({
		file: {},
		url: queryUrl,
	});

	const { file, url } = values;

	const canSave = !!url || !!file.name;

	const { handleFile, handleUrl } = handlers;

	useEffect(() => {
		queryUrl && handleUrl(queryUrl);
	}, [queryUrl, handleUrl]);

	const [handleUploadButtonClick] = useFileInput(handleFile, 'app');

	const sendFile = async (permissionsGranted, appFile, appId) => {
		let app;
		const fileData = new FormData();
		fileData.append('app', appFile, appFile.name);
		fileData.append('permissions', JSON.stringify(permissionsGranted));

		try {
			if (appId) {
				await uploadUpdateApp(fileData);
			} else {
				app = await uploadAppEndpoint(fileData);
			}
		} catch (e) {
			handleAPIError(e);
		}

		router.push({ context: 'private', page: 'info', id: appId || app.app.id });

		reload();

		setInstalling(false);
		setModal(null);
	};

	const cancelAction = useCallback(() => {
		setInstalling(false);
		setModal(null);
	}, [setInstalling, setModal]);

	const isAppInstalled = async (appId) => {
		try {
			const app = await Apps.getApp(appId);
			return !!app || false;
		} catch (e) {
			return false;
		}
	};

	const handleAppPermissionsReview = async (permissions, appFile, appId) => {
		setModal(
			<AppPermissionsReviewModal
				appPermissions={permissions}
				onCancel={cancelAction}
				onConfirm={(permissionsGranted) => sendFile(permissionsGranted, appFile, appId)}
			/>,
		);
	};

	const uploadFile = async (appFile, { id, permissions }) => {
		const isInstalled = await isAppInstalled(id);

		if (isInstalled) {
			return setModal(<AppUpdateModal cancel={cancelAction} confirm={() => handleAppPermissionsReview(permissions, appFile, id)} />);
		}

		await handleAppPermissionsReview(permissions, appFile);
	};

	const getAppFileAndManifest = async () => {
		try {
			let manifest;
			let appFile;
			if (url) {
				const { buff } = await downloadApp({ url, downloadOnly: true });
				const fileData = Uint8Array.from(buff.data);
				manifest = await getManifestFromZippedApp(fileData);
				appFile = new File([fileData], 'app.zip', { type: 'application/zip' });
			} else {
				appFile = file;
				manifest = await getManifestFromZippedApp(appFile);
			}

			return { appFile, manifest };
		} catch (error) {
			handleInstallError(error);

			return { appFile: null, manifest: null };
		}
	};

	const install = async () => {
		setInstalling(true);

		if (!appCountQuery.data) {
			return cancelAction();
		}

		const { appFile, manifest } = await getAppFileAndManifest();

		if (!appFile || !manifest) {
			return cancelAction();
		}

		if (appCountQuery.data.hasUnlimitedApps) {
			return uploadFile(appFile, manifest);
		}

		setModal(
			<AppInstallModal
				context={context}
				enabled={appCountQuery.data.enabled}
				limit={appCountQuery.data.limit}
				appName={manifest.name}
				handleClose={cancelAction}
				handleConfirm={() => uploadFile(appFile, manifest)}
				handleEnableUnlimitedApps={() => {
					upgradeRoute.push({ type: 'go-fully-featured-registered' });
					setModal(null);
				}}
			/>,
		);
	};

	const handleCancel = () => {
		router.push({ context, page: 'list' });
	};

	return (
		<Page flexDirection='column'>
			<Page.Header title={t('App_Installation')} />
			<Page.ScrollableContent>
				<FieldGroup display='flex' flexDirection='column' alignSelf='center' maxWidth='x600' w='full'>
					<Field>
						<Field.Label>{t('App_Url_to_Install_From')}</Field.Label>
						<Field.Row>
							<TextInput placeholder={placeholderUrl} value={url} onChange={handleUrl} addon={<Icon name='permalink' size='x20' />} />
						</Field.Row>
					</Field>
					<Field>
						<Field.Label>{t('App_Url_to_Install_From_File')}</Field.Label>
						<Field.Row>
							<TextInput
								value={file.name || ''}
								addon={
									<Button small primary onClick={handleUploadButtonClick} mb='neg-x4' mie='neg-x8'>
										<Icon name='upload' size='x12' />
										{t('Browse_Files')}
									</Button>
								}
							/>
						</Field.Row>
					</Field>
					<Field>
						<ButtonGroup>
							<Button disabled={!canSave || installing} onClick={install}>
								{!installing && t('Install')}
								{installing && <Throbber inheritColor />}
							</Button>
							<Button onClick={handleCancel}>{t('Cancel')}</Button>
						</ButtonGroup>
					</Field>
				</FieldGroup>
			</Page.ScrollableContent>
		</Page>
	);
}

export default AppInstallPage;
