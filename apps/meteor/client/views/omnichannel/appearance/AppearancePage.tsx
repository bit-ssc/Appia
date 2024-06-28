import type { ISetting, Serialized } from '@rocket.chat/core-typings';
import { ButtonGroup, Button, Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useToastMessageDispatch, useMethod, useTranslation } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React from 'react';

import AppearanceForm from './AppearanceForm';
import Page from '../../../components/Page';
import { useForm } from '../../../hooks/useForm';

type LivechatAppearanceSettings = {
	Livechat_title: string;
	Livechat_title_color: string;
	Livechat_show_agent_info: boolean;
	Livechat_show_agent_email: boolean;
	Livechat_display_offline_form: boolean;
	Livechat_offline_form_unavailable: string;
	Livechat_offline_message: string;
	Livechat_offline_title: string;
	Livechat_offline_title_color: string;
	Livechat_offline_email: string;
	Livechat_offline_success_message: string;
	Livechat_registration_form: boolean;
	Livechat_name_field_registration_form: boolean;
	Livechat_email_field_registration_form: boolean;
	Livechat_registration_form_message: string;
	Livechat_conversation_finished_message: string;
	Livechat_conversation_finished_text: string;
	Livechat_enable_message_character_limit: boolean;
	Livechat_message_character_limit: number;
};

type AppearanceSettings = Partial<LivechatAppearanceSettings>;

const reduceAppearance = (settings: Serialized<ISetting>[]): AppearanceSettings =>
	settings.reduce<Partial<LivechatAppearanceSettings>>((acc, { _id, value }) => {
		acc = { ...acc, [_id]: value };
		return acc;
	}, {});

type AppearancePageProps = {
	settings: Serialized<ISetting>[];
};

const AppearancePage: FC<AppearancePageProps> = ({ settings }) => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const save = useMethod('livechat:saveAppearance');

	const { values, handlers, commit, reset, hasUnsavedChanges } = useForm(reduceAppearance(settings));

	const handleSave = useMutableCallback(async () => {
		const mappedAppearance = Object.entries(values).map(([_id, value]) => ({ _id, value }));

		try {
			await save(mappedAppearance);
			dispatchToastMessage({ type: 'success', message: t('Settings_updated') });
			commit();
		} catch (error: unknown) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	});

	const handleResetButtonClick = (): void => {
		reset();
	};

	return (
		<Page>
			<Page.Header title={t('Appearance')}>
				<ButtonGroup align='end'>
					<Button onClick={handleResetButtonClick}>{t('Reset')}</Button>
					<Button primary onClick={handleSave} disabled={!hasUnsavedChanges}>
						{t('Save')}
					</Button>
				</ButtonGroup>
			</Page.Header>
			<Page.ScrollableContentWithShadow>
				<Box maxWidth='x600' w='full' alignSelf='center'>
					<AppearanceForm values={values} handlers={handlers} />
				</Box>
			</Page.ScrollableContentWithShadow>
		</Page>
	);
};

export default AppearancePage;
