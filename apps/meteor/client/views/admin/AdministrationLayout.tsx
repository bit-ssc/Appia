import type { FC } from 'react';
import React from 'react';

import AdminSidebar from './sidebar/AdminSidebar';
import SidebarPortal from '../../sidebar/SidebarPortal';

const AdministrationLayout: FC = ({ children }) => {
	return (
		<>
			<SidebarPortal>
				<AdminSidebar />
			</SidebarPortal>
			{children}
		</>
	);
};

export default AdministrationLayout;
