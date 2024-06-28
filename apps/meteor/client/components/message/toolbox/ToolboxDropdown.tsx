import { useLayout } from '@rocket.chat/ui-contexts';
import type { ReactNode, ReactElement } from 'react';
import React, { useRef } from 'react';

import DesktopToolboxDropdown from './DesktopToolboxDropdown';
import MobileToolboxDropdown from './MobileToolboxDropdown';

type ToolboxDropdownProps<R> = {
	children: ReactNode;
	reference: React.RefObject<R>;
	isLastMessage?: boolean;
};

const ToolboxDropdown = <TReferenceElement extends HTMLElement>({
	children,
	reference,
	isLastMessage,
}: ToolboxDropdownProps<TReferenceElement>): ReactElement => {
	const { isMobile } = useLayout();
	const target = useRef<HTMLButtonElement>(null);

	const Dropdown = isMobile ? MobileToolboxDropdown : DesktopToolboxDropdown;

	return (
		<Dropdown ref={target} reference={reference} isLastMessage={isLastMessage}>
			{children}
		</Dropdown>
	);
};

export default ToolboxDropdown;
