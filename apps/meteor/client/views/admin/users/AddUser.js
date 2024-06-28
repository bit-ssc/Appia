import { Field, Box, Button } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useEndpoint, useRoute, useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useCallback, useState } from 'react';

import UserForm from './UserForm';
import { useSmtpConfig } from './hooks/useSmtpConfig';
import { parseCSV } from '../../../../lib/utils/parseCSV';
import { useEndpointAction } from '../../../hooks/useEndpointAction';
import { useForm } from '../../../hooks/useForm';

const AddUser = ({ onReload, ...props }) => {
	const t = useTranslation();

	const router = useRoute('admin-users');

	const getRoleData = useEndpoint('GET', '/v1/roles.list');

	const { data } = useQuery(['roles'], async () => {
		const roles = await getRoleData();
		return roles;
	});

	const isSmtpEnabled = useSmtpConfig();

	const [errors, setErrors] = useState({});

	const validationKeys = {
		name: (name) =>
			setErrors((errors) => ({
				...errors,
				name: !name.trim().length ? t('The_field_is_required', t('name')) : undefined,
			})),
		username: (username) =>
			setErrors((errors) => ({
				...errors,
				username: !username.trim().length ? t('The_field_is_required', t('username')) : undefined,
			})),
		email: (email) =>
			setErrors((errors) => ({
				...errors,
				email: !email.trim().length ? t('The_field_is_required', t('email')) : undefined,
			})),
		password: (password, values) =>
			setErrors((errors) => ({
				...errors,
				password: !password.trim().length && !values.setRandomPassword ? t('The_field_is_required', t('password')) : undefined,
			})),
		setRandomPassword: (setRandomPassword, values) =>
			setErrors((errors) => ({
				...errors,
				password: !values.password.trim().length && !setRandomPassword ? t('The_field_is_required', t('password')) : undefined,
			})),
	};

	const validateForm = ({ key, value, values }) => {
		validationKeys[key] && validationKeys[key](value, values);
	};

	const defaultUserRoles = parseCSV(String(useSetting('Accounts_Registration_Users_Default_Roles')));

	const { values, handlers, reset, hasUnsavedChanges } = useForm(
		{
			roles: defaultUserRoles,
			name: '',
			username: '',
			statusText: '',
			bio: '',
			nickname: '',
			email: '',
			password: '',
			verified: false,
			requirePasswordChange: false,
			setRandomPassword: false,
			sendWelcomeEmail: isSmtpEnabled,
			joinDefaultChannels: true,
			customFields: {},
		},
		validateForm,
	);

	const goToUser = useCallback(
		(id) =>
			router.push({
				context: 'info',
				id,
			}),
		[router],
	);

	const saveAction = useEndpointAction('POST', '/v1/users.create', { successMessage: t('User_created_successfully!') });
	const eventStats = useEndpointAction('POST', '/v1/statistics.telemetry');

	const handleSave = useMutableCallback(async () => {
		Object.entries(values).forEach(([key, value]) => {
			validateForm({ key, value, values });
		});

		const { name, username, password, email, setRandomPassword } = values;
		if (name === '' || username === '' || email === '') {
			return false;
		}
		if (password === '' && setRandomPassword === false) {
			return false;
		}

		const result = await saveAction(values);
		if (result.success) {
			eventStats({
				params: [{ eventName: 'updateCounter', settingsId: 'Manual_Entry_User_Count' }],
			});
			goToUser(result.user._id);
			onReload();
		}
	});

	const availableRoles = useMemo(() => data?.roles?.map(({ _id, description, name }) => [_id, description || name]) ?? [], [data]);

	const append = useMemo(
		() => (
			<Field>
				<Field.Row>
					<Box display='flex' flexDirection='row' justifyContent='space-between' w='full'>
						<Button flexGrow={1} disabled={!hasUnsavedChanges} onClick={reset} mie='x4'>
							{t('Cancel')}
						</Button>
						<Button flexGrow={1} disabled={!hasUnsavedChanges} onClick={handleSave}>
							{t('Save')}
						</Button>
					</Box>
				</Field.Row>
			</Field>
		),
		[hasUnsavedChanges, reset, t, handleSave],
	);

	return (
		<UserForm
			errors={errors}
			formValues={values}
			formHandlers={handlers}
			availableRoles={availableRoles}
			append={append}
			isSmtpEnabled={isSmtpEnabled}
			{...props}
		/>
	);
};

export default AddUser;
