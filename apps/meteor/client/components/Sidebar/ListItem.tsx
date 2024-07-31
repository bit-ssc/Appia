import { Option, OptionColumn, OptionContent, OptionIcon } from '@rocket.chat/fuselage';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import React from 'react';

type ListItemProps = {
	icon?: ComponentProps<typeof OptionIcon>['name'] | React.ReactElement;
	text: ReactNode;
	input?: ReactNode;
	loading?: boolean;
	children?: ReactNode;
} & ComponentProps<typeof Option>;

const ListItem = ({ icon, text, input, children, ...props }: ListItemProps): ReactElement => (
	<Option {...props}>
		{typeof icon === 'string' ? <OptionIcon name={icon} /> : icon}
		<OptionContent>{text}</OptionContent>
		{input && <OptionColumn>{input}</OptionColumn>}
		{children && <OptionColumn>{children}</OptionColumn>}
	</Option>
);

export default ListItem;
