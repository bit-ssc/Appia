import type { ReactElement } from 'react';
import React from 'react';

import type { IOrgPros } from './IOrganization';
import Organization from './Organization';
import { OrganizationContextProvider } from './OrganizationContext';
import { ContactContextProvider } from '../../views/contact/ContactContext';
import { CurrentContextProvider } from '../../views/contact/CurrentContext';
import './styles.css';

const OrganizationWrapper = (props: IOrgPros): ReactElement => (
	<ContactContextProvider>
		<CurrentContextProvider>
			<OrganizationContextProvider defaultSelected={props.defaultSelected}>
				<Organization {...props} />
			</OrganizationContextProvider>
		</CurrentContextProvider>
	</ContactContextProvider>
);

export default OrganizationWrapper;
