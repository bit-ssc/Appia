import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import {
	useToastMessageDispatch,
	useSessionDispatch,
	useLoginWithPassword,
	useSettingSetValue,
	useSettingsDispatch,
	useMethod,
	useEndpoint,
	useTranslation,
} from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import type { ReactElement, ContextType } from 'react';
import React, { useCallback, useMemo, useState } from 'react';

import { callbacks } from '../../../../lib/callbacks';
import { validateEmail } from '../../../../lib/emailValidator';
import { queryClient } from '../../../lib/queryClient';
import { SetupWizardContext } from '../contexts/SetupWizardContext';
import { useParameters } from '../hooks/useParameters';
import { useStepRouting } from '../hooks/useStepRouting';

const initialData: ContextType<typeof SetupWizardContext>['setupWizardData'] = {
	organizationData: {
		organizationName: '',
		organizationIndustry: '',
		organizationSize: '',
		country: '',
	},
	serverData: {
		agreement: false,
		email: '',
		registerType: 'registered',
		updates: false,
	},
	registrationData: { cloudEmail: '', device_code: '', user_code: '' },
};

type HandleRegisterServer = (params: { email: string; resend?: boolean }) => Promise<void>;

const SetupWizardProvider = ({ children }: { children: ReactElement }): ReactElement => {
	const t = useTranslation();
	const [setupWizardData, setSetupWizardData] = useState<ContextType<typeof SetupWizardContext>['setupWizardData']>(initialData);
	const [currentStep, setCurrentStep] = useStepRouting();
	const { isSuccess, data } = useParameters();
	const [offline, setOffline] = useState(false);
	const dispatchToastMessage = useToastMessageDispatch();
	const dispatchSettings = useSettingsDispatch();

	const setShowSetupWizard = useSettingSetValue('Show_Setup_Wizard');
	const registerUser = useMethod('registerUser');
	const defineUsername = useMethod('setUsername');
	const loginWithPassword = useLoginWithPassword();
	const setForceLogin = useSessionDispatch('forceLogin');
	const registerPreIntentEndpoint = useEndpoint('POST', '/v1/cloud.registerPreIntent');
	const createRegistrationIntent = useEndpoint('POST', '/v1/cloud.createRegistrationIntent');

	const goToPreviousStep = useCallback(() => setCurrentStep((currentStep) => currentStep - 1), [setCurrentStep]);
	const goToNextStep = useCallback(() => setCurrentStep((currentStep) => currentStep + 1), [setCurrentStep]);
	const goToStep = useCallback((step) => setCurrentStep(() => step), [setCurrentStep]);

	const _validateEmail = useCallback(
		(email: string): true | string => {
			if (!validateEmail(email)) {
				return t('Invalid_email');
			}

			return true;
		},
		[t],
	);

	const registerAdminUser = useCallback(
		async ({ fullname, username, email, password }): Promise<void> => {
			await registerUser({ name: fullname, username, email, pass: password });
			callbacks.run('userRegistered', {});

			try {
				await loginWithPassword(email, password);
			} catch (error) {
				if (error instanceof Meteor.Error && error.error === 'error-invalid-email') {
					dispatchToastMessage({ type: 'success', message: t('We_have_sent_registration_email') });
					return;
				}
				if (error instanceof Error || typeof error === 'string') {
					dispatchToastMessage({ type: 'error', message: error });
				}
				throw error;
			}

			setForceLogin(false);

			await defineUsername(username);
			await dispatchSettings([{ _id: 'Organization_Email', value: email }]);
			callbacks.run('usernameSet', {});
		},
		[registerUser, setForceLogin, defineUsername, dispatchSettings, loginWithPassword, dispatchToastMessage, t],
	);

	const saveWorkspaceData = useCallback(async (): Promise<void> => {
		const {
			serverData: { updates, agreement },
		} = setupWizardData;

		await dispatchSettings([
			{
				_id: 'Statistics_reporting',
				value: true,
			},
			{
				_id: 'Register_Server',
				value: true,
			},
			{
				_id: 'Allow_Marketing_Emails',
				value: updates,
			},
			{
				_id: 'Cloud_Service_Agree_PrivacyTerms',
				value: agreement,
			},
		]);
	}, [dispatchSettings, setupWizardData]);

	const saveOrganizationData = useCallback(async (): Promise<void> => {
		const {
			organizationData: { organizationName, organizationIndustry, organizationSize, country },
		} = setupWizardData;

		await dispatchSettings([
			{
				_id: 'Country',
				value: country,
			},
			{
				_id: 'Industry',
				value: organizationIndustry,
			},
			{
				_id: 'Size',
				value: organizationSize,
			},
			{
				_id: 'Organization_Name',
				value: organizationName,
			},
		]);
	}, [dispatchSettings, setupWizardData]);

	const registerServer: HandleRegisterServer = useMutableCallback(async ({ email, resend = false }): Promise<void> => {
		try {
			await saveOrganizationData();
			const { intentData } = await createRegistrationIntent({ resend, email });
			queryClient.invalidateQueries(['licenses']);
			queryClient.invalidateQueries(['getRegistrationStatus']);

			setSetupWizardData((prevState) => ({
				...prevState,
				registrationData: { ...intentData, cloudEmail: email },
			}));

			goToStep(4);
			setShowSetupWizard('in_progress');
		} catch (e) {
			console.log(e);
		}
	});

	const registerPreIntent = useMutableCallback(async (): Promise<void> => {
		await saveOrganizationData();
		try {
			const { offline } = await registerPreIntentEndpoint();
			setOffline(offline);
		} catch (_) {
			setOffline(true);
		}
	});

	const completeSetupWizard = useMutableCallback(async (): Promise<void> => {
		await saveOrganizationData();
		dispatchToastMessage({ type: 'success', message: t('Your_workspace_is_ready') });
		return setShowSetupWizard('completed');
	});

	const value = useMemo(
		() => ({
			setupWizardData,
			setSetupWizardData,
			currentStep,
			loaded: isSuccess,
			settings: data.settings,
			skipCloudRegistration: data.serverAlreadyRegistered,
			goToPreviousStep,
			goToNextStep,
			goToStep,
			offline,
			registerPreIntent,
			registerAdminUser,
			validateEmail: _validateEmail,
			registerServer,
			saveWorkspaceData,
			saveOrganizationData,
			completeSetupWizard,
			maxSteps: data.serverAlreadyRegistered ? 2 : 3,
		}),
		[
			setupWizardData,
			currentStep,
			isSuccess,
			data.settings,
			data.serverAlreadyRegistered,
			goToPreviousStep,
			goToNextStep,
			goToStep,
			offline,
			registerAdminUser,
			registerPreIntent,
			_validateEmail,
			registerServer,
			saveWorkspaceData,
			saveOrganizationData,
			completeSetupWizard,
		],
	);

	return <SetupWizardContext.Provider value={value}>{children}</SetupWizardContext.Provider>;
};

export default SetupWizardProvider;
