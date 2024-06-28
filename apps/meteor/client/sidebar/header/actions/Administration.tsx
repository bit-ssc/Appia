import { Sidebar, Dropdown } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import type { HTMLAttributes, VFC } from 'react';
import React, { useRef } from 'react';
import { createPortal } from 'react-dom';

import { AccountBox } from '../../../../app/ui-utils/client';
import AdministrationList from '../../../components/AdministrationList/AdministrationList';
import { useReactiveValue } from '../../../hooks/useReactiveValue';
import { useDropdownVisibility } from '../hooks/useDropdownVisibility';

const Administration: VFC<Omit<HTMLAttributes<HTMLElement>, 'is'>> = (props) => {
	const reference = useRef(null);
	const target = useRef(null);

	const { isVisible, toggle } = useDropdownVisibility({ reference, target });

	const getAccountBoxItems = useMutableCallback(() => AccountBox.getItems());
	const accountBoxItems = useReactiveValue(getAccountBoxItems);

	return (
		<>
			<Sidebar.TopBar.Action icon='menu' onClick={(): void => toggle()} {...props} ref={reference} />
			{isVisible &&
				createPortal(
					<Dropdown reference={reference} ref={target}>
						<AdministrationList accountBoxItems={accountBoxItems} onDismiss={(): void => toggle(false)} />
					</Dropdown>,
					document.body,
				)}
		</>
	);
};

export default Administration;
