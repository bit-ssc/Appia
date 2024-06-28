import { Box, Divider, Margins } from '@rocket.chat/fuselage';
import type { ReactElement } from 'react';
import React from 'react';

type KeyboardShortcutSectionProps = {
	title: string;
	command: string;
};

const KeyboardShortcutSection = ({ title, command }: KeyboardShortcutSectionProps): ReactElement => (
	<Margins block='x16'>
		<Box is='section' color='default'>
			<Box fontScale='p2m' fontWeight='700'>
				{title}
			</Box>
			<Divider />
			<Box fontScale='p2'>{command}</Box>
		</Box>
	</Margins>
);

export default KeyboardShortcutSection;
