import { Modal } from '@rocket.chat/fuselage';
import React from 'react';

import type { IProps } from './context';
import StateContextProvider from './context';
import Content from './modal';

const OrganizationModal: React.FC<IProps> = (props) => (
	<Modal style={{ width: 680 }}>
		<StateContextProvider {...props}>
			<Content />
		</StateContextProvider>
	</Modal>
);

export default OrganizationModal;
