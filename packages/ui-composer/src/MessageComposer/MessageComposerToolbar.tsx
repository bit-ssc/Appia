import { Box } from '@rocket.chat/fuselage';
import type { ComponentProps, ReactElement } from 'react';

const MessageComposerToolbar = (props: ComponentProps<typeof Box>): ReactElement => (
	<Box
		// backgroundColor='surface-neutral'
		pb='x4'
		pie='x4'
		display='flex'
		justifyContent='space-between'
		role='toolbar'
		w='full'
		{...props}
	/>
);

export default MessageComposerToolbar;
