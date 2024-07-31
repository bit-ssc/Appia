import type { IDepartment, IUserSummary } from '@rocket.chat/core-typings';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface IProps {
	children: any;
	defaultSelected: IUserSummary[];
}
interface IOrganizationContext {
	selectedUsers: IUserSummary[];
	selectedDepartments: IDepartment[];
	setSelectedUsers: React.Dispatch<React.SetStateAction<IUserSummary[]>>;
	setSelectedDepartments: React.Dispatch<React.SetStateAction<IDepartment[]>>;
}

const OrganizationContext = createContext<IOrganizationContext>({
	selectedUsers: [],
	selectedDepartments: [],
	setSelectedUsers: () => undefined,
	setSelectedDepartments: () => undefined,
});

export const useOrganizationContext = (): IOrganizationContext => useContext(OrganizationContext);

export const OrganizationContextProvider: React.FC<IProps> = ({ children, defaultSelected }) => {
	const [selectedUsers, setSelectedUsers] = useState<IUserSummary[]>(defaultSelected || []);
	const [selectedDepartments, setSelectedDepartments] = useState<IDepartment[]>([]);

	useEffect(() => {
		// defaultSelect发生变化，更新数据
		if (defaultSelected.length !== selectedUsers.length) {
			setSelectedUsers(defaultSelected);
		}
	});

	return (
		<OrganizationContext.Provider
			value={{
				selectedUsers,
				setSelectedUsers,
				selectedDepartments,
				setSelectedDepartments,
			}}
		>
			{children}
		</OrganizationContext.Provider>
	);
};
