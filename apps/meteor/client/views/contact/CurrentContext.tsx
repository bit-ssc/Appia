import React, { createContext, useContext, useEffect, useState } from 'react';

import { settings } from '../../../app/settings/client';
import { useContactContext } from './ContactContext';

export interface ICurrent {
	type: 'user' | 'department' | 'federatedUser' | 'company' | 'emt' | 'cop' | 'federatedDepartment';
	value: string | undefined;
	from?: string;
}

interface ICurrentContext {
	current?: ICurrent;
	setCurrent: React.Dispatch<React.SetStateAction<ICurrent | undefined>>;
}

const CurrentContext = createContext<ICurrentContext>({
	current: {
		type: 'department',
		value: settings.get('Enterprise_ID'),
	},
	setCurrent: () => undefined,
});

export const useCurrentContext = (): ICurrentContext => useContext(CurrentContext);

export const CurrentContextProvider: React.FC = ({ children }) => {
	const { root } = useContactContext();
	const companyId = root?._id;
	const [current, setCurrent] = useState<ICurrent>({
		type: 'department',
		value: companyId,
	});

	useEffect(() => {
		if (companyId) {
			setCurrent({
				type: 'company',
				value: companyId,
			});
		}
	}, [companyId]);

	return (
		<CurrentContext.Provider
			value={{
				current,
				setCurrent,
			}}
		>
			{children}
		</CurrentContext.Provider>
	);
};
