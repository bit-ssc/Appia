import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import type { ReactElement } from 'react';
import React from 'react';

import KeyboardShortcuts from './KeyboardShortcuts';
import type { ToolboxContextValue } from '../../contexts/ToolboxContext';

const KeyboardShortcutsWithData = ({ tabBar }: { tabBar: ToolboxContextValue['tabBar'] }): ReactElement => {
	const handleClose = useMutableCallback(() => tabBar?.close());
	return <KeyboardShortcuts handleClose={handleClose} />;
};

export default KeyboardShortcutsWithData;
