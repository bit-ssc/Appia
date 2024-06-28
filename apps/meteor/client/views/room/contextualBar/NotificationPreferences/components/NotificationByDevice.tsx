import { Box, Accordion, Icon, FieldGroup } from '@rocket.chat/fuselage';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import React, { memo } from 'react';

type NotificationByDeviceProps = {
	device: string;
	icon: ComponentProps<typeof Icon>['name'];
	children: ReactNode;
};

const NotificationByDevice = ({ device, icon, children }: NotificationByDeviceProps): ReactElement => (
	<Accordion.Item
		title={
			<Box display='flex' alignItems='center'>
				<Icon name={icon} size='x18' />
				<Box fontScale='p2m' mi='x16'>
					{device}
				</Box>
			</Box>
		}
		data-qa-id={`${device}-notifications`}
	>
		<FieldGroup>{children}</FieldGroup>
	</Accordion.Item>
);

export default memo(NotificationByDevice);
