import type { SelectOption } from '@rocket.chat/fuselage';
import { Accordion, Field, Select, FieldGroup, ToggleSwitch, Button, Box } from '@rocket.chat/fuselage';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useUserPreference, useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState, useMemo } from 'react';

import type { FormSectionProps } from './AccountPreferencesPage';
import { KonchatNotification } from '../../../../app/ui/client/lib/KonchatNotification';
import { useForm } from '../../../hooks/useForm';

const notificationOptionsLabelMap = {
	all: 'All_messages',
	mentions: 'Mentions',
	nothing: 'Nothing',
};

const emailNotificationOptionsLabelMap = {
	mentions: 'Email_Notification_Mode_All',
	nothing: 'Email_Notification_Mode_Disabled',
};

const PreferencesNotificationsSection = ({ onChange, commitRef, ...props }: FormSectionProps): ReactElement => {
	const t = useTranslation();

	const [notificationsPermission, setNotificationsPermission] = useState<NotificationPermission>();

	const userDesktopNotificationRequireInteraction = useUserPreference('desktopNotificationRequireInteraction');
	const userDesktopNotifications = useUserPreference('desktopNotifications');
	const userMobileNotifications = useUserPreference('pushNotifications');
	const userEmailNotificationMode = useUserPreference('emailNotificationMode') as keyof typeof emailNotificationOptionsLabelMap;
	const userReceiveLoginDetectionEmail = useUserPreference('receiveLoginDetectionEmail');

	const defaultDesktopNotifications = useSetting(
		'Accounts_Default_User_Preferences_desktopNotifications',
	) as keyof typeof notificationOptionsLabelMap;
	const defaultMobileNotifications = useSetting(
		'Accounts_Default_User_Preferences_pushNotifications',
	) as keyof typeof notificationOptionsLabelMap;
	const canChangeEmailNotification = useSetting('Accounts_AllowEmailNotifications');

	const loginEmailEnabled = useSetting('Device_Management_Enable_Login_Emails');
	const allowLoginEmailPreference = useSetting('Device_Management_Allow_Login_Email_preference');
	const showNewLoginEmailPreference = loginEmailEnabled && allowLoginEmailPreference;

	const { values, handlers, commit } = useForm(
		{
			desktopNotificationRequireInteraction: userDesktopNotificationRequireInteraction,
			desktopNotifications: userDesktopNotifications,
			pushNotifications: userMobileNotifications,
			emailNotificationMode: userEmailNotificationMode,
			receiveLoginDetectionEmail: userReceiveLoginDetectionEmail,
		},
		onChange,
	);

	const {
		desktopNotificationRequireInteraction,
		desktopNotifications,
		pushNotifications,
		emailNotificationMode,
		receiveLoginDetectionEmail,
	} = values as {
		desktopNotificationRequireInteraction: boolean;
		desktopNotifications: string | number | readonly string[];
		pushNotifications: string | number | readonly string[];
		emailNotificationMode: string;
		receiveLoginDetectionEmail: boolean;
	};

	const {
		handleDesktopNotificationRequireInteraction,
		handleDesktopNotifications,
		handlePushNotifications,
		handleEmailNotificationMode,
		handleReceiveLoginDetectionEmail,
	} = handlers;

	useEffect(() => setNotificationsPermission(window.Notification && Notification.permission), []);

	commitRef.current.notifications = commit;

	const onSendNotification = useCallback(() => {
		KonchatNotification.notify({
			payload: { sender: { _id: 'rocket.cat', username: 'rocket.cat' } },
			title: t('Desktop_Notification_Test'),
			text: t('This_is_a_desktop_notification'),
		});
	}, [t]);

	const onAskNotificationPermission = useCallback(() => {
		window.Notification && Notification.requestPermission().then((val) => setNotificationsPermission(val));
	}, []);

	const notificationOptions = useMemo(
		() => Object.entries(notificationOptionsLabelMap).map(([key, val]) => t.has(val) && [key, t(val)]),
		[t],
	) as SelectOption[];

	const desktopNotificationOptions = useMemo<SelectOption[]>((): SelectOption[] => {
		const optionsCp = notificationOptions.slice();
		optionsCp.unshift(['default', `${t('Default')} (${t(notificationOptionsLabelMap[defaultDesktopNotifications] as TranslationKey)})`]);
		return optionsCp;
	}, [defaultDesktopNotifications, notificationOptions, t]);

	const mobileNotificationOptions = useMemo(() => {
		const optionsCp = notificationOptions.slice();
		optionsCp.unshift(['default', `${t('Default')} (${t(notificationOptionsLabelMap[defaultMobileNotifications] as TranslationKey)})`]);
		return optionsCp;
	}, [defaultMobileNotifications, notificationOptions, t]);

	const emailNotificationOptions = useMemo(() => {
		const options = Object.entries(emailNotificationOptionsLabelMap).map(([key, val]) => t.has(val) && [key, t(val)]) as SelectOption[];
		options.unshift(['default', `${t('Default')} (${t(emailNotificationOptionsLabelMap[userEmailNotificationMode] as TranslationKey)})`]);
		return options;
	}, [t, userEmailNotificationMode]);

	return (
		<Accordion.Item title={t('Notifications')} {...props}>
			<FieldGroup>
				<Field>
					<Field.Label>{t('Desktop_Notifications')}</Field.Label>
					<Field.Row>
						{notificationsPermission === 'denied' && t('Desktop_Notifications_Disabled')}
						{notificationsPermission === 'granted' && (
							<>
								<Button primary onClick={onSendNotification}>
									{t('Test_Desktop_Notifications')}
								</Button>
							</>
						)}
						{notificationsPermission !== 'denied' && notificationsPermission !== 'granted' && (
							<>
								<Button primary onClick={onAskNotificationPermission}>
									{t('Enable_Desktop_Notifications')}
								</Button>
							</>
						)}
					</Field.Row>
				</Field>
				<Field>
					<Box display='flex' flexDirection='row' justifyContent='space-between' flexGrow={1}>
						<Field.Label>{t('Notification_RequireInteraction')}</Field.Label>
						<Field.Row>
							<ToggleSwitch checked={desktopNotificationRequireInteraction} onChange={handleDesktopNotificationRequireInteraction} />
						</Field.Row>
					</Box>
					<Field.Hint>{t('Only_works_with_chrome_version_greater_50')}</Field.Hint>
				</Field>
				<Field>
					<Field.Label>{t('Notification_Desktop_Default_For')}</Field.Label>
					<Field.Row>
						<Select value={desktopNotifications} onChange={handleDesktopNotifications} options={desktopNotificationOptions} />
					</Field.Row>
				</Field>
				<Field>
					<Field.Label>{t('Notification_Push_Default_For')}</Field.Label>
					<Field.Row>
						<Select value={pushNotifications} onChange={handlePushNotifications} options={mobileNotificationOptions} />
					</Field.Row>
				</Field>
				<Field>
					<Field.Label>{t('Email_Notification_Mode')}</Field.Label>
					<Field.Row>
						<Select
							disabled={!canChangeEmailNotification}
							value={emailNotificationMode}
							onChange={handleEmailNotificationMode}
							options={emailNotificationOptions}
						/>
					</Field.Row>
					<Field.Hint>
						{canChangeEmailNotification && t('You_need_to_verifiy_your_email_address_to_get_notications')}
						{!canChangeEmailNotification && t('Email_Notifications_Change_Disabled')}
					</Field.Hint>
				</Field>

				{showNewLoginEmailPreference && (
					<Field>
						<Box display='flex' flexDirection='row' justifyContent='space-between' flexGrow={1}>
							<Field.Label>{t('Receive_Login_Detection_Emails')}</Field.Label>
							<Field.Row>
								<ToggleSwitch checked={receiveLoginDetectionEmail} onChange={handleReceiveLoginDetectionEmail} />
							</Field.Row>
						</Box>
						<Field.Hint>{t('Receive_Login_Detection_Emails_Description')}</Field.Hint>
					</Field>
				)}
			</FieldGroup>
		</Accordion.Item>
	);
};

export default PreferencesNotificationsSection;
