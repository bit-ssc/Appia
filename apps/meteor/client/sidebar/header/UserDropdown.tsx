import type { IUser, ValueOf } from '@rocket.chat/core-typings';
import { UserStatus as UserStatusEnum } from '@rocket.chat/core-typings';
import { Box, Margins, Option, OptionColumn, OptionContent, OptionDivider, OptionTitle } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useAtLeastOnePermission, useLayout, useRoute, useLogout, useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import { FlowRouter } from 'meteor/kadira:flow-router';
import type { ReactElement } from 'react';
import React from 'react';

import EditStatusModal from './EditStatusModal';
import { settings } from '../../../app/settings/client';
import { AccountBox } from '../../../app/ui-utils/client';
import { userStatus } from '../../../app/user-status/client';
import { callbacks } from '../../../lib/callbacks';
import MarkdownText from '../../components/MarkdownText';
import { UserStatus } from '../../components/UserStatus';
import UserAvatar from '../../components/avatar/UserAvatar';
import { useReactiveValue } from '../../hooks/useReactiveValue';
import { useUserDisplayName } from '../../hooks/useUserDisplayName';
import { imperativeModal } from '../../lib/imperativeModal';
import { useStatusDisabledModal } from '../../views/admin/customUserStatus/hooks/useStatusDisabledModal';

const ADMIN_PERMISSIONS = [
	'view-logs',
	'manage-emoji',
	'manage-sounds',
	'view-statistics',
	'manage-oauth-apps',
	'view-privileged-setting',
	'manage-selected-settings',
	'view-room-administration',
	'view-user-administration',
	'access-setting-permissions',
	'manage-outgoing-integrations',
	'manage-incoming-integrations',
	'manage-own-outgoing-integrations',
	'manage-own-incoming-integrations',
	'view-engagement-dashboard',
];

const isDefaultStatus = (id: string): boolean => (Object.values(UserStatusEnum) as string[]).includes(id);

const isDefaultStatusName = (_name: string, id: string): _name is UserStatusEnum => isDefaultStatus(id);

const setStatus = (status: (typeof userStatus.list)['']): void => {
	AccountBox.setStatus(status.statusType, !isDefaultStatus(status.id) ? status.name : '');
	callbacks.run('userStatusManuallySet', status);
};

const translateStatusName = (t: ReturnType<typeof useTranslation>, status: (typeof userStatus.list)['']): string => {
	if (isDefaultStatusName(status.name, status.id)) {
		return t(status.name as TranslationKey);
	}

	return status.name;
};

type UserDropdownProps = {
	user: Pick<IUser, 'username' | 'name' | 'avatarETag' | 'status' | 'statusText'>;
	onClose: () => void;
};

const getItems = (): ReturnType<typeof AccountBox.getItems> => AccountBox.getItems();

const UserDropdown = ({ user, onClose }: UserDropdownProps): ReactElement => {
	const t = useTranslation();
	const accountRoute = useRoute('account-index');
	const adminRoute = useRoute('admin-info');
	const logout = useLogout();
	const { sidebar, isMobile } = useLayout();
	const presenceDisabled = useSetting<boolean>('Presence_broadcast_disabled');
	const handleStatusDisabledModal = useStatusDisabledModal();

	const { username, avatarETag, status, statusText } = user;

	const displayName = useUserDisplayName(user);

	const accountBoxItems = useReactiveValue(getItems);

	const showAdmin = useAtLeastOnePermission(ADMIN_PERMISSIONS);

	const filterInvisibleStatus = !useSetting('Accounts_AllowInvisibleStatusOption')
		? (status: ValueOf<(typeof userStatus)['list']>): boolean => status.name !== 'invisible'
		: (): boolean => true;

	const handleCustomStatus = useMutableCallback((e) => {
		e.preventDefault();
		imperativeModal.open({
			component: EditStatusModal,
			props: { userStatus: status, userStatusText: statusText, onClose: imperativeModal.close },
		});
		onClose();
	});

	const handleMyAccount = useMutableCallback(() => {
		accountRoute.push({});
		onClose();
	});

	const handleAdmin = useMutableCallback(() => {
		adminRoute.push();
		sidebar.toggle();
		onClose();
	});

	const handleLogout = useMutableCallback(() => {
		logout();
		onClose();
		if (settings.get('CAS_enabled')) {
			window.location.href = `${settings.get('CAS_base_url')}/logout?service=${location.origin}`;
		}
	});

	return (
		<Box display='flex' flexDirection='column' w={!isMobile ? '244px' : undefined}>
			<Box pi='x12' display='flex' flexDirection='row' alignItems='center'>
				<Box mie='x4'>
					<UserAvatar size='x36' username={username || ''} etag={avatarETag} />
				</Box>
				<Box mis='x4' display='flex' overflow='hidden' flexDirection='column' fontScale='p2' mb='neg-x4' flexGrow={1} flexShrink={1}>
					<Box withTruncatedText w='full' display='flex' alignItems='center' flexDirection='row'>
						<Margins inline='x4'>
							<UserStatus status={presenceDisabled ? 'disabled' : status} />
							<Box is='span' withTruncatedText display='inline-block' fontWeight='700'>
								{displayName}
							</Box>
						</Margins>
					</Box>
					<Box color='hint'>
						<MarkdownText
							withTruncatedText
							parseEmoji={true}
							content={statusText || t(status ?? 'offline')}
							variant='inlineWithoutBreaks'
						/>
					</Box>
				</Box>
			</Box>
			<OptionDivider />
			<OptionTitle>{t('Status')}</OptionTitle>
			{presenceDisabled && (
				<Box fontScale='p2' mi='x12' mb='x4'>
					<Box mbe='x4'>{t('User_status_disabled')}</Box>
					<Box is='a' color='info' onClick={handleStatusDisabledModal}>
						{t('Learn_more')}
					</Box>
				</Box>
			)}
			{Object.values(userStatus.list)
				.filter(filterInvisibleStatus)
				.map((status, i) => {
					const name = status.localizeName ? translateStatusName(t, status) : status.name;
					const modifier = status.statusType || user.status;

					return (
						<Option
							key={i}
							disabled={presenceDisabled}
							onClick={(): void => {
								setStatus(status);
								onClose();
							}}
						>
							<OptionColumn>
								<UserStatus status={modifier} />
							</OptionColumn>
							<OptionContent>
								<MarkdownText content={name} parseEmoji={true} variant='inline' />
							</OptionContent>
						</Option>
					);
				})}
			<Option icon='emoji' label={`${t('Custom_Status')}...`} onClick={handleCustomStatus} disabled={presenceDisabled}></Option>
			<OptionDivider />
			{/*
			<OptionTitle>{t('Theme')}</OptionTitle>
			<Option is='label' role='listitem'>
				<OptionIcon name='sun' />
				<OptionContent>{t('Theme_light')}</OptionContent>
				<OptionColumn>
					<RadioButton checked={selectedTheme === 'light'} onChange={setTheme('light')} m='x4' />
				</OptionColumn>
			</Option>
			<Option is='label' role='listitem'>
				<OptionIcon name='moon' />
				<OptionContent>{t('Theme_dark')}</OptionContent>
				<OptionColumn>
					<RadioButton checked={selectedTheme === 'dark'} onChange={setTheme('dark')} m='x4' />
				</OptionColumn>
			</Option>
			<Option is='label' role='listitem'>
				<OptionIcon name='desktop' />
				<OptionContent>{t('Theme_match_system')}</OptionContent>
				<OptionColumn>
					<RadioButton checked={selectedTheme === 'auto'} onChange={setTheme('auto')} m='x4' />
				</OptionColumn>
			</Option>
			<OptionDivider />
			*/}

			{(accountBoxItems.length || showAdmin) && (
				<>
					{showAdmin && <Option icon={'customize'} label={t('Administration')} onClick={handleAdmin}></Option>}
					{accountBoxItems.map((item, i) => {
						const action = (): void => {
							if (item.href) {
								FlowRouter.go(item.href);
								onClose();
							}
							if (item.sideNav) {
								SideNav.setFlex(item.sideNav);
								SideNav.openFlex();
								onClose();
							}
						};

						return <Option icon={item.icon} label={t(item.name)} onClick={item.href || item.sideNav ? action : undefined} key={i}></Option>;
					})}
					<Option.Divider />
				</>
			)}

			<Option icon='user' label={t('My_Account')} onClick={handleMyAccount}></Option>
			<Option icon='sign-out' label={t('Logout')} onClick={handleLogout}></Option>
		</Box>
	);
};

export default UserDropdown;
