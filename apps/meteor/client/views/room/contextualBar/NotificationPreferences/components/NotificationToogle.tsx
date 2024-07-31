import { Box, Field, ToggleSwitch } from '@rocket.chat/fuselage';
import { useUniqueId } from '@rocket.chat/fuselage-hooks';
import type { ReactElement } from 'react';
import React, { memo } from 'react';

type NotificationToogleProps = {
	label: React.ReactElement;
	description?: string;
	onChange?: (e: unknown) => void;
	defaultChecked: boolean;
};

const NotificationToogle = ({ label, description, onChange, defaultChecked }: NotificationToogleProps): ReactElement => {
	const id = useUniqueId();

	return (
		<Box
			display='flex'
			m='x24'
			mbs={0}
			mbe={0}
			justifyContent='space-between'
			alignItems='center'
			style={{ borderBottom: '1px solid #E7E7E7' }}
		>
			<Box display='flex' flexDirection='column'>
				<Field.Label htmlFor={id} style={{ fontWeight: 400, padding: '16px 0', lineHeight: '22px', fontSize: '14px' }}>
					{label}
				</Field.Label>
				{description ? <Field.Description>{description}</Field.Description> : null}
			</Box>
			<ToggleSwitch id={id} onChange={onChange} defaultChecked={defaultChecked} />
		</Box>
	);
};

interface IRowProps {
	label: React.ReactElement;
	description?: string;
	value?: React.ReactElement;
}

export const Row = ({ label, description, value }: IRowProps): ReactElement => (
	<Box
		display='flex'
		m='x24'
		mbs={0}
		mbe={0}
		justifyContent='space-between'
		alignItems='center'
		style={{ borderBottom: '1px solid #E7E7E7' }}
	>
		<Box display='flex' flexDirection='column'>
			<Field.Label style={{ fontWeight: 400, padding: '16px 0', lineHeight: '22px', fontSize: '14px' }}>{label}</Field.Label>
			{description ? <Field.Description>{description}</Field.Description> : null}
		</Box>

		<Box>{value}</Box>
	</Box>
);

export default memo(NotificationToogle);
