import { Random } from '@rocket.chat/random';

import { settingsRegistry } from '../../../settings/server';
import './email';
import { MessageTypesValues } from '../../lib/MessageTypes';

// Insert server unique id if it doesn't exist
void settingsRegistry.add('uniqueID', process.env.DEPLOYMENT_ID || Random.id(), {
	public: true,
});

void settingsRegistry.add('Initial_Channel_Created', false, {
	type: 'boolean',
	hidden: true,
});

// When you define a setting and want to add a description, you don't need to automatically define the i18nDescription
// if you add a node to the i18n.json with the same setting name but with `_Description` it will automatically work.

void settingsRegistry.addGroup('Accounts', async function () {
	await this.add('Accounts_AllowAnonymousRead', false, {
		type: 'boolean',
		public: true,
	});
	await this.add('Accounts_AllowAnonymousWrite', false, {
		type: 'boolean',
		public: true,
		enableQuery: {
			_id: 'Accounts_AllowAnonymousRead',
			value: true,
		},
	});
	await this.add('Accounts_AllowDeleteOwnAccount', false, {
		type: 'boolean',
		public: true,
		enableQuery: {
			_id: 'Accounts_AllowUserProfileChange',
			value: true,
		},
	});
	await this.add('Accounts_AllowUserProfileChange', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('Accounts_AllowUserAvatarChange', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('Accounts_AllowRealNameChange', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('Accounts_AllowUserStatusMessageChange', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('Accounts_AllowUsernameChange', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('Accounts_AllowEmailChange', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('Accounts_AllowPasswordChange', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('Accounts_AllowPasswordChangeForOAuthUsers', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('Accounts_AllowEmailNotifications', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('Accounts_CustomFieldsToShowInUserInfo', '', {
		type: 'string',
		public: true,
	});
	await this.add('Accounts_LoginExpiration', 90, {
		type: 'int',
		public: true,
	});
	await this.add('Accounts_EmailOrUsernamePlaceholder', '', {
		type: 'string',
		public: true,
		i18nLabel: 'Placeholder_for_email_or_username_login_field',
	});
	await this.add('Accounts_PasswordPlaceholder', '', {
		type: 'string',
		public: true,
		i18nLabel: 'Placeholder_for_password_login_field',
	});

	await this.add('Accounts_ConfirmPasswordPlaceholder', '', {
		type: 'string',
		public: true,
		i18nLabel: 'Placeholder_for_password_login_confirm_field',
	});
	await this.add('Accounts_ForgetUserSessionOnWindowClose', false, {
		type: 'boolean',
		public: true,
	});
	await this.add('Accounts_SearchFields', 'username, name, bio, nickname', {
		type: 'string',
	});
	await this.add('Accounts_Directory_DefaultView', 'channels', {
		type: 'select',
		values: [
			{
				key: 'channels',
				i18nLabel: 'Channels',
			},
			{
				key: 'users',
				i18nLabel: 'Users',
			},
		],
		public: true,
	});
	await this.add('Accounts_AllowInvisibleStatusOption', true, {
		type: 'boolean',
		public: true,
		i18nLabel: 'Accounts_AllowInvisibleStatusOption',
	});

	await this.section('短信登录', async function () {
		await this.add('Accounts_Sms_Countdown_Time', 60, {
			type: 'int',
			public: true,
			i18nLabel: '倒计时时间',
		});

		await this.add('Accounts_Sms_Expire_Time', 120, {
			type: 'int',
			public: true,
			i18nLabel: '过期时间',
		});
	});

	await this.section('获取短信登录验证码', async function () {
		await this.add('Accounts_Sms_Verification_Code_Scene', '', {
			type: 'string',
			public: false,
			i18nLabel: '使用场景',
		});

		await this.add('Accounts_Sms_Verification_Code_App_Key', '', {
			type: 'string',
			public: false,
			i18nLabel: 'AppKey',
		});

		await this.add('Accounts_Sms_Verification_Code_Access_Key_Id', '', {
			type: 'string',
			public: false,
			i18nLabel: 'AccessKeyId',
		});

		await this.add('Accounts_Sms_Verification_Code_Access_Key_Secret', '', {
			type: 'string',
			public: false,
			i18nLabel: 'AccessKeySecret',
		});

		await this.add('Accounts_Sms_Verification_Code_Endpoint', 'afs.aliyuncs.com', {
			type: 'string',
			public: false,
			i18nLabel: 'endpoint',
		});

		await this.add('Accounts_Sms_Verification_Code_RegionId', 'cn-hangzhou', {
			type: 'string',
			public: false,
			i18nLabel: 'regionId',
		});
	});

	await this.section('Registration', async function () {
		await this.add('Accounts_Send_Email_When_Activating', true, {
			type: 'boolean',
		});
		await this.add('Accounts_Send_Email_When_Deactivating', true, {
			type: 'boolean',
		});
		await this.add('Accounts_DefaultUsernamePrefixSuggestion', 'user', {
			type: 'string',
		});
		await this.add('Accounts_RequireNameForSignUp', true, {
			// TODO rename to Accounts_RequireFullName
			type: 'boolean',
			public: true,
		});
		await this.add('Accounts_RequirePasswordConfirmation', true, {
			type: 'boolean',
			public: true,
		});
		await this.add('Accounts_EmailVerification', false, {
			type: 'boolean',
			public: true,
			enableQuery: {
				_id: 'SMTP_Host',
				value: {
					$exists: true,
					$ne: '',
				},
			},
		});
		await this.add('Accounts_Verify_Email_For_External_Accounts', true, {
			type: 'boolean',
		});
		await this.add('Accounts_ManuallyApproveNewUsers', false, {
			public: true,
			type: 'boolean',
		});
		await this.add('Accounts_AllowedDomainsList', '', {
			type: 'string',
			public: true,
		});
		await this.add('Accounts_BlockedDomainsList', '', {
			type: 'string',
		});
		await this.add('Accounts_BlockedUsernameList', '', {
			type: 'string',
		});
		await this.add('Accounts_SystemBlockedUsernameList', 'admin,administrator,system,user', {
			type: 'string',
			hidden: true,
		});
		await this.add('Manual_Entry_User_Count', 0, {
			type: 'int',
			hidden: true,
		});
		await this.add('CSV_Importer_Count', 0, {
			type: 'int',
			hidden: true,
		});
		await this.add('Hipchat_Enterprise_Importer_Count', 0, {
			type: 'int',
			hidden: true,
		});
		await this.add('Slack_Importer_Count', 0, {
			type: 'int',
			hidden: true,
		});
		await this.add('Slack_Users_Importer_Count', 0, {
			type: 'int',
			hidden: true,
		});
		await this.add('Accounts_UseDefaultBlockedDomainsList', true, {
			type: 'boolean',
		});
		await this.add('Accounts_UseDNSDomainCheck', false, {
			type: 'boolean',
		});
		await this.add('Accounts_RegistrationForm', 'Public', {
			type: 'select',
			public: true,
			values: [
				{
					key: 'Public',
					i18nLabel: 'Accounts_RegistrationForm_Public',
				},
				{
					key: 'Disabled',
					i18nLabel: 'Accounts_RegistrationForm_Disabled',
				},
				{
					key: 'Secret URL',
					i18nLabel: 'Accounts_RegistrationForm_Secret_URL',
				},
			],
		});
		await this.add('Accounts_RegistrationForm_SecretURL', Random.id(), {
			type: 'string',
			secret: true,
		});
		await this.add('Accounts_Registration_InviteUrlType', 'proxy', {
			type: 'select',
			values: [
				{
					key: 'direct',
					i18nLabel: 'Accounts_Registration_InviteUrlType_Direct',
				},
				{
					key: 'proxy',
					i18nLabel: 'Accounts_Registration_InviteUrlType_Proxy',
				},
			],
		});

		await this.add('Accounts_RegistrationForm_LinkReplacementText', 'New user registration is currently disabled', {
			type: 'string',
			public: true,
		});
		await this.add('Accounts_Registration_AuthenticationServices_Enabled', true, {
			type: 'boolean',
			public: true,
		});
		await this.add('Accounts_Registration_AuthenticationServices_Default_Roles', 'user', {
			type: 'string',
			enableQuery: {
				_id: 'Accounts_Registration_AuthenticationServices_Enabled',
				value: true,
			},
		});
		await this.add('Accounts_Registration_Users_Default_Roles', 'user', {
			type: 'string',
		});
		await this.add('Accounts_PasswordReset', true, {
			type: 'boolean',
			public: true,
		});
		await this.add('Accounts_CustomFields', '', {
			type: 'code',
			public: true,
			i18nLabel: 'Custom_Fields',
		});
	});

	await this.section('Accounts_Default_User_Preferences', async function () {
		await this.add('Accounts_Default_User_Preferences_enableAutoAway', true, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Enable_Auto_Away',
		});
		await this.add('Accounts_Default_User_Preferences_idleTimeLimit', 300, {
			type: 'int',
			public: true,
			i18nLabel: 'Idle_Time_Limit',
		});
		await this.add('Accounts_Default_User_Preferences_desktopNotificationRequireInteraction', false, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Notification_RequireInteraction',
			i18nDescription: 'Notification_RequireInteraction_Description',
		});
		await this.add('Accounts_Default_User_Preferences_desktopNotifications', 'all', {
			type: 'select',
			values: [
				{
					key: 'all',
					i18nLabel: 'All_messages',
				},
				{
					key: 'mentions',
					i18nLabel: 'Mentions',
				},
				{
					key: 'nothing',
					i18nLabel: 'Nothing',
				},
			],
			public: true,
		});
		await this.add('Accounts_Default_User_Preferences_pushNotifications', 'all', {
			type: 'select',
			values: [
				{
					key: 'all',
					i18nLabel: 'All_messages',
				},
				{
					key: 'mentions',
					i18nLabel: 'Mentions',
				},
				{
					key: 'nothing',
					i18nLabel: 'Nothing',
				},
			],
			public: true,
		});
		await this.add('Accounts_Default_User_Preferences_unreadAlert', true, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Unread_Tray_Icon_Alert',
		});
		await this.add('Accounts_Default_User_Preferences_useEmojis', true, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Use_Emojis',
		});
		await this.add('Accounts_Default_User_Preferences_convertAsciiEmoji', true, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Convert_Ascii_Emojis',
		});
		await this.add('Accounts_Default_User_Preferences_autoImageLoad', true, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Auto_Load_Images',
		});
		await this.add('Accounts_Default_User_Preferences_saveMobileBandwidth', true, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Save_Mobile_Bandwidth',
		});
		await this.add('Accounts_Default_User_Preferences_collapseMediaByDefault', false, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Collapse_Embedded_Media_By_Default',
		});
		await this.add('Accounts_Default_User_Preferences_hideUsernames', false, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Hide_usernames',
		});
		await this.add('Accounts_Default_User_Preferences_hideRoles', false, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Hide_roles',
		});
		await this.add('Accounts_Default_User_Preferences_hideFlexTab', false, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Hide_flextab',
		});
		await this.add('Accounts_Default_User_Preferences_displayAvatars', true, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Display_avatars',
		});
		await this.add('Accounts_Default_User_Preferences_sidebarGroupByType', true, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Group_by_Type',
		});
		await this.add('Accounts_Default_User_Preferences_themeAppearence', 'auto', {
			type: 'select',
			values: [
				{
					key: 'auto',
					i18nLabel: 'Theme_match_system',
				},
				{
					key: 'light',
					i18nLabel: 'Theme_light',
				},
				{
					key: 'dark',
					i18nLabel: 'Theme_dark',
				},
			],
			public: true,
			i18nLabel: 'Theme_Appearence',
		});
		await this.add('Accounts_Default_User_Preferences_sidebarViewMode', 'medium', {
			type: 'select',
			values: [
				{
					key: 'extended',
					i18nLabel: 'Extended',
				},
				{
					key: 'medium',
					i18nLabel: 'Medium',
				},
				{
					key: 'condensed',
					i18nLabel: 'Condensed',
				},
			],
			public: true,
			i18nLabel: 'Sidebar_list_mode',
		});
		await this.add('Accounts_Default_User_Preferences_sidebarDisplayAvatar', true, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Display_Avatars_Sidebar',
		});

		await this.add('Accounts_Default_User_Preferences_sidebarShowUnread', false, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Unread_on_top',
		});

		await this.add('Accounts_Default_User_Preferences_sidebarSortby', 'activity', {
			type: 'select',
			values: [
				{
					key: 'activity',
					i18nLabel: 'Activity',
				},
				{
					key: 'alphabetical',
					i18nLabel: 'Alphabetical',
				},
			],
			public: true,
			i18nLabel: 'Sort_By',
		});

		await this.add('Accounts_Default_User_Preferences_alsoSendThreadToChannel', 'default', {
			type: 'select',
			values: [
				{
					key: 'default',
					i18nLabel: 'Selected_first_reply_unselected_following_replies',
				},
				{
					key: 'always',
					i18nLabel: 'Selected_by_default',
				},
				{
					key: 'never',
					i18nLabel: 'Unselected_by_default',
				},
			],
			public: true,
			i18nLabel: 'Also_send_thread_message_to_channel_behavior',
		});

		await this.add('Accounts_Default_User_Preferences_sidebarShowFavorites', true, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Group_favorites',
		});

		await this.add('Accounts_Default_User_Preferences_sendOnEnter', 'normal', {
			type: 'select',
			values: [
				{
					key: 'normal',
					i18nLabel: 'Enter_Normal',
				},
				{
					key: 'alternative',
					i18nLabel: 'Enter_Alternative',
				},
				{
					key: 'desktop',
					i18nLabel: 'Only_On_Desktop',
				},
			],
			public: true,
			i18nLabel: 'Enter_Behaviour',
		});
		await this.add('Accounts_Default_User_Preferences_emailNotificationMode', 'mentions', {
			type: 'select',
			values: [
				{
					key: 'nothing',
					i18nLabel: 'Email_Notification_Mode_Disabled',
				},
				{
					key: 'mentions',
					i18nLabel: 'Email_Notification_Mode_All',
				},
			],
			public: true,
			i18nLabel: 'Email_Notification_Mode',
		});
		await this.add('Accounts_Default_User_Preferences_newRoomNotification', 'door', {
			type: 'select',
			values: [
				{
					key: 'none',
					i18nLabel: 'None',
				},
				{
					key: 'door',
					i18nLabel: 'Default',
				},
			],
			public: true,
			i18nLabel: 'New_Room_Notification',
		});
		await this.add('Accounts_Default_User_Preferences_newMessageNotification', 'chime', {
			type: 'select',
			values: [
				{
					key: 'none',
					i18nLabel: 'None',
				},
				{
					key: 'chime',
					i18nLabel: 'Default',
				},
			],
			public: true,
			i18nLabel: 'New_Message_Notification',
		});

		await this.add('Accounts_Default_User_Preferences_muteFocusedConversations', true, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Mute_Focused_Conversations',
		});

		await this.add('Accounts_Default_User_Preferences_notificationsSoundVolume', 100, {
			type: 'int',
			public: true,
			i18nLabel: 'Notifications_Sound_Volume',
		});

		await this.add('Accounts_Default_User_Preferences_omnichannelTranscriptEmail', false, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Omnichannel_transcript_email',
		});
	});

	await this.section('Avatar', async function () {
		await this.add('Accounts_AvatarResize', true, {
			type: 'boolean',
		});
		await this.add('Accounts_AvatarSize', 200, {
			type: 'int',
			enableQuery: {
				_id: 'Accounts_AvatarResize',
				value: true,
			},
		});

		await this.add('Accounts_AvatarExternalProviderUrl', '', {
			type: 'string',
			public: true,
		});

		await this.add('Accounts_RoomAvatarExternalProviderUrl', '', {
			type: 'string',
			public: true,
		});

		await this.add('Accounts_AvatarCacheTime', 3600, {
			type: 'int',
			i18nDescription: 'Accounts_AvatarCacheTime_description',
		});

		await this.add('Accounts_AvatarBlockUnauthenticatedAccess', false, {
			type: 'boolean',
			public: true,
		});

		return this.add('Accounts_SetDefaultAvatar', true, {
			type: 'boolean',
		});
	});

	await this.section('Password_Policy', async function () {
		await this.add('Accounts_Password_Policy_Enabled', false, {
			type: 'boolean',
		});

		const enableQuery = {
			_id: 'Accounts_Password_Policy_Enabled',
			value: true,
		};

		await this.add('Accounts_Password_Policy_MinLength', 7, {
			type: 'int',
			enableQuery,
		});

		await this.add('Accounts_Password_Policy_MaxLength', -1, {
			type: 'int',
			enableQuery,
		});

		await this.add('Accounts_Password_Policy_ForbidRepeatingCharacters', true, {
			type: 'boolean',
			enableQuery,
		});

		await this.add('Accounts_Password_Policy_ForbidRepeatingCharactersCount', 3, {
			type: 'int',
			enableQuery,
		});

		await this.add('Accounts_Password_Policy_AtLeastOneLowercase', true, {
			type: 'boolean',
			enableQuery,
		});

		await this.add('Accounts_Password_Policy_AtLeastOneUppercase', true, {
			type: 'boolean',
			enableQuery,
		});

		await this.add('Accounts_Password_Policy_AtLeastOneNumber', true, {
			type: 'boolean',
			enableQuery,
		});

		await this.add('Accounts_Password_Policy_AtLeastOneSpecialCharacter', true, {
			type: 'boolean',
			enableQuery,
		});
	});

	await this.section('Password_History', async function () {
		await this.add('Accounts_Password_History_Enabled', false, {
			type: 'boolean',
			i18nLabel: 'Enable_Password_History',
			i18nDescription: 'Enable_Password_History_Description',
		});

		const enableQuery = {
			_id: 'Accounts_Password_History_Enabled',
			value: true,
		};

		await this.add('Accounts_Password_History_Amount', 5, {
			type: 'int',
			enableQuery,
			i18nLabel: 'Password_History_Amount',
			i18nDescription: 'Password_History_Amount_Description',
		});
	});
});

void settingsRegistry.addGroup('OAuth', async function () {
	await this.section('Facebook', async function () {
		const enableQuery = {
			_id: 'Accounts_OAuth_Facebook',
			value: true,
		};
		await this.add('Accounts_OAuth_Facebook', false, {
			type: 'boolean',
			public: true,
		});
		await this.add('Accounts_OAuth_Facebook_id', '', {
			type: 'string',
			enableQuery,
		});
		await this.add('Accounts_OAuth_Facebook_secret', '', {
			type: 'string',
			enableQuery,
			secret: true,
		});
		return this.add('Accounts_OAuth_Facebook_callback_url', '_oauth/facebook', {
			type: 'relativeUrl',
			readonly: true,
			enableQuery,
		});
	});
	await this.section('Google', async function () {
		const enableQuery = {
			_id: 'Accounts_OAuth_Google',
			value: true,
		};
		await this.add('Accounts_OAuth_Google', false, {
			type: 'boolean',
			public: true,
		});
		await this.add('Accounts_OAuth_Google_id', '', {
			type: 'string',
			enableQuery,
		});
		await this.add('Accounts_OAuth_Google_secret', '', {
			type: 'string',
			enableQuery,
			secret: true,
		});
		return this.add('Accounts_OAuth_Google_callback_url', '_oauth/google', {
			type: 'relativeUrl',
			readonly: true,
			enableQuery,
		});
	});
	await this.section('GitHub', async function () {
		const enableQuery = {
			_id: 'Accounts_OAuth_Github',
			value: true,
		};
		await this.add('Accounts_OAuth_Github', false, {
			type: 'boolean',
			public: true,
		});
		await this.add('Accounts_OAuth_Github_id', '', {
			type: 'string',
			enableQuery,
		});
		await this.add('Accounts_OAuth_Github_secret', '', {
			type: 'string',
			enableQuery,
			secret: true,
		});
		return this.add('Accounts_OAuth_Github_callback_url', '_oauth/github', {
			type: 'relativeUrl',
			readonly: true,
			enableQuery,
		});
	});
	await this.section('Linkedin', async function () {
		const enableQuery = {
			_id: 'Accounts_OAuth_Linkedin',
			value: true,
		};
		await this.add('Accounts_OAuth_Linkedin', false, {
			type: 'boolean',
			public: true,
		});
		await this.add('Accounts_OAuth_Linkedin_id', '', {
			type: 'string',
			enableQuery,
		});
		await this.add('Accounts_OAuth_Linkedin_secret', '', {
			type: 'string',
			enableQuery,
			secret: true,
		});
		return this.add('Accounts_OAuth_Linkedin_callback_url', '_oauth/linkedin', {
			type: 'relativeUrl',
			readonly: true,
			enableQuery,
		});
	});
	await this.section('Meteor', async function () {
		const enableQuery = {
			_id: 'Accounts_OAuth_Meteor',
			value: true,
		};
		await this.add('Accounts_OAuth_Meteor', false, {
			type: 'boolean',
			public: true,
		});
		await this.add('Accounts_OAuth_Meteor_id', '', {
			type: 'string',
			enableQuery,
		});
		await this.add('Accounts_OAuth_Meteor_secret', '', {
			type: 'string',
			enableQuery,
			secret: true,
		});
		return this.add('Accounts_OAuth_Meteor_callback_url', '_oauth/meteor', {
			type: 'relativeUrl',
			readonly: true,
			enableQuery,
		});
	});
	await this.section('Twitter', async function () {
		const enableQuery = {
			_id: 'Accounts_OAuth_Twitter',
			value: true,
		};
		await this.add('Accounts_OAuth_Twitter', false, {
			type: 'boolean',
			public: true,
		});
		await this.add('Accounts_OAuth_Twitter_id', '', {
			type: 'string',
			enableQuery,
		});
		await this.add('Accounts_OAuth_Twitter_secret', '', {
			type: 'string',
			enableQuery,
			secret: true,
		});
		return this.add('Accounts_OAuth_Twitter_callback_url', '_oauth/twitter', {
			type: 'relativeUrl',
			readonly: true,
			enableQuery,
		});
	});
	return this.section('Proxy', async function () {
		await this.add('Accounts_OAuth_Proxy_host', 'https://oauth-proxy.rocket.chat', {
			type: 'string',
			public: true,
		});
		return this.add('Accounts_OAuth_Proxy_services', '', {
			type: 'string',
			public: true,
		});
	});
});

void settingsRegistry.addGroup('General', async function () {
	await this.add('Show_Setup_Wizard', 'pending', {
		type: 'select',
		public: true,
		readonly: true,
		values: [
			{
				key: 'pending',
				i18nLabel: 'Pending',
			},
			{
				key: 'in_progress',
				i18nLabel: 'In_progress',
			},
			{
				key: 'completed',
				i18nLabel: 'Completed',
			},
		],
	});

	await this.add(
		'Site_Url',
		typeof (global as any).__meteor_runtime_config__ !== 'undefined' && (global as any).__meteor_runtime_config__ !== null
			? (global as any).__meteor_runtime_config__.ROOT_URL
			: null,
		{
			type: 'string',
			i18nDescription: 'Site_Url_Description',
			public: true,
		},
	);
	await this.add('Site_Name', 'Rocket.Chat', {
		type: 'string',
		public: true,
		wizard: {
			step: 3,
			order: 0,
		},
	});

	await this.add('Enterprise_Name', '测试公司', {
		type: 'string',
		public: true,
	});
	await this.add('Enterprise_ID', 'TEST', {
		type: 'string',
		public: true,
	});

	await this.section('Test', async function () {
		await this.add('Appia_NoMessageBox_Robots', 'rocket.cat', {
			type: 'string',
			public: true,
		});

		await this.add('Appia_Department_Settings', '{"updateAt":0,"data":{}}', {
			type: 'string',
			public: false,
			enableQuery: {
				_id: 'true',
				value: 'true',
			},
			i18nDescription: 'Appia_Department_Settings_Description',
		});

		await this.add('Appia_EMT_Settings_230507', '{}', {
			type: 'string',
			public: false,
		});

		await this.add('Appia_Role_Sort_Settings', '', {
			type: 'string',
			public: false,
		});

		await this.add('Appia_Room_Side_Menus_Web', '{"approval.bot":[{"name":"我的待办","url":"https://www.test.com"}]}', {
			type: 'string',
			public: true,
		});

		await this.add(
			'Appia_Menu_bar_Names',
			'{"en":{"chat":"Discuss","channel":"Channel","contact":"Team","workspace":"Workspace"}, "zh":{"chat":"讨论","channel":"频道","contact":"团队","workspace":"工作台"}}',
			{
				type: 'string',
				public: true,
			},
		);

		await this.add('Appia_Room_Side_Menu_StaffServiceButton', 'GENERAL', {
			type: 'string',
			public: true,
		});

		await this.add('Appia_Create_External_Discussion_Members', '', {
			type: 'string',
			public: true,
		});

		await this.add('Appia_Create_External_Channel_Members', '', {
			type: 'string',
			public: true,
		});

		await this.add('Appia_Create_All_Channel_Members', '', {
			type: 'string',
			public: true,
		});
		await this.add('Appia_Add_Member_To_Room_Interval_Second', 1, {
			type: 'int',
			public: true,
		});
	});

	await this.section('Otkr', async function () {
		await this.add('Otkr_Server_Url', '', {
			type: 'string',
			public: true,
		});
		await this.add('Otkr_Jwt_Iss', '', {
			type: 'string',
			public: true,
		});
		await this.add('Otkr_Jwt_Secret', '', {
			type: 'string',
			public: true,
		});
	});

	await this.section('External_Channel', async function () {
		await this.add('Org_Matrix_Domain', '', {
			type: 'string',
			public: true,
		});
	});

	await this.add('Document_Domain', '', {
		type: 'string',
		public: true,
	});
	await this.add('Language', '', {
		type: 'language',
		public: true,
		wizard: {
			step: 3,
			order: 1,
		},
	});
	await this.add('Allow_Invalid_SelfSigned_Certs', false, {
		type: 'boolean',
		secret: true,
	});

	await this.add('Enable_CSP', true, {
		type: 'boolean',
	});

	await this.add('Extra_CSP_Domains', '', {
		type: 'string',
		multiline: true,
	});

	await this.add('Iframe_Restrict_Access', true, {
		type: 'boolean',
		secret: true,
	});
	await this.add('Iframe_X_Frame_Options', 'sameorigin', {
		type: 'string',
		secret: true,
		enableQuery: {
			_id: 'Iframe_Restrict_Access',
			value: true,
		},
	});
	await this.add('Favorite_Rooms', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('First_Channel_After_Login', '', {
		type: 'string',
		public: true,
	});
	await this.add('Unread_Count', 'user_and_group_mentions_only', {
		type: 'select',
		values: [
			{
				key: 'all_messages',
				i18nLabel: 'All_messages',
			},
			{
				key: 'user_mentions_only',
				i18nLabel: 'User_mentions_only',
			},
			{
				key: 'group_mentions_only',
				i18nLabel: 'Group_mentions_only',
			},
			{
				key: 'user_and_group_mentions_only',
				i18nLabel: 'User_and_group_mentions_only',
			},
		],
		public: true,
	});
	await this.add('Unread_Count_DM', 'all_messages', {
		type: 'select',
		values: [
			{
				key: 'all_messages',
				i18nLabel: 'All_messages',
			},
			{
				key: 'mentions_only',
				i18nLabel: 'Mentions_only',
			},
		],
		public: true,
	});
	await this.add('Unread_Count_Omni', 'all_messages', {
		type: 'select',
		values: [
			{
				key: 'all_messages',
				i18nLabel: 'All_messages',
			},
			{
				key: 'mentions_only',
				i18nLabel: 'Mentions_only',
			},
		],
		public: true,
	});

	await this.add('DeepLink_Url', 'https://go.rocket.chat', {
		type: 'string',
		public: true,
	});

	await this.add('CDN_PREFIX', '', {
		type: 'string',
		public: true,
	});
	await this.add('CDN_PREFIX_ALL', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('CDN_JSCSS_PREFIX', '', {
		type: 'string',
		public: true,
		enableQuery: {
			_id: 'CDN_PREFIX_ALL',
			value: false,
		},
	});
	await this.add('Force_SSL', false, {
		type: 'boolean',
		public: true,
	});

	await this.add('GoogleTagManager_id', '', {
		type: 'string',
		public: true,
		secret: true,
	});
	await this.add('Bugsnag_api_key', '', {
		type: 'string',
		public: false,
		secret: true,
	});
	await this.add('Restart', 'restart_server', {
		type: 'action',
		actionText: 'Restart_the_server',
	});
	await this.add('Store_Last_Message', true, {
		type: 'boolean',
		public: true,
		i18nDescription: 'Store_Last_Message_Sent_per_Room',
	});
	await this.add('Robot_Instructions_File_Content', 'User-agent: *\nDisallow: /', {
		type: 'string',
		public: true,
		multiline: true,
	});
	await this.add('Default_Referrer_Policy', 'same-origin', {
		type: 'select',
		values: [
			{
				key: 'no-referrer',
				i18nLabel: 'No_Referrer',
			},
			{
				key: 'no-referrer-when-downgrade',
				i18nLabel: 'No_Referrer_When_Downgrade',
			},
			{
				key: 'origin',
				i18nLabel: 'Origin',
			},
			{
				key: 'origin-when-cross-origin',
				i18nLabel: 'Origin_When_Cross_Origin',
			},
			{
				key: 'same-origin',
				i18nLabel: 'Same_Origin',
			},
			{
				key: 'strict-origin',
				i18nLabel: 'Strict_Origin',
			},
			{
				key: 'strict-origin-when-cross-origin',
				i18nLabel: 'Strict_Origin_When_Cross_Origin',
			},
			{
				key: 'unsafe-url',
				i18nLabel: 'Unsafe_Url',
			},
		],
		public: true,
	});
	await this.add('ECDH_Enabled', false, {
		type: 'boolean',
		alert: 'This_feature_is_currently_in_alpha',
	});
	await this.section('UTF8', async function () {
		await this.add('UTF8_User_Names_Validation', '[0-9a-zA-Z-_.]+', {
			type: 'string',
			public: true,
			i18nDescription: 'UTF8_User_Names_Validation_Description',
		});
		await this.add('UTF8_Channel_Names_Validation', '[0-9a-zA-Z-_.]+', {
			type: 'string',
			public: true,
			i18nDescription: 'UTF8_Channel_Names_Validation_Description',
		});
		return this.add('UTF8_Names_Slugify', true, {
			type: 'boolean',
			public: true,
		});
	});
	await this.section('Reporting', async function () {
		return this.add('Statistics_reporting', true, {
			type: 'boolean',
		});
	});
	await this.section('Notifications', async function () {
		await this.add('Notifications_Max_Room_Members', 100, {
			type: 'int',
			public: true,
			i18nDescription: 'Notifications_Max_Room_Members_Description',
		});
	});
	await this.section('REST API', async function () {
		return this.add('API_User_Limit', 500, {
			type: 'int',
			public: true,
			i18nDescription: 'API_User_Limit',
		});
	});
	await this.section('Iframe_Integration', async function () {
		await this.add('Iframe_Integration_send_enable', false, {
			type: 'boolean',
			public: true,
		});
		await this.add('Iframe_Integration_send_target_origin', '*', {
			type: 'string',
			public: true,
			enableQuery: {
				_id: 'Iframe_Integration_send_enable',
				value: true,
			},
		});
		await this.add('Iframe_Integration_receive_enable', false, {
			type: 'boolean',
			public: true,
		});
		return this.add('Iframe_Integration_receive_origin', '*', {
			type: 'string',
			public: true,
			enableQuery: {
				_id: 'Iframe_Integration_receive_enable',
				value: true,
			},
		});
	});
	await this.section('Translations', async function () {
		return this.add('Custom_Translations', '', {
			type: 'code',
			code: 'application/json',
			public: true,
		});
	});
	await this.section('Stream_Cast', async function () {
		return this.add('Stream_Cast_Address', '', {
			type: 'string',
		});
	});
	await this.section('NPS', async function () {
		await this.add('NPS_survey_enabled', true, {
			type: 'boolean',
		});
	});
	await this.section('Timezone', async function () {
		await this.add('Default_Timezone_For_Reporting', 'server', {
			type: 'select',
			values: [
				{
					key: 'server',
					i18nLabel: 'Default_Server_Timezone',
				},
				{
					key: 'custom',
					i18nLabel: 'Default_Custom_Timezone',
				},
				{
					key: 'user',
					i18nLabel: 'Default_User_Timezone',
				},
			],
		});
		await this.add('Default_Custom_Timezone', '', {
			type: 'timezone',
			enableQuery: {
				_id: 'Default_Timezone_For_Reporting',
				value: 'custom',
			},
		});
	});
});

void settingsRegistry.addGroup('Message', async function () {
	await this.section('Message_Attachments', async function () {
		await this.add('Message_Attachments_Thumbnails_Enabled', true, {
			type: 'boolean',
			public: true,
			i18nDescription: 'Message_Attachments_Thumbnails_EnabledDesc',
		});

		await this.add('Message_Attachments_Thumbnails_Width', 480, {
			type: 'int',
			public: true,
			enableQuery: [
				{
					_id: 'Message_Attachments_Thumbnails_Enabled',
					value: true,
				},
			],
		});

		await this.add('Message_Attachments_Thumbnails_Height', 360, {
			type: 'int',
			public: true,
			enableQuery: [
				{
					_id: 'Message_Attachments_Thumbnails_Enabled',
					value: true,
				},
			],
		});

		await this.add('Message_Attachments_Strip_Exif', false, {
			type: 'boolean',
			public: true,
			i18nDescription: 'Message_Attachments_Strip_ExifDescription',
		});
	});
	await this.section('Message_Audio', async function () {
		await this.add('Message_AudioRecorderEnabled', true, {
			type: 'boolean',
			public: true,
			i18nDescription: 'Message_AudioRecorderEnabledDescription',
		});
		await this.add('Message_Audio_bitRate', 32, {
			type: 'int',
			public: true,
		});
	});
	await this.section('Read_Receipts', async function () {
		await this.add('Message_Read_Receipt_Enabled', false, {
			type: 'boolean',
			enterprise: true,
			invalidValue: false,
			modules: ['message-read-receipt'],
			public: true,
		});
		await this.add('Message_Read_Receipt_Store_Users', false, {
			type: 'boolean',
			enterprise: true,
			invalidValue: false,
			modules: ['message-read-receipt'],
			public: true,
			enableQuery: { _id: 'Message_Read_Receipt_Enabled', value: true },
		});
	});
	await this.add('Message_CustomDomain_AutoLink', '', {
		type: 'string',
		public: true,
	});
	await this.add('Message_AllowEditing', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('Message_AllowEditing_BlockEditInMinutes', 0, {
		type: 'int',
		public: true,
		i18nDescription: 'Message_AllowEditing_BlockEditInMinutesDescription',
	});
	await this.add('Message_AllowDeleting', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('Message_AllowDeleting_BlockDeleteInMinutes', 0, {
		type: 'int',
		public: true,
		i18nDescription: 'Message_AllowDeleting_BlockDeleteInMinutes',
	});
	await this.add('Message_AllowUnrecognizedSlashCommand', false, {
		type: 'boolean',
		public: true,
	});
	await this.add('Message_AllowDirectMessagesToYourself', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('Message_AlwaysSearchRegExp', false, {
		type: 'boolean',
	});
	await this.add('Message_ShowDeletedStatus', false, {
		type: 'boolean',
		public: true,
	});
	await this.add('Message_AllowBadWordsFilter', false, {
		type: 'boolean',
		public: true,
	});
	await this.add('Message_BadWordsFilterList', '', {
		type: 'string',
		public: true,
	});
	await this.add('Message_BadWordsWhitelist', '', {
		type: 'string',
		public: true,
	});
	await this.add('Message_KeepHistory', false, {
		type: 'boolean',
		public: true,
	});
	await this.add('Message_MaxAll', 0, {
		type: 'int',
		public: true,
	});
	await this.add('Message_MaxAllowedSize', 5000, {
		type: 'int',
		public: true,
	});
	await this.add('Message_AllowConvertLongMessagesToAttachment', true, {
		type: 'boolean',
		public: true,
	});
	await this.add('Message_GroupingPeriod', 300, {
		type: 'int',
		public: true,
		i18nDescription: 'Message_GroupingPeriodDescription',
	});
	await this.add('API_Embed', true, {
		type: 'boolean',
		public: true,
	});
	await this.add(
		'API_Embed_UserAgent',
		'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
		{
			type: 'string',
			public: true,
		},
	);
	await this.add('API_EmbedCacheExpirationDays', 30, {
		type: 'int',
		public: false,
	});
	await this.add('API_Embed_clear_cache_now', 'OEmbedCacheCleanup', {
		type: 'action',
		actionText: 'clear',
		i18nLabel: 'clear_cache_now',
	});
	// TODO: deprecate this setting in favor of App
	await this.add('API_EmbedIgnoredHosts', 'localhost, 127.0.0.1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16', {
		type: 'string',
		i18nDescription: 'API_EmbedIgnoredHosts_Description',
	});
	// TODO: deprecate this setting in favor of App
	await this.add('API_EmbedSafePorts', '80, 443', {
		type: 'string',
	});
	await this.add('Message_TimeFormat', 'LT', {
		type: 'string',
		public: true,
		i18nDescription: 'Message_TimeFormat_Description',
	});
	await this.add('Message_DateFormat', 'LL', {
		type: 'string',
		public: true,
		i18nDescription: 'Message_DateFormat_Description',
	});
	await this.add('Message_TimeAndDateFormat', 'LLL', {
		type: 'string',
		public: true,
		i18nDescription: 'Message_TimeAndDateFormat_Description',
	});
	await this.add('Message_QuoteChainLimit', 2, {
		type: 'int',
		public: true,
	});

	await this.add('Hide_System_Messages', [], {
		type: 'multiSelect',
		public: true,
		values: MessageTypesValues,
	});

	await this.add('DirectMesssage_maxUsers', 8, {
		type: 'int',
		public: true,
	});

	await this.add('Message_ErasureType', 'Delete', {
		type: 'select',
		public: true,
		values: [
			{
				key: 'Keep',
				i18nLabel: 'Message_ErasureType_Keep',
			},
			{
				key: 'Delete',
				i18nLabel: 'Message_ErasureType_Delete',
			},
			{
				key: 'Unlink',
				i18nLabel: 'Message_ErasureType_Unlink',
			},
		],
	});

	await this.add(
		'Message_Code_highlight',
		'javascript,css,markdown,dockerfile,json,go,rust,clean,bash,plaintext,powershell,scss,shell,yaml,vim',
		{
			type: 'string',
			public: true,
		},
	);
	await this.add('Message_Auditing_Panel_Load_Count', 0, {
		type: 'int',
		hidden: true,
	});
	await this.add('Message_Auditing_Apply_Count', 0, {
		type: 'int',
		hidden: true,
	});
});

void settingsRegistry.addGroup('Meta', async function () {
	await this.add('Meta_language', '', {
		type: 'string',
	});
	await this.add('Meta_fb_app_id', '', {
		type: 'string',
		secret: true,
	});
	await this.add('Meta_robots', 'INDEX,FOLLOW', {
		type: 'string',
	});
	await this.add('Meta_google-site-verification', '', {
		type: 'string',
		secret: true,
	});
	await this.add('Meta_msvalidate01', '', {
		type: 'string',
		secret: true,
	});
	return this.add('Meta_custom', '', {
		type: 'code',
		code: 'text/html',
		multiline: true,
	});
});

void settingsRegistry.addGroup('Mobile', async function () {
	await this.add('Allow_Save_Media_to_Gallery', true, {
		type: 'boolean',
		public: true,
	});
	await this.section('Screen_Lock', async function () {
		await this.add('Force_Screen_Lock', false, {
			type: 'boolean',
			i18nDescription: 'Force_Screen_Lock_description',
			public: true,
		});
		await this.add('Force_Screen_Lock_After', 1800, {
			type: 'int',
			i18nDescription: 'Force_Screen_Lock_After_description',
			enableQuery: { _id: 'Force_Screen_Lock', value: true },
			public: true,
		});
	});
});

const pushEnabledWithoutGateway = [
	{
		_id: 'Push_enable',
		value: true,
	},
	{
		_id: 'Push_enable_gateway',
		value: false,
	},
];

void settingsRegistry.addGroup('Push', async function () {
	await this.add('Push_enable', true, {
		type: 'boolean',
		public: true,
		alert: 'Push_Setting_Requires_Restart_Alert',
	});

	await this.add('Push_enable_gateway', true, {
		type: 'boolean',
		alert: 'Push_Setting_Requires_Restart_Alert',
		enableQuery: [
			{
				_id: 'Push_enable',
				value: true,
			},
			{
				_id: 'Register_Server',
				value: true,
			},
			{
				_id: 'Cloud_Service_Agree_PrivacyTerms',
				value: true,
			},
		],
	});
	await this.add('Push_gateway', 'https://gateway.rocket.chat', {
		type: 'string',
		i18nDescription: 'Push_gateway_description',
		alert: 'Push_Setting_Requires_Restart_Alert',
		multiline: true,
		enableQuery: [
			{
				_id: 'Push_enable',
				value: true,
			},
			{
				_id: 'Push_enable_gateway',
				value: true,
			},
		],
	});
	await this.add('Push_production', true, {
		type: 'boolean',
		public: true,
		alert: 'Push_Setting_Requires_Restart_Alert',
		enableQuery: pushEnabledWithoutGateway,
	});
	await this.add('Push_test_push', 'push_test', {
		type: 'action',
		actionText: 'Send_a_test_push_to_my_user',
		enableQuery: {
			_id: 'Push_enable',
			value: true,
		},
	});
	await this.section('Certificates_and_Keys', async function () {
		await this.add('Push_apn_passphrase', '', {
			type: 'string',
			enableQuery: [],
			secret: true,
		});
		await this.add('Push_apn_key', '', {
			type: 'string',
			multiline: true,
			enableQuery: [],
			secret: true,
		});
		await this.add('Push_apn_cert', '', {
			type: 'string',
			multiline: true,
			enableQuery: [],
			secret: true,
		});
		await this.add('Push_apn_dev_passphrase', '', {
			type: 'string',
			enableQuery: [],
			secret: true,
		});
		await this.add('Push_apn_dev_key', '', {
			type: 'string',
			multiline: true,
			enableQuery: [],
			secret: true,
		});
		await this.add('Push_apn_dev_cert', '', {
			type: 'string',
			multiline: true,
			enableQuery: [],
			secret: true,
		});
		await this.add('Push_gcm_api_key', '', {
			type: 'string',
			enableQuery: [],
			secret: true,
		});
		return this.add('Push_gcm_project_number', '', {
			type: 'string',
			public: true,
			enableQuery: [],
			secret: true,
		});
	});
	return this.section('Privacy', async function () {
		await this.add('Push_show_username_room', true, {
			type: 'boolean',
			public: true,
		});
		await this.add('Push_show_message', true, {
			type: 'boolean',
			public: true,
		});
		await this.add('Push_request_content_from_server', true, {
			type: 'boolean',
			enterprise: false,
			invalidValue: false,
			modules: ['push-privacy'],
		});
	});
});

void settingsRegistry.addGroup('Layout', async function () {
	await this.section('Login', async function () {
		await this.add('Layout_Login_Hide_Logo', false, {
			type: 'boolean',
			public: true,
			enterprise: true,
			invalidValue: false,
		});
		await this.add('Layout_Login_Hide_Title', false, {
			type: 'boolean',
			public: true,
			enterprise: true,
			invalidValue: false,
		});
		await this.add('Layout_Login_Hide_Powered_By', false, {
			type: 'boolean',
			public: true,
			enterprise: true,
			invalidValue: false,
		});
		await this.add('Layout_Login_Template', 'horizontal-template', {
			type: 'select',
			values: [
				{
					key: 'vertical-template',
					i18nLabel: 'Layout_Login_Template_Vertical',
				},
				{
					key: 'horizontal-template',
					i18nLabel: 'Layout_Login_Template_Horizontal',
				},
			],
			public: true,
			enterprise: true,
			invalidValue: 'horizontal-template',
		});
		await this.add('Accounts_ShowFormLogin', true, {
			type: 'boolean',
			public: true,
		});
	});
	await this.section('Layout_Home_Page_Content_Title', async function () {
		await this.add('Layout_Home_Title', 'Home', {
			type: 'string',
			public: true,
		});
		await this.add('Layout_Show_Home_Button', true, {
			type: 'boolean',
			public: true,
		});
		await this.add('Layout_Home_Body', '', {
			i18nDescription: 'Layout_Custom_Content_Description',
			type: 'code',
			code: 'text/html',
			multiline: true,
			public: true,
		});
		await this.add('Layout_Home_Custom_Block_Visible', false, {
			type: 'boolean',
			invalidValue: false,
			public: true,
			enableQuery: [
				{
					_id: 'Layout_Home_Body',
					value: {
						$exists: true,
						$ne: '',
					},
				},
				{
					_id: 'Layout_Custom_Body_Only',
					value: {
						$exists: true,
						$ne: true,
					},
				},
			],
		});
		await this.add('Layout_Custom_Body_Only', false, {
			i18nDescription: 'Layout_Custom_Body_Only_Description',
			type: 'boolean',
			invalidValue: false,
			enterprise: true,
			public: true,
			enableQuery: [
				{
					_id: 'Layout_Home_Body',
					value: {
						$exists: true,
						$ne: '',
					},
				},
				{
					_id: 'Layout_Home_Custom_Block_Visible',
					value: {
						$exists: true,
						$ne: false,
					},
				},
			],
		});
		await this.add('Layout_Terms_of_Service', 'Terms of Service <br> Go to APP SETTINGS &rarr; Layout to customize this page.', {
			type: 'code',
			code: 'text/html',
			multiline: true,
			public: true,
		});
		await this.add(
			'Layout_Login_Terms',
			'By proceeding you are agreeing to our <a href="terms-of-service">Terms of Service</a>, <a href="privacy-policy">Privacy Policy</a> and <a href="legal-notice">Legal Notice</a>.',
			{
				type: 'string',
				multiline: true,
				public: true,
			},
		);
		await this.add('Layout_Privacy_Policy', 'Privacy Policy <br> Go to APP SETTINGS &rarr; Layout to customize this page.', {
			type: 'code',
			code: 'text/html',
			multiline: true,
			public: true,
		});
		await this.add('Layout_Legal_Notice', 'Legal Notice <br> Go to APP SETTINGS -> Layout to customize this page.', {
			type: 'code',
			code: 'text/html',
			multiline: true,
			public: true,
		});
		await this.add('Layout_Sidenav_Footer_Dark', '<a href="/home"><img src="assets/logo_dark.png" alt="Home" /></a>', {
			type: 'code',
			code: 'text/html',
			public: true,
			i18nDescription: 'Layout_Sidenav_Footer_description',
		});
		return this.add('Layout_Sidenav_Footer', '<a href="/home"><img src="assets/logo.png" alt="Home" /></a>', {
			type: 'code',
			code: 'text/html',
			public: true,
			i18nDescription: 'Layout_Sidenav_Footer_description',
		});
	});
	await this.section('Custom_Scripts', async function () {
		await this.add('Custom_Script_On_Logout', '//Add your script', {
			type: 'code',
			multiline: true,
			public: true,
		});
		await this.add('Custom_Script_Logged_Out', '//Add your script', {
			type: 'code',
			multiline: true,
			public: true,
		});
		return this.add('Custom_Script_Logged_In', '//Add your script', {
			type: 'code',
			multiline: true,
			public: true,
		});
	});
	return this.section('User_Interface', async function () {
		await this.add('UI_DisplayRoles', true, {
			type: 'boolean',
			public: true,
		});
		await this.add('UI_Group_Channels_By_Type', true, {
			type: 'boolean',
			public: false,
		});
		await this.add('UI_Use_Name_Avatar', false, {
			type: 'boolean',
			public: true,
		});
		await this.add('UI_Use_Real_Name', false, {
			type: 'boolean',
			public: true,
		});
		await this.add('UI_Click_Direct_Message', false, {
			type: 'boolean',
			public: true,
		});

		await this.add('Number_of_users_autocomplete_suggestions', 5, {
			type: 'int',
			public: true,
		});

		await this.add('UI_Unread_Counter_Style', 'Different_Style_For_User_Mentions', {
			type: 'select',
			values: [
				{
					key: 'Same_Style_For_Mentions',
					i18nLabel: 'Same_Style_For_Mentions',
				},
				{
					key: 'Different_Style_For_User_Mentions',
					i18nLabel: 'Different_Style_For_User_Mentions',
				},
			],
			public: true,
		});
		await this.add('UI_Allow_room_names_with_special_chars', false, {
			type: 'boolean',
			public: true,
		});
		return this.add('UI_Show_top_navbar_embedded_layout', false, {
			type: 'boolean',
			public: true,
		});
	});
});

void settingsRegistry.addGroup('Logs', async function () {
	await this.add('Log_Level', '0', {
		type: 'select',
		values: [
			{
				key: '0',
				i18nLabel: '0_Errors_Only',
			},
			{
				key: '1',
				i18nLabel: '1_Errors_and_Information',
			},
			{
				key: '2',
				i18nLabel: '2_Erros_Information_and_Debug',
			},
		],
		public: true,
	});
	await this.add('Log_View_Limit', 1000, {
		type: 'int',
	});

	await this.add('Log_Trace_Methods', false, {
		type: 'boolean',
	});

	await this.add('Log_Trace_Methods_Filter', '', {
		type: 'string',
		enableQuery: {
			_id: 'Log_Trace_Methods',
			value: true,
		},
	});

	await this.add('Log_Trace_Subscriptions', false, {
		type: 'boolean',
	});

	await this.add('Log_Trace_Subscriptions_Filter', '', {
		type: 'string',
		enableQuery: {
			_id: 'Log_Trace_Subscriptions',
			value: true,
		},
	});

	await this.add('Uncaught_Exceptions_Count', 0, {
		hidden: true,
		type: 'int',
	});

	await this.section('Prometheus', async function () {
		await this.add('Prometheus_Enabled', false, {
			type: 'boolean',
			i18nLabel: 'Enabled',
		});
		// See the default port allocation at https://github.com/prometheus/prometheus/wiki/Default-port-allocations
		await this.add('Prometheus_Port', 9458, {
			type: 'int',
			i18nLabel: 'Port',
		});
		await this.add('Prometheus_Reset_Interval', 0, {
			type: 'int',
		});
		await this.add('Prometheus_Garbage_Collector', false, {
			type: 'boolean',
			alert: 'Prometheus_Garbage_Collector_Alert',
		});
		await this.add('Prometheus_API_User_Agent', false, {
			type: 'boolean',
		});
	});
});

void settingsRegistry.addGroup('Setup_Wizard', async function () {
	await this.section('Organization_Info', async function () {
		await this.add('Organization_Type', '', {
			type: 'select',
			values: [
				{
					key: 'community',
					i18nLabel: 'Community',
				},
				{
					key: 'enterprise',
					i18nLabel: 'Enterprise',
				},
				{
					key: 'government',
					i18nLabel: 'Government',
				},
				{
					key: 'nonprofit',
					i18nLabel: 'Nonprofit',
				},
			],
			wizard: {
				step: 2,
				order: 0,
			},
		});
		await this.add('Organization_Name', '', {
			type: 'string',
			wizard: {
				step: 2,
				order: 1,
			},
		});
		await this.add('Industry', '', {
			type: 'select',
			values: [
				{
					key: 'aerospaceDefense',
					i18nLabel: 'Aerospace_and_Defense',
				},
				{
					key: 'consulting',
					i18nLabel: 'Consulting',
				},
				{
					key: 'consumerGoods',
					i18nLabel: 'Consumer_Packaged_Goods',
				},
				{
					key: 'contactCenter',
					i18nLabel: 'Contact_Center',
				},
				{
					key: 'education',
					i18nLabel: 'Education',
				},
				{
					key: 'entertainment',
					i18nLabel: 'Entertainment',
				},
				{
					key: 'financialServices',
					i18nLabel: 'Financial_Services',
				},
				{
					key: 'gaming',
					i18nLabel: 'Gaming',
				},
				{
					key: 'healthcare',
					i18nLabel: 'Healthcare',
				},
				{
					key: 'hospitalityBusinness',
					i18nLabel: 'Hospitality_Businness',
				},
				{
					key: 'insurance',
					i18nLabel: 'Insurance',
				},
				{
					key: 'itSecurity',
					i18nLabel: 'It_Security',
				},
				{
					key: 'logistics',
					i18nLabel: 'Logistics',
				},
				{
					key: 'manufacturing',
					i18nLabel: 'Manufacturing',
				},
				{
					key: 'media',
					i18nLabel: 'Media',
				},
				{
					key: 'pharmaceutical',
					i18nLabel: 'Pharmaceutical',
				},
				{
					key: 'realEstate',
					i18nLabel: 'Real_Estate',
				},
				{
					key: 'religious',
					i18nLabel: 'Religious',
				},
				{
					key: 'retail',
					i18nLabel: 'Retail',
				},
				{
					key: 'socialNetwork',
					i18nLabel: 'Social_Network',
				},
				{
					key: 'technologyProvider',
					i18nLabel: 'Technology_Provider',
				},
				{
					key: 'technologyServices',
					i18nLabel: 'Technology_Services',
				},
				{
					key: 'telecom',
					i18nLabel: 'Telecom',
				},
				{
					key: 'utilities',
					i18nLabel: 'Utilities',
				},
				{
					key: 'other',
					i18nLabel: 'Other',
				},
			],
			wizard: {
				step: 2,
				order: 2,
			},
		});
		await this.add('Size', '', {
			type: 'select',
			values: [
				{
					key: '0',
					i18nLabel: '1-10 people',
				},
				{
					key: '1',
					i18nLabel: '11-50 people',
				},
				{
					key: '2',
					i18nLabel: '51-100 people',
				},
				{
					key: '3',
					i18nLabel: '101-250 people',
				},
				{
					key: '4',
					i18nLabel: '251-500 people',
				},
				{
					key: '5',
					i18nLabel: '501-1000 people',
				},
				{
					key: '6',
					i18nLabel: '1001-4000 people',
				},
				{
					key: '7',
					i18nLabel: '4000 or more people',
				},
			],
			wizard: {
				step: 2,
				order: 3,
			},
		});
		await this.add('Country', '', {
			type: 'select',
			values: [
				{
					key: 'afghanistan',
					i18nLabel: 'Country_Afghanistan',
				},
				{
					key: 'albania',
					i18nLabel: 'Country_Albania',
				},
				{
					key: 'algeria',
					i18nLabel: 'Country_Algeria',
				},
				{
					key: 'americanSamoa',
					i18nLabel: 'Country_American_Samoa',
				},
				{
					key: 'andorra',
					i18nLabel: 'Country_Andorra',
				},
				{
					key: 'angola',
					i18nLabel: 'Country_Angola',
				},
				{
					key: 'anguilla',
					i18nLabel: 'Country_Anguilla',
				},
				{
					key: 'antarctica',
					i18nLabel: 'Country_Antarctica',
				},
				{
					key: 'antiguaAndBarbuda',
					i18nLabel: 'Country_Antigua_and_Barbuda',
				},
				{
					key: 'argentina',
					i18nLabel: 'Country_Argentina',
				},
				{
					key: 'armenia',
					i18nLabel: 'Country_Armenia',
				},
				{
					key: 'aruba',
					i18nLabel: 'Country_Aruba',
				},
				{
					key: 'australia',
					i18nLabel: 'Country_Australia',
				},
				{
					key: 'austria',
					i18nLabel: 'Country_Austria',
				},
				{
					key: 'azerbaijan',
					i18nLabel: 'Country_Azerbaijan',
				},
				{
					key: 'bahamas',
					i18nLabel: 'Country_Bahamas',
				},
				{
					key: 'bahrain',
					i18nLabel: 'Country_Bahrain',
				},
				{
					key: 'bangladesh',
					i18nLabel: 'Country_Bangladesh',
				},
				{
					key: 'barbados',
					i18nLabel: 'Country_Barbados',
				},
				{
					key: 'belarus',
					i18nLabel: 'Country_Belarus',
				},
				{
					key: 'belgium',
					i18nLabel: 'Country_Belgium',
				},
				{
					key: 'belize',
					i18nLabel: 'Country_Belize',
				},
				{
					key: 'benin',
					i18nLabel: 'Country_Benin',
				},
				{
					key: 'bermuda',
					i18nLabel: 'Country_Bermuda',
				},
				{
					key: 'bhutan',
					i18nLabel: 'Country_Bhutan',
				},
				{
					key: 'bolivia',
					i18nLabel: 'Country_Bolivia',
				},
				{
					key: 'bosniaAndHerzegovina',
					i18nLabel: 'Country_Bosnia_and_Herzegovina',
				},
				{
					key: 'botswana',
					i18nLabel: 'Country_Botswana',
				},
				{
					key: 'bouvetIsland',
					i18nLabel: 'Country_Bouvet_Island',
				},
				{
					key: 'brazil',
					i18nLabel: 'Country_Brazil',
				},
				{
					key: 'britishIndianOceanTerritory',
					i18nLabel: 'Country_British_Indian_Ocean_Territory',
				},
				{
					key: 'bruneiDarussalam',
					i18nLabel: 'Country_Brunei_Darussalam',
				},
				{
					key: 'bulgaria',
					i18nLabel: 'Country_Bulgaria',
				},
				{
					key: 'burkinaFaso',
					i18nLabel: 'Country_Burkina_Faso',
				},
				{
					key: 'burundi',
					i18nLabel: 'Country_Burundi',
				},
				{
					key: 'cambodia',
					i18nLabel: 'Country_Cambodia',
				},
				{
					key: 'cameroon',
					i18nLabel: 'Country_Cameroon',
				},
				{
					key: 'canada',
					i18nLabel: 'Country_Canada',
				},
				{
					key: 'capeVerde',
					i18nLabel: 'Country_Cape_Verde',
				},
				{
					key: 'caymanIslands',
					i18nLabel: 'Country_Cayman_Islands',
				},
				{
					key: 'centralAfricanRepublic',
					i18nLabel: 'Country_Central_African_Republic',
				},
				{
					key: 'chad',
					i18nLabel: 'Country_Chad',
				},
				{
					key: 'chile',
					i18nLabel: 'Country_Chile',
				},
				{
					key: 'china',
					i18nLabel: 'Country_China',
				},
				{
					key: 'christmasIsland',
					i18nLabel: 'Country_Christmas_Island',
				},
				{
					key: 'cocosKeelingIslands',
					i18nLabel: 'Country_Cocos_Keeling_Islands',
				},
				{
					key: 'colombia',
					i18nLabel: 'Country_Colombia',
				},
				{
					key: 'comoros',
					i18nLabel: 'Country_Comoros',
				},
				{
					key: 'congo',
					i18nLabel: 'Country_Congo',
				},
				{
					key: 'congoTheDemocraticRepublicOfThe',
					i18nLabel: 'Country_Congo_The_Democratic_Republic_of_The',
				},
				{
					key: 'cookIslands',
					i18nLabel: 'Country_Cook_Islands',
				},
				{
					key: 'costaRica',
					i18nLabel: 'Country_Costa_Rica',
				},
				{
					key: 'coteDivoire',
					i18nLabel: 'Country_Cote_Divoire',
				},
				{
					key: 'croatia',
					i18nLabel: 'Country_Croatia',
				},
				{
					key: 'cuba',
					i18nLabel: 'Country_Cuba',
				},
				{
					key: 'cyprus',
					i18nLabel: 'Country_Cyprus',
				},
				{
					key: 'czechRepublic',
					i18nLabel: 'Country_Czech_Republic',
				},
				{
					key: 'denmark',
					i18nLabel: 'Country_Denmark',
				},
				{
					key: 'djibouti',
					i18nLabel: 'Country_Djibouti',
				},
				{
					key: 'dominica',
					i18nLabel: 'Country_Dominica',
				},
				{
					key: 'dominicanRepublic',
					i18nLabel: 'Country_Dominican_Republic',
				},
				{
					key: 'ecuador',
					i18nLabel: 'Country_Ecuador',
				},
				{
					key: 'egypt',
					i18nLabel: 'Country_Egypt',
				},
				{
					key: 'elSalvador',
					i18nLabel: 'Country_El_Salvador',
				},
				{
					key: 'equatorialGuinea',
					i18nLabel: 'Country_Equatorial_Guinea',
				},
				{
					key: 'eritrea',
					i18nLabel: 'Country_Eritrea',
				},
				{
					key: 'estonia',
					i18nLabel: 'Country_Estonia',
				},
				{
					key: 'ethiopia',
					i18nLabel: 'Country_Ethiopia',
				},
				{
					key: 'falklandIslandsMalvinas',
					i18nLabel: 'Country_Falkland_Islands_Malvinas',
				},
				{
					key: 'faroeIslands',
					i18nLabel: 'Country_Faroe_Islands',
				},
				{
					key: 'fiji',
					i18nLabel: 'Country_Fiji',
				},
				{
					key: 'finland',
					i18nLabel: 'Country_Finland',
				},
				{
					key: 'france',
					i18nLabel: 'Country_France',
				},
				{
					key: 'frenchGuiana',
					i18nLabel: 'Country_French_Guiana',
				},
				{
					key: 'frenchPolynesia',
					i18nLabel: 'Country_French_Polynesia',
				},
				{
					key: 'frenchSouthernTerritories',
					i18nLabel: 'Country_French_Southern_Territories',
				},
				{
					key: 'gabon',
					i18nLabel: 'Country_Gabon',
				},
				{
					key: 'gambia',
					i18nLabel: 'Country_Gambia',
				},
				{
					key: 'georgia',
					i18nLabel: 'Country_Georgia',
				},
				{
					key: 'germany',
					i18nLabel: 'Country_Germany',
				},
				{
					key: 'ghana',
					i18nLabel: 'Country_Ghana',
				},
				{
					key: 'gibraltar',
					i18nLabel: 'Country_Gibraltar',
				},
				{
					key: 'greece',
					i18nLabel: 'Country_Greece',
				},
				{
					key: 'greenland',
					i18nLabel: 'Country_Greenland',
				},
				{
					key: 'grenada',
					i18nLabel: 'Country_Grenada',
				},
				{
					key: 'guadeloupe',
					i18nLabel: 'Country_Guadeloupe',
				},
				{
					key: 'guam',
					i18nLabel: 'Country_Guam',
				},
				{
					key: 'guatemala',
					i18nLabel: 'Country_Guatemala',
				},
				{
					key: 'guinea',
					i18nLabel: 'Country_Guinea',
				},
				{
					key: 'guineaBissau',
					i18nLabel: 'Country_Guinea_bissau',
				},
				{
					key: 'guyana',
					i18nLabel: 'Country_Guyana',
				},
				{
					key: 'haiti',
					i18nLabel: 'Country_Haiti',
				},
				{
					key: 'heardIslandAndMcdonaldIslands',
					i18nLabel: 'Country_Heard_Island_and_Mcdonald_Islands',
				},
				{
					key: 'holySeeVaticanCityState',
					i18nLabel: 'Country_Holy_See_Vatican_City_State',
				},
				{
					key: 'honduras',
					i18nLabel: 'Country_Honduras',
				},
				{
					key: 'hongKong',
					i18nLabel: 'Country_Hong_Kong',
				},
				{
					key: 'hungary',
					i18nLabel: 'Country_Hungary',
				},
				{
					key: 'iceland',
					i18nLabel: 'Country_Iceland',
				},
				{
					key: 'india',
					i18nLabel: 'Country_India',
				},
				{
					key: 'indonesia',
					i18nLabel: 'Country_Indonesia',
				},
				{
					key: 'iranIslamicRepublicOf',
					i18nLabel: 'Country_Iran_Islamic_Republic_of',
				},
				{
					key: 'iraq',
					i18nLabel: 'Country_Iraq',
				},
				{
					key: 'ireland',
					i18nLabel: 'Country_Ireland',
				},
				{
					key: 'israel',
					i18nLabel: 'Country_Israel',
				},
				{
					key: 'italy',
					i18nLabel: 'Country_Italy',
				},
				{
					key: 'jamaica',
					i18nLabel: 'Country_Jamaica',
				},
				{
					key: 'japan',
					i18nLabel: 'Country_Japan',
				},
				{
					key: 'jordan',
					i18nLabel: 'Country_Jordan',
				},
				{
					key: 'kazakhstan',
					i18nLabel: 'Country_Kazakhstan',
				},
				{
					key: 'kenya',
					i18nLabel: 'Country_Kenya',
				},
				{
					key: 'kiribati',
					i18nLabel: 'Country_Kiribati',
				},
				{
					key: 'koreaDemocraticPeoplesRepublicOf',
					i18nLabel: 'Country_Korea_Democratic_Peoples_Republic_of',
				},
				{
					key: 'koreaRepublicOf',
					i18nLabel: 'Country_Korea_Republic_of',
				},
				{
					key: 'kuwait',
					i18nLabel: 'Country_Kuwait',
				},
				{
					key: 'kyrgyzstan',
					i18nLabel: 'Country_Kyrgyzstan',
				},
				{
					key: 'laoPeoplesDemocraticRepublic',
					i18nLabel: 'Country_Lao_Peoples_Democratic_Republic',
				},
				{
					key: 'latvia',
					i18nLabel: 'Country_Latvia',
				},
				{
					key: 'lebanon',
					i18nLabel: 'Country_Lebanon',
				},
				{
					key: 'lesotho',
					i18nLabel: 'Country_Lesotho',
				},
				{
					key: 'liberia',
					i18nLabel: 'Country_Liberia',
				},
				{
					key: 'libyanArabJamahiriya',
					i18nLabel: 'Country_Libyan_Arab_Jamahiriya',
				},
				{
					key: 'liechtenstein',
					i18nLabel: 'Country_Liechtenstein',
				},
				{
					key: 'lithuania',
					i18nLabel: 'Country_Lithuania',
				},
				{
					key: 'luxembourg',
					i18nLabel: 'Country_Luxembourg',
				},
				{
					key: 'macao',
					i18nLabel: 'Country_Macao',
				},
				{
					key: 'macedoniaTheFormerYugoslavRepublicOf',
					i18nLabel: 'Country_Macedonia_The_Former_Yugoslav_Republic_of',
				},
				{
					key: 'madagascar',
					i18nLabel: 'Country_Madagascar',
				},
				{
					key: 'malawi',
					i18nLabel: 'Country_Malawi',
				},
				{
					key: 'malaysia',
					i18nLabel: 'Country_Malaysia',
				},
				{
					key: 'maldives',
					i18nLabel: 'Country_Maldives',
				},
				{
					key: 'mali',
					i18nLabel: 'Country_Mali',
				},
				{
					key: 'malta',
					i18nLabel: 'Country_Malta',
				},
				{
					key: 'marshallIslands',
					i18nLabel: 'Country_Marshall_Islands',
				},
				{
					key: 'martinique',
					i18nLabel: 'Country_Martinique',
				},
				{
					key: 'mauritania',
					i18nLabel: 'Country_Mauritania',
				},
				{
					key: 'mauritius',
					i18nLabel: 'Country_Mauritius',
				},
				{
					key: 'mayotte',
					i18nLabel: 'Country_Mayotte',
				},
				{
					key: 'mexico',
					i18nLabel: 'Country_Mexico',
				},
				{
					key: 'micronesiaFederatedStatesOf',
					i18nLabel: 'Country_Micronesia_Federated_States_of',
				},
				{
					key: 'moldovaRepublicOf',
					i18nLabel: 'Country_Moldova_Republic_of',
				},
				{
					key: 'monaco',
					i18nLabel: 'Country_Monaco',
				},
				{
					key: 'mongolia',
					i18nLabel: 'Country_Mongolia',
				},
				{
					key: 'montserrat',
					i18nLabel: 'Country_Montserrat',
				},
				{
					key: 'morocco',
					i18nLabel: 'Country_Morocco',
				},
				{
					key: 'mozambique',
					i18nLabel: 'Country_Mozambique',
				},
				{
					key: 'myanmar',
					i18nLabel: 'Country_Myanmar',
				},
				{
					key: 'namibia',
					i18nLabel: 'Country_Namibia',
				},
				{
					key: 'nauru',
					i18nLabel: 'Country_Nauru',
				},
				{
					key: 'nepal',
					i18nLabel: 'Country_Nepal',
				},
				{
					key: 'netherlands',
					i18nLabel: 'Country_Netherlands',
				},
				{
					key: 'netherlandsAntilles',
					i18nLabel: 'Country_Netherlands_Antilles',
				},
				{
					key: 'newCaledonia',
					i18nLabel: 'Country_New_Caledonia',
				},
				{
					key: 'newZealand',
					i18nLabel: 'Country_New_Zealand',
				},
				{
					key: 'nicaragua',
					i18nLabel: 'Country_Nicaragua',
				},
				{
					key: 'niger',
					i18nLabel: 'Country_Niger',
				},
				{
					key: 'nigeria',
					i18nLabel: 'Country_Nigeria',
				},
				{
					key: 'niue',
					i18nLabel: 'Country_Niue',
				},
				{
					key: 'norfolkIsland',
					i18nLabel: 'Country_Norfolk_Island',
				},
				{
					key: 'northernMarianaIslands',
					i18nLabel: 'Country_Northern_Mariana_Islands',
				},
				{
					key: 'norway',
					i18nLabel: 'Country_Norway',
				},
				{
					key: 'oman',
					i18nLabel: 'Country_Oman',
				},
				{
					key: 'pakistan',
					i18nLabel: 'Country_Pakistan',
				},
				{
					key: 'palau',
					i18nLabel: 'Country_Palau',
				},
				{
					key: 'palestinianTerritoryOccupied',
					i18nLabel: 'Country_Palestinian_Territory_Occupied',
				},
				{
					key: 'panama',
					i18nLabel: 'Country_Panama',
				},
				{
					key: 'papuaNewGuinea',
					i18nLabel: 'Country_Papua_New_Guinea',
				},
				{
					key: 'paraguay',
					i18nLabel: 'Country_Paraguay',
				},
				{
					key: 'peru',
					i18nLabel: 'Country_Peru',
				},
				{
					key: 'philippines',
					i18nLabel: 'Country_Philippines',
				},
				{
					key: 'pitcairn',
					i18nLabel: 'Country_Pitcairn',
				},
				{
					key: 'poland',
					i18nLabel: 'Country_Poland',
				},
				{
					key: 'portugal',
					i18nLabel: 'Country_Portugal',
				},
				{
					key: 'puertoRico',
					i18nLabel: 'Country_Puerto_Rico',
				},
				{
					key: 'qatar',
					i18nLabel: 'Country_Qatar',
				},
				{
					key: 'reunion',
					i18nLabel: 'Country_Reunion',
				},
				{
					key: 'romania',
					i18nLabel: 'Country_Romania',
				},
				{
					key: 'russianFederation',
					i18nLabel: 'Country_Russian_Federation',
				},
				{
					key: 'rwanda',
					i18nLabel: 'Country_Rwanda',
				},
				{
					key: 'saintHelena',
					i18nLabel: 'Country_Saint_Helena',
				},
				{
					key: 'saintKittsAndNevis',
					i18nLabel: 'Country_Saint_Kitts_and_Nevis',
				},
				{
					key: 'saintLucia',
					i18nLabel: 'Country_Saint_Lucia',
				},
				{
					key: 'saintPierreAndMiquelon',
					i18nLabel: 'Country_Saint_Pierre_and_Miquelon',
				},
				{
					key: 'saintVincentAndTheGrenadines',
					i18nLabel: 'Country_Saint_Vincent_and_The_Grenadines',
				},
				{
					key: 'samoa',
					i18nLabel: 'Country_Samoa',
				},
				{
					key: 'sanMarino',
					i18nLabel: 'Country_San_Marino',
				},
				{
					key: 'saoTomeAndPrincipe',
					i18nLabel: 'Country_Sao_Tome_and_Principe',
				},
				{
					key: 'saudiArabia',
					i18nLabel: 'Country_Saudi_Arabia',
				},
				{
					key: 'senegal',
					i18nLabel: 'Country_Senegal',
				},
				{
					key: 'serbiaAndMontenegro',
					i18nLabel: 'Country_Serbia_and_Montenegro',
				},
				{
					key: 'seychelles',
					i18nLabel: 'Country_Seychelles',
				},
				{
					key: 'sierraLeone',
					i18nLabel: 'Country_Sierra_Leone',
				},
				{
					key: 'singapore',
					i18nLabel: 'Country_Singapore',
				},
				{
					key: 'slovakia',
					i18nLabel: 'Country_Slovakia',
				},
				{
					key: 'slovenia',
					i18nLabel: 'Country_Slovenia',
				},
				{
					key: 'solomonIslands',
					i18nLabel: 'Country_Solomon_Islands',
				},
				{
					key: 'somalia',
					i18nLabel: 'Country_Somalia',
				},
				{
					key: 'southAfrica',
					i18nLabel: 'Country_South_Africa',
				},
				{
					key: 'southGeorgiaAndTheSouthSandwichIslands',
					i18nLabel: 'Country_South_Georgia_and_The_South_Sandwich_Islands',
				},
				{
					key: 'spain',
					i18nLabel: 'Country_Spain',
				},
				{
					key: 'sriLanka',
					i18nLabel: 'Country_Sri_Lanka',
				},
				{
					key: 'sudan',
					i18nLabel: 'Country_Sudan',
				},
				{
					key: 'suriname',
					i18nLabel: 'Country_Suriname',
				},
				{
					key: 'svalbardAndJanMayen',
					i18nLabel: 'Country_Svalbard_and_Jan_Mayen',
				},
				{
					key: 'swaziland',
					i18nLabel: 'Country_Swaziland',
				},
				{
					key: 'sweden',
					i18nLabel: 'Country_Sweden',
				},
				{
					key: 'switzerland',
					i18nLabel: 'Country_Switzerland',
				},
				{
					key: 'syrianArabRepublic',
					i18nLabel: 'Country_Syrian_Arab_Republic',
				},
				{
					key: 'taiwanProvinceOfChina',
					i18nLabel: 'Country_Taiwan_Province_of_China',
				},
				{
					key: 'tajikistan',
					i18nLabel: 'Country_Tajikistan',
				},
				{
					key: 'tanzaniaUnitedRepublicOf',
					i18nLabel: 'Country_Tanzania_United_Republic_of',
				},
				{
					key: 'thailand',
					i18nLabel: 'Country_Thailand',
				},
				{
					key: 'timorLeste',
					i18nLabel: 'Country_Timor_leste',
				},
				{
					key: 'togo',
					i18nLabel: 'Country_Togo',
				},
				{
					key: 'tokelau',
					i18nLabel: 'Country_Tokelau',
				},
				{
					key: 'tonga',
					i18nLabel: 'Country_Tonga',
				},
				{
					key: 'trinidadAndTobago',
					i18nLabel: 'Country_Trinidad_and_Tobago',
				},
				{
					key: 'tunisia',
					i18nLabel: 'Country_Tunisia',
				},
				{
					key: 'turkey',
					i18nLabel: 'Country_Turkey',
				},
				{
					key: 'turkmenistan',
					i18nLabel: 'Country_Turkmenistan',
				},
				{
					key: 'turksAndCaicosIslands',
					i18nLabel: 'Country_Turks_and_Caicos_Islands',
				},
				{
					key: 'tuvalu',
					i18nLabel: 'Country_Tuvalu',
				},
				{
					key: 'uganda',
					i18nLabel: 'Country_Uganda',
				},
				{
					key: 'ukraine',
					i18nLabel: 'Country_Ukraine',
				},
				{
					key: 'unitedArabEmirates',
					i18nLabel: 'Country_United_Arab_Emirates',
				},
				{
					key: 'unitedKingdom',
					i18nLabel: 'Country_United_Kingdom',
				},
				{
					key: 'unitedStates',
					i18nLabel: 'Country_United_States',
				},
				{
					key: 'unitedStatesMinorOutlyingIslands',
					i18nLabel: 'Country_United_States_Minor_Outlying_Islands',
				},
				{
					key: 'uruguay',
					i18nLabel: 'Country_Uruguay',
				},
				{
					key: 'uzbekistan',
					i18nLabel: 'Country_Uzbekistan',
				},
				{
					key: 'vanuatu',
					i18nLabel: 'Country_Vanuatu',
				},
				{
					key: 'venezuela',
					i18nLabel: 'Country_Venezuela',
				},
				{
					key: 'vietNam',
					i18nLabel: 'Country_Viet_Nam',
				},
				{
					key: 'virginIslandsBritish',
					i18nLabel: 'Country_Virgin_Islands_British',
				},
				{
					key: 'virginIslandsUS',
					i18nLabel: 'Country_Virgin_Islands_US',
				},
				{
					key: 'wallisAndFutuna',
					i18nLabel: 'Country_Wallis_and_Futuna',
				},
				{
					key: 'westernSahara',
					i18nLabel: 'Country_Western_Sahara',
				},
				{
					key: 'yemen',
					i18nLabel: 'Country_Yemen',
				},
				{
					key: 'zambia',
					i18nLabel: 'Country_Zambia',
				},
				{
					key: 'zimbabwe',
					i18nLabel: 'Country_Zimbabwe',
				},
				{
					key: 'worldwide',
					i18nLabel: 'Worldwide',
				},
			],
			wizard: {
				step: 2,
				order: 4,
			},
		});
		await this.add('Website', '', {
			type: 'string',
			wizard: {
				step: 2,
				order: 5,
			},
		});
		await this.add('Server_Type', '', {
			type: 'select',
			values: [
				{
					key: 'privateTeam',
					i18nLabel: 'Private_Team',
				},
				{
					key: 'publicCommunity',
					i18nLabel: 'Public_Community',
				},
			],
			wizard: {
				step: 3,
				order: 2,
			},
		});
		await this.add('Allow_Marketing_Emails', true, {
			type: 'boolean',
		});
		await this.add('Register_Server', false, {
			type: 'boolean',
		});
		await this.add('Organization_Email', '', {
			type: 'string',
		});
		await this.add('Triggered_Emails_Count', 0, {
			type: 'int',
			hidden: true,
		});
	});

	await this.section('Cloud_Info', async function () {
		await this.add('Nps_Url', 'https://nps.rocket.chat', {
			type: 'string',
			hidden: true,
			readonly: true,
			enableQuery: {
				_id: 'Register_Server',
				value: true,
			},
			secret: true,
		});

		await this.add('Cloud_Url', 'https://cloud.rocket.chat', {
			type: 'string',
			hidden: true,
			readonly: true,
			enableQuery: {
				_id: 'Register_Server',
				value: true,
			},
			secret: true,
		});

		await this.add('Cloud_Service_Agree_PrivacyTerms', false, {
			type: 'boolean',
		});

		await this.add('Cloud_Workspace_Id', '', {
			type: 'string',
			hidden: true,
			readonly: true,
			enableQuery: {
				_id: 'Register_Server',
				value: true,
			},
			secret: true,
		});

		await this.add('Cloud_Workspace_Name', '', {
			type: 'string',
			hidden: true,
			readonly: true,
			enableQuery: {
				_id: 'Register_Server',
				value: true,
			},
			secret: true,
		});

		await this.add('Cloud_Workspace_Client_Id', '', {
			type: 'string',
			hidden: true,
			readonly: true,
			enableQuery: {
				_id: 'Register_Server',
				value: true,
			},
			secret: true,
		});

		await this.add('Cloud_Workspace_Client_Secret', '', {
			type: 'string',
			hidden: true,
			readonly: true,
			enableQuery: {
				_id: 'Register_Server',
				value: true,
			},
			secret: true,
		});

		await this.add('Cloud_Workspace_Client_Secret_Expires_At', '', {
			type: 'int',
			hidden: true,
			readonly: true,
			enableQuery: {
				_id: 'Register_Server',
				value: true,
			},
			secret: true,
		});

		await this.add('Cloud_Workspace_Registration_Client_Uri', '', {
			type: 'string',
			hidden: true,
			readonly: true,
			enableQuery: {
				_id: 'Register_Server',
				value: true,
			},
			secret: true,
		});

		await this.add('Cloud_Workspace_PublicKey', '', {
			type: 'string',
			hidden: true,
			readonly: true,
			enableQuery: {
				_id: 'Register_Server',
				value: true,
			},
			secret: true,
		});

		await this.add('Cloud_Workspace_License', '', {
			type: 'string',
			hidden: true,
			readonly: true,
			enableQuery: {
				_id: 'Register_Server',
				value: true,
			},
			secret: true,
		});

		await this.add('Cloud_Workspace_Had_Trial', false, {
			type: 'boolean',
			hidden: true,
			readonly: true,
			secret: true,
		});

		await this.add('Cloud_Workspace_Access_Token', '', {
			type: 'string',
			hidden: true,
			readonly: true,
			enableQuery: {
				_id: 'Register_Server',
				value: true,
			},
			secret: true,
		});

		await this.add('Cloud_Workspace_Access_Token_Expires_At', new Date(0), {
			type: 'date',
			hidden: true,
			readonly: true,
			enableQuery: {
				_id: 'Register_Server',
				value: true,
			},
			secret: true,
		});

		await this.add('Cloud_Workspace_Registration_State', '', {
			type: 'string',
			hidden: true,
			readonly: true,
			enableQuery: {
				_id: 'Register_Server',
				value: true,
			},
			secret: true,
		});
	});
});

void settingsRegistry.addGroup('Rate Limiter', async function () {
	await this.section('DDP_Rate_Limiter', async function () {
		await this.add('DDP_Rate_Limit_IP_Enabled', true, { type: 'boolean' });
		await this.add('DDP_Rate_Limit_IP_Requests_Allowed', 120000, {
			type: 'int',
			enableQuery: { _id: 'DDP_Rate_Limit_IP_Enabled', value: true },
		});
		await this.add('DDP_Rate_Limit_IP_Interval_Time', 60000, {
			type: 'int',
			enableQuery: { _id: 'DDP_Rate_Limit_IP_Enabled', value: true },
		});

		await this.add('DDP_Rate_Limit_User_Enabled', true, { type: 'boolean' });
		await this.add('DDP_Rate_Limit_User_Requests_Allowed', 1200, {
			type: 'int',
			enableQuery: { _id: 'DDP_Rate_Limit_User_Enabled', value: true },
		});
		await this.add('DDP_Rate_Limit_User_Interval_Time', 60000, {
			type: 'int',
			enableQuery: { _id: 'DDP_Rate_Limit_User_Enabled', value: true },
		});

		await this.add('DDP_Rate_Limit_Connection_Enabled', true, { type: 'boolean' });
		await this.add('DDP_Rate_Limit_Connection_Requests_Allowed', 600, {
			type: 'int',
			enableQuery: { _id: 'DDP_Rate_Limit_Connection_Enabled', value: true },
		});
		await this.add('DDP_Rate_Limit_Connection_Interval_Time', 60000, {
			type: 'int',
			enableQuery: { _id: 'DDP_Rate_Limit_Connection_Enabled', value: true },
		});

		await this.add('DDP_Rate_Limit_User_By_Method_Enabled', true, { type: 'boolean' });
		await this.add('DDP_Rate_Limit_User_By_Method_Requests_Allowed', 20, {
			type: 'int',
			enableQuery: { _id: 'DDP_Rate_Limit_User_By_Method_Enabled', value: true },
		});
		await this.add('DDP_Rate_Limit_User_By_Method_Interval_Time', 10000, {
			type: 'int',
			enableQuery: { _id: 'DDP_Rate_Limit_User_By_Method_Enabled', value: true },
		});

		await this.add('DDP_Rate_Limit_Connection_By_Method_Enabled', true, { type: 'boolean' });
		await this.add('DDP_Rate_Limit_Connection_By_Method_Requests_Allowed', 10, {
			type: 'int',
			enableQuery: { _id: 'DDP_Rate_Limit_Connection_By_Method_Enabled', value: true },
		});
		await this.add('DDP_Rate_Limit_Connection_By_Method_Interval_Time', 10000, {
			type: 'int',
			enableQuery: { _id: 'DDP_Rate_Limit_Connection_By_Method_Enabled', value: true },
		});
	});

	await this.section('API_Rate_Limiter', async function () {
		await this.add('API_Enable_Rate_Limiter', true, { type: 'boolean' });
		await this.add('API_Enable_Rate_Limiter_Dev', true, {
			type: 'boolean',
			enableQuery: { _id: 'API_Enable_Rate_Limiter', value: true },
		});
		await this.add('API_Enable_Rate_Limiter_Limit_Calls_Default', 10, {
			type: 'int',
			enableQuery: { _id: 'API_Enable_Rate_Limiter', value: true },
		});
		await this.add('API_Enable_Rate_Limiter_Limit_Time_Default', 60000, {
			type: 'int',
			enableQuery: { _id: 'API_Enable_Rate_Limiter', value: true },
		});
	});

	await this.section('Feature_Limiting', async function () {
		await this.add('Rate_Limiter_Limit_RegisterUser', 1, {
			type: 'int',
			enableQuery: { _id: 'API_Enable_Rate_Limiter', value: true },
		});
	});
});

void settingsRegistry.addGroup('Troubleshoot', async function () {
	await this.add('Troubleshoot_Disable_Notifications', false, {
		type: 'boolean',
		alert: 'Troubleshoot_Disable_Notifications_Alert',
	});

	// this settings will let clients know in case presence has been disabled
	await this.add('Presence_broadcast_disabled', false, {
		type: 'boolean',
		public: true,
		readonly: true,
	});

	await this.add('Troubleshoot_Disable_Presence_Broadcast', false, {
		type: 'boolean',
		alert: 'Troubleshoot_Disable_Presence_Broadcast_Alert',
		enableQuery: { _id: 'Presence_broadcast_disabled', value: false },
	});

	await this.add('Troubleshoot_Disable_Instance_Broadcast', false, {
		type: 'boolean',
		alert: 'Troubleshoot_Disable_Instance_Broadcast_Alert',
	});
	await this.add('Troubleshoot_Disable_Sessions_Monitor', false, {
		type: 'boolean',
		alert: 'Troubleshoot_Disable_Sessions_Monitor_Alert',
	});
	await this.add('Troubleshoot_Disable_Livechat_Activity_Monitor', false, {
		type: 'boolean',
		alert: 'Troubleshoot_Disable_Livechat_Activity_Monitor_Alert',
	});
	await this.add('Troubleshoot_Disable_Statistics_Generator', false, {
		type: 'boolean',
		alert: 'Troubleshoot_Disable_Statistics_Generator_Alert',
	});
	await this.add('Troubleshoot_Disable_Data_Exporter_Processor', false, {
		type: 'boolean',
		alert: 'Troubleshoot_Disable_Data_Exporter_Processor_Alert',
	});
	await this.add('Troubleshoot_Disable_Workspace_Sync', false, {
		type: 'boolean',
		alert: 'Troubleshoot_Disable_Workspace_Sync_Alert',
	});
});

void settingsRegistry.addGroup('Call_Center', async function () {
	// TODO: Check with the backend team if an i18nPlaceholder is possible
	await this.with({ tab: 'Settings' }, async function () {
		await this.section('General_Settings', async function () {
			await this.add('VoIP_Enabled', false, {
				type: 'boolean',
				public: true,
				i18nDescription: 'VoIP_Enabled_Description',
				enableQuery: {
					_id: 'Livechat_enabled',
					value: true,
				},
			});
			await this.add('VoIP_JWT_Secret', '', {
				type: 'password',
				i18nDescription: 'VoIP_JWT_Secret_description',
				enableQuery: {
					_id: 'VoIP_Enabled',
					value: true,
				},
			});
		});
		await this.section('Voip_Server_Configuration', async function () {
			await this.add('VoIP_Server_Name', '', {
				type: 'string',
				public: true,
				placeholder: 'WebSocket Server',
				enableQuery: {
					_id: 'VoIP_Enabled',
					value: true,
				},
			});
			await this.add('VoIP_Server_Websocket_Path', '', {
				type: 'string',
				public: true,
				placeholder: 'wss://your.domain.name',
				enableQuery: {
					_id: 'VoIP_Enabled',
					value: true,
				},
			});
			await this.add('VoIP_Retry_Count', -1, {
				type: 'int',
				public: true,
				i18nDescription: 'VoIP_Retry_Count_Description',
				placeholder: '1',
				enableQuery: {
					_id: 'VoIP_Enabled',
					value: true,
				},
			});
			await this.add('VoIP_Enable_Keep_Alive_For_Unstable_Networks', true, {
				type: 'boolean',
				public: true,
				i18nDescription: 'VoIP_Enable_Keep_Alive_For_Unstable_Networks_Description',
				enableQuery: {
					_id: 'Livechat_enabled',
					value: true,
				},
			});
		});

		await this.section('Management_Server', async function () {
			await this.add('VoIP_Management_Server_Host', '', {
				type: 'string',
				public: true,
				placeholder: 'https://your.domain.name',
				enableQuery: {
					_id: 'VoIP_Enabled',
					value: true,
				},
			});

			await this.add('VoIP_Management_Server_Port', 0, {
				type: 'int',
				public: true,
				placeholder: '8080',
				enableQuery: {
					_id: 'VoIP_Enabled',
					value: true,
				},
			});

			await this.add('VoIP_Management_Server_Name', '', {
				type: 'string',
				public: true,
				placeholder: 'Server Name',
				enableQuery: {
					_id: 'VoIP_Enabled',
					value: true,
				},
			});

			await this.add('VoIP_Management_Server_Username', '', {
				type: 'string',
				public: true,
				placeholder: 'Username',
				enableQuery: {
					_id: 'VoIP_Enabled',
					value: true,
				},
			});

			await this.add('VoIP_Management_Server_Password', '', {
				type: 'password',
				public: true,
				enableQuery: {
					_id: 'VoIP_Enabled',
					value: true,
				},
			});
		});
	});
});
