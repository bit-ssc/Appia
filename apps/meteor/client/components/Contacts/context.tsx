import type { IStaff } from '@rocket.chat/core-typings';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ContactContextProvider, useContactContext } from '../../views/contact/ContactContext';

export interface IProps {
	title?: string;
	selected?: string[]; // 已选
	disabled?: string[]; // 不可选
	multiple?: boolean; // 是否多选
	onClose: () => void;
	onOk: (ids: IStaff[]) => Promise<void> | void;
}

interface IState {
	selected: Set<string>;
	onClose: () => void;
	onOk: (ids: IStaff[]) => Promise<void> | void;
}

interface IActions extends IState {
	removeSelected: (...selected: string[]) => void;
	addSelected: (...selected: string[]) => void;
	setSelected: (...selected: string[]) => void;
	disabled?: Set<string>;
	multiple?: boolean;
	title?: string;
}

const StateContext = createContext<IActions>(null);
export const useStateContext = (): IActions => useContext(StateContext);

const StateContextProvider: React.FC<IProps> = ({ children, title, selected, onClose, onOk, multiple = true, ...props }) => {
	const [state, setState] = useState<IState>({
		selected: new Set(selected || []),
		onClose,
		onOk,
	});

	const { userMap } = useContactContext();

	const disabled = useMemo(() => new Set(props.disabled || []), [props.disabled]);

	useEffect(() => {
		const propsSelected = new Set(selected);
		const newSelected: Set<number> = new Set();

		Object.values(userMap).forEach((user) => {
			if (propsSelected.has(user.id)) {
				newSelected.add(user.id);
			}
		});

		setState((prevState) => ({
			...prevState,
			selected: newSelected,
		}));
	}, [selected, userMap]);

	const actions = useMemo(
		() => ({
			removeSelected: (...ids: number[]) => {
				setState((prevState) => {
					const selected = new Set(prevState.selected);

					ids.forEach((id) => {
						selected.delete(id);
					});

					return {
						...prevState,
						selected,
					};
				});
			},

			addSelected: (...ids: number[]) => {
				setState((prevState) => {
					const selected = new Set(prevState.selected);

					ids
						.filter((id) => !disabled.has(id))
						.forEach((id) => {
							selected.add(id);
						});

					return {
						...prevState,
						selected,
					};
				});
			},

			setSelected: (...selected: number[]) => {
				setState((prevState) => ({
					...prevState,
					selected: new Set(selected),
				}));
			},
		}),
		[setState, disabled],
	);

	return (
		<StateContext.Provider
			value={{
				disabled,
				multiple,
				title: title ?? '选择成员',
				...state,
				...actions,
			}}
		>
			{children}
		</StateContext.Provider>
	);
};

const Provider: React.FC<IProps> = ({ children, ...props }) => (
	<ContactContextProvider>
		<StateContextProvider {...props}>{children}</StateContextProvider>
	</ContactContextProvider>
);

export default Provider;

export { useContactContext };
