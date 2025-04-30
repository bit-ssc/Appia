import { Box } from '@rocket.chat/fuselage';
// import { useLayoutSizes, useLayoutContextualBarPosition } from '@rocket.chat/ui-contexts';
import type { FC, ComponentProps } from 'react';
import React, { memo } from 'react';

// import { usePanelContext } from '../../views/root/contexts/PanelProvider';

const VerticalBar: FC<ComponentProps<typeof Box>> = ({ children, bg = 'room', ...props }) => {
	// const sizes = useLayoutSizes();
	// const position = useLayoutContextualBarPosition();
	// const { fullScreenModule } = usePanelContext();
	const { roomFullScreen } = props;
	return (
		<Box
			rcx-vertical-bar
			bg={bg}
			display='flex'
			flexDirection='column'
			flexShrink={0}
			flexGrow={roomFullScreen ? 0 : 1}
			width={roomFullScreen ? '32%' : '100%'}
			minWidth={roomFullScreen ? '320px' : '0'}
			borderInlineStartWidth='1px'
			borderInlineStartColor='#DCDCDC'
			borderInlineStartStyle='solid'
			height={'calc(100% - 200px)'}
			position={roomFullScreen ? 'absolute' : 'relative'}
			zIndex={5}
			insetInlineEnd={'none'}
			insetBlockStart={'none'}
			marginBlockStart={roomFullScreen ? '0' : '8px'}
			borderRadius={roomFullScreen ? '0' : '8px'}
			{...props}
		>
			{children}
		</Box>
	);
};

export default memo(VerticalBar);
