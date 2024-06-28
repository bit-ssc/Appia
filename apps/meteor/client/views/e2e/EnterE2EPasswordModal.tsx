import { Box, PasswordInput, Field, FieldGroup } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';

import GenericModal from '../../components/GenericModal';

const EnterE2EPasswordModal = ({
	onConfirm,
	onClose,
	onCancel,
}: {
	onConfirm: (password: string) => void;
	onClose: () => void;
	onCancel: () => void;
}): ReactElement => {
	const t = useTranslation();
	const [password, setPassword] = useState('');
	const [passwordError, setPasswordError] = useState<string | undefined>();

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			e.target.value !== '' && setPasswordError(undefined);
			setPassword(e.currentTarget.value);
		},
		[setPassword],
	);

	const handleConfirm = useMutableCallback((e): void => {
		e.preventDefault();
		if (password === '') {
			setPasswordError(t('Invalid_pass'));
			return;
		}

		return onConfirm(password);
	});

	return (
		<GenericModal
			wrapperFunction={(props) => <Box is='form' onSubmit={handleConfirm} {...props} />}
			variant='warning'
			title={t('Enter_E2E_password')}
			cancelText={t('Do_It_Later')}
			confirmText={t('Decode_Key')}
			onClose={onClose}
			onCancel={onCancel}
		>
			<Box dangerouslySetInnerHTML={{ __html: t('E2E_password_request_text') }} />
			<FieldGroup mbs='x24' w='full'>
				<Field>
					<Field.Row>
						<PasswordInput
							autoFocus
							error={passwordError}
							value={password}
							onChange={handleChange}
							placeholder={t('New_Password_Placeholder')}
						/>
					</Field.Row>
					<Field.Error>{passwordError}</Field.Error>
				</Field>
			</FieldGroup>
		</GenericModal>
	);
};

export default EnterE2EPasswordModal;
