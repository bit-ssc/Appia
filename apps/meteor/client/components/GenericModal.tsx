import type { Icon } from '@rocket.chat/fuselage';
import { Button, Modal } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { FC, ComponentProps, ReactElement, ReactNode } from 'react';
import React from 'react';

import type { RequiredModalProps } from './withDoNotAskAgain';
import { withDoNotAskAgain } from './withDoNotAskAgain';

type VariantType = 'danger' | 'warning' | 'info' | 'success';

type GenericModalProps = RequiredModalProps & {
	variant?: VariantType;
	children?: ReactNode;
	cancelText?: ReactNode;
	confirmText?: ReactNode;
	title?: string | ReactElement;
	icon?: ComponentProps<typeof Icon>['name'] | ReactElement | null;
	confirmDisabled?: boolean;
	tagline?: ReactNode;
	onCancel?: () => Promise<void> | void;
	onClose?: () => Promise<void> | void;
} & Omit<ComponentProps<typeof Modal>, 'title'>;

const iconMap: Record<string, ComponentProps<typeof Icon>['name']> = {
	danger: 'modal-warning',
	warning: 'modal-warning',
	info: 'info',
	success: 'check',
};

const getButtonProps = (variant: VariantType): ComponentProps<typeof Button> => {
	switch (variant) {
		case 'danger':
			return { danger: true };
		case 'warning':
			return { primary: true };
		default:
			return {};
	}
};

const renderIcon = (icon: GenericModalProps['icon'], variant: VariantType): ReactNode => {
	if (icon === null) {
		return null;
	}

	if (icon === undefined) {
		return <Modal.Icon color={variant} name={iconMap[variant]} />;
	}

	if (typeof icon === 'string') {
		return <Modal.Icon name={icon} />;
	}

	return icon;
};

const GenericModal: FC<GenericModalProps> = ({
	variant = 'info',
	children,
	cancelText,
	confirmText,
	title,
	icon,
	onCancel,
	onClose = onCancel,
	onConfirm,
	dontAskAgain,
	confirmDisabled,
	tagline,
	wrapperFunction,
	...props
}) => {
	const t = useTranslation();

	return (
		<Modal wrapperFunction={wrapperFunction} {...props}>
			<Modal.Header>
				{renderIcon(icon, variant)}
				<Modal.HeaderText>
					{tagline && <Modal.Tagline>{tagline}</Modal.Tagline>}
					<Modal.Title>{title ?? t('Are_you_sure')}</Modal.Title>
				</Modal.HeaderText>
				<Modal.Close title={t('Close')} onClick={onClose} />
			</Modal.Header>
			<Modal.Content fontScale='p2'>{children}</Modal.Content>
			<Modal.Footer justifyContent={dontAskAgain ? 'space-between' : 'end'}>
				{dontAskAgain}
				<Modal.FooterControllers>
					{onCancel && (
						<Button secondary onClick={onCancel}>
							{cancelText ?? t('Cancel')}
						</Button>
					)}
					{wrapperFunction && (
						<Button {...getButtonProps(variant)} type='submit' disabled={confirmDisabled}>
							{confirmText ?? t('Ok')}
						</Button>
					)}
					{!wrapperFunction && (
						<Button {...getButtonProps(variant)} onClick={onConfirm} disabled={confirmDisabled}>
							{confirmText ?? t('Ok')}
						</Button>
					)}
				</Modal.FooterControllers>
			</Modal.Footer>
		</Modal>
	);
};

export const GenericModalDoNotAskAgain = withDoNotAskAgain<GenericModalProps>(GenericModal);

export default GenericModal;
