import { Box, PasswordInput } from '@rocket.chat/fuselage';
import { useAutoFocus } from '@rocket.chat/fuselage-hooks';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement, ChangeEvent, Ref, SyntheticEvent } from 'react';
import React, { useState } from 'react';

import type { OnConfirm } from './TwoFactorModal';
import { Method } from './TwoFactorModal';
import GenericModal from '../GenericModal';

type TwoFactorPasswordModalProps = {
	onConfirm: OnConfirm;
	onClose: () => void;
};

const TwoFactorPasswordModal = ({ onConfirm, onClose }: TwoFactorPasswordModalProps): ReactElement => {
	const t = useTranslation();
	const [code, setCode] = useState<string>('');
	const ref = useAutoFocus();

	const onConfirmTotpCode = (e: SyntheticEvent): void => {
		e.preventDefault();
		onConfirm(code, Method.PASSWORD);
	};

	const onChange = ({ currentTarget }: ChangeEvent<HTMLInputElement>): void => {
		setCode(currentTarget.value);
	};

	return (
		<GenericModal
			wrapperFunction={(props) => <Box is='form' onSubmit={onConfirmTotpCode} {...props} />}
			onCancel={onClose}
			confirmText={t('Verify')}
			title={t('Please_enter_your_password')}
			onClose={onClose}
			variant='warning'
			icon='info'
			confirmDisabled={!code}
		>
			<Box mbe='x16'>{t('For_your_security_you_must_enter_your_current_password_to_continue')}</Box>
			<Box mbe='x16' display='flex' justifyContent='stretch'>
				<PasswordInput ref={ref as Ref<HTMLInputElement>} value={code} onChange={onChange} placeholder={t('Password')}></PasswordInput>
			</Box>
		</GenericModal>
	);
};

export default TwoFactorPasswordModal;
