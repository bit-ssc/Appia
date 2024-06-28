import { Box } from '@rocket.chat/fuselage';
import { useLayoutSizes, useLayoutContextualBarPosition } from '@rocket.chat/ui-contexts';
import type { FC, ComponentProps } from 'react';
import React, { memo } from 'react';

const VerticalBar: FC<ComponentProps<typeof Box>> = ({ children, bg = 'room', ...props }) => {
	const sizes = useLayoutSizes();
	const position = useLayoutContextualBarPosition();
	return (
		<Box
			rcx-vertical-bar
			bg={bg}
			display='flex'
			flexDirection='column'
			flexShrink={0}
			width={sizes.contextualBar}
			borderInlineStartWidth='default'
			borderInlineStartColor='extra-light'
			borderInlineStartStyle='solid'
			height='full'
			position={position}
			zIndex={5}
			insetInlineEnd={'none'}
			insetBlockStart={'none'}
			{...props}
		>
			{children}
		</Box>
	);
};

export default memo(VerticalBar);
