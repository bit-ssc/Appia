import type { IUser } from '@rocket.chat/core-typings';
import { ButtonGroup, Menu, Option } from '@rocket.chat/fuselage';
import { useRoute, usePermission, useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';

import { useChangeAdminStatusAction } from './hooks/useChangeAdminStatusAction';
import { useChangeUserStatusAction } from './hooks/useChangeUserStatusAction';
import { useDeleteUserAction } from './hooks/useDeleteUserAction';
import { useResetE2EEKeyAction } from './hooks/useResetE2EEKeyAction';
import { useResetTOTPAction } from './hooks/useResetTOTPAction';
import UserInfo from '../../../components/UserInfo';
import { useActionSpread } from '../../hooks/useActionSpread';

type AdminUserInfoActionsProps = {
	username: IUser['username'];
	userId: IUser['_id'];
	isFederatedUser: IUser['federated'];
	isActive: boolean;
	isAdmin: boolean;
	onChange: () => void;
	onReload: () => void;
};

const AdminUserInfoActions = ({
	username,
	userId,
	isFederatedUser,
	isActive,
	isAdmin,
	onChange,
	onReload,
}: AdminUserInfoActionsProps): ReactElement => {
	const t = useTranslation();
	const directRoute = useRoute('direct');
	const userRoute = useRoute('admin-users');
	const canDirectMessage = usePermission('create-d');
	const canEditOtherUserInfo = usePermission('edit-other-user-info');

	const changeAdminStatusAction = useChangeAdminStatusAction(userId, isAdmin, onChange);
	const changeUserStatusAction = useChangeUserStatusAction(userId, isActive, onChange);
	const deleteUserAction = useDeleteUserAction(userId, onChange, onReload);
	const resetTOTPAction = useResetTOTPAction(userId);
	const resetE2EKeyAction = useResetE2EEKeyAction(userId);

	const directMessageClick = useCallback(
		() =>
			username &&
			directRoute.push({
				rid: username,
			}),
		[directRoute, username],
	);

	const editUserClick = useCallback(
		() =>
			userRoute.push({
				context: 'edit',
				id: userId,
			}),
		[userId, userRoute],
	);

	const options = useMemo(
		() => ({
			...(canDirectMessage && {
				directMessage: {
					icon: 'balloon' as const,
					label: t('Direct_Message'),
					title: t('Direct_Message'),
					action: directMessageClick,
				},
			}),
			...(canEditOtherUserInfo && {
				editUser: {
					icon: 'edit' as const,
					label: t('Edit'),
					title: isFederatedUser ? t('Edit_Federated_User_Not_Allowed') : t('Edit'),
					action: editUserClick,
					disabled: isFederatedUser,
				},
			}),
			...(changeAdminStatusAction && !isFederatedUser && { makeAdmin: changeAdminStatusAction }),
			...(resetE2EKeyAction && !isFederatedUser && { resetE2EKey: resetE2EKeyAction }),
			...(resetTOTPAction && !isFederatedUser && { resetTOTP: resetTOTPAction }),
			...(deleteUserAction && { delete: deleteUserAction }),
			...(changeUserStatusAction && !isFederatedUser && { changeActiveStatus: changeUserStatusAction }),
		}),
		[
			t,
			canDirectMessage,
			directMessageClick,
			canEditOtherUserInfo,
			editUserClick,
			changeAdminStatusAction,
			changeUserStatusAction,
			deleteUserAction,
			resetE2EKeyAction,
			resetTOTPAction,
			isFederatedUser,
		],
	);

	const { actions: actionsDefinition, menu: menuOptions } = useActionSpread(options);

	const menu = useMemo(() => {
		if (!menuOptions) {
			return null;
		}

		return (
			<Menu
				mi='x4'
				placement='bottom-start'
				small={false}
				secondary
				flexShrink={0}
				key='menu'
				renderItem={({ label: { label, icon }, ...props }): ReactElement => <Option label={label} title={label} icon={icon} {...props} />}
				options={menuOptions}
			/>
		);
	}, [menuOptions]);

	// TODO: sanitize Action type to avoid any
	const actions = useMemo(() => {
		const mapAction = ([key, { label, icon, action, disabled, title }]: any): ReactElement => (
			<UserInfo.Action key={key} title={title} label={label} onClick={action} disabled={disabled} icon={icon} />
		);
		return [...actionsDefinition.map(mapAction), menu].filter(Boolean);
	}, [actionsDefinition, menu]);

	return (
		<ButtonGroup flexGrow={0} justifyContent='center' data-qa-id='UserInfoActions'>
			{actions}
		</ButtonGroup>
	);
};

export default AdminUserInfoActions;
