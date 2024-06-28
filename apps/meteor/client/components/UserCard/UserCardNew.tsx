import { Box, ActionButton } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactNode, ComponentProps } from 'react';
import React, { forwardRef } from 'react';

import UserCardContainer from './UserCardContainer';
import { ContactContextProvider } from '../../views/contact/ContactContext';
import User from '../../views/contact/User';

type UserCardProps = {
	className?: string;
	style?: ComponentProps<typeof Box>['style'];
	open?: () => void;
	name?: string;
	username?: string;
	etag?: string;
	customStatus?: ReactNode;
	roles?: ReactNode;
	bio?: ReactNode;
	status?: ReactNode;
	actions?: ReactNode;
	onClose?: () => void;
	nickname?: string;
	email?: string;
	employeeID?: string;
	importIds?: [];
	_id: string;
};

const UserCard = forwardRef(function UserCard(
	{
		className,
		style,
		open,
		// name,
		username,
		// etag,
		// bio = (
		// 	<>
		// 		<Skeleton width='100%' />
		// 		<Skeleton width='100%' />
		// 		<Skeleton width='100%' />
		// 	</>
		// ),
		// status = <Status.Offline />,
		// actions,
		onClose,
		// nickname,
		// email,
		// employeeID,
		// importIds,
		_id,
	}: UserCardProps,
	ref,
) {
	const t = useTranslation();
	// const displayName = nickname ? `${name}(${nickname})` : name;

	return (
		<ContactContextProvider>
			<UserCardContainer className={className} ref={ref} style={style}>
				<Box width='100%' minHeight={300}>
					{_id && <User id={username} style={{ padding: 0 }} open={open} />}
				</Box>
				{onClose && (
					<Box position='absolute' style={{ top: 24, right: 24 }}>
						<ActionButton small ghost title={t('Close')} icon='cross' onClick={onClose} />
					</Box>
				)}
			</UserCardContainer>
		</ContactContextProvider>
	);
});

export default UserCard;
