import type { ReactElement } from 'react';
import React from 'react';

import Contact from './Contact';
import './style.css';
import { ContactContextProvider } from './ContactContext';
import { CurrentContextProvider } from './CurrentContext';

const ContactWrapper = (): ReactElement => (
	<ContactContextProvider>
		<CurrentContextProvider>
			<Contact />
		</CurrentContextProvider>
	</ContactContextProvider>
);

export default ContactWrapper;
