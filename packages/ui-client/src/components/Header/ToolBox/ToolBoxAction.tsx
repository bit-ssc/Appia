import { IconButton, Box } from '@rocket.chat/fuselage';
import type { FC } from 'react';
import { forwardRef } from 'react';

const ToolBoxAction: FC<any> = forwardRef(function ToolBoxAction(
	{ id, icon, color, action, className, index, title, 'data-tooltip': tooltip, ...props },
	ref,
) {
	if (typeof icon !== 'string') {
		const Icon = icon;
		const { children, ...p } = props;

		return (
			<Box
				is='button'
				type='button'
				rcx-button
				rcx-button--icon
				rcx-button--square
				rcx-button--tiny-square
				className={className}
				onClick={() => action(id)}
				data-toolbox={index}
				key={id}
				position='relative'
				overflow='visible'
				ref={ref}
				color={!!color && color}
				flexShrink={0}
				{...{ ...p, ...(tooltip ? { 'data-tooltip': tooltip, 'title': '' } : { title }) }}
			>
				{children}
				<Icon />
			</Box>
		);
	}

	return (
		<IconButton
			data-qa-id={`ToolBoxAction-${icon}`}
			className={className}
			onClick={() => action(id)}
			data-toolbox={index}
			key={id}
			icon={icon}
			position='relative'
			tiny
			overflow='visible'
			ref={ref}
			color={!!color && color}
			{...{ ...props, ...(tooltip ? { 'data-tooltip': tooltip, 'title': '' } : { title }) }}
		/>
	);
});

export default ToolBoxAction;
