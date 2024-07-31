import type { IDepartment, IStaff } from '@rocket.chat/core-typings';
import { escapeRegExp, sortBy } from 'lodash';
import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useCallback, useContext, useState, useMemo } from 'react';

import useContact from './useContact';
import { AsyncStatePhase } from '../../lib/asyncState';

interface IState {
	loading: boolean;
	userMap: Record<string, IStaff>;
	root: IDepartment | undefined;
	departmentMap: Record<string, IDepartment>;
	getDepartmentById: (id: string) => IDepartment;
	getDepartmentNamesByUserId: (id: string) => string[];
	getUserById: (id: string) => IStaff;
	getUsersByIds: (ids: string[]) => IStaff[];
	getUsersByDepartmentId: (id: string) => IStaff[];
	getUsersForHeaderBoard: (id: string) => IStaff[];
	getAllUsersByDepartmentId: (id: string) => IStaff[];
	getDepartmentsByParentId: (id: string) => IDepartment[];
	search: (keyword: string) => IStaff[];
	addUserMap: Dispatch<SetStateAction<Record<string, IStaff>>>;
}

const UserContext = createContext<IState>({
	loading: true,
	userMap: {},
	root: undefined,
	departmentMap: {},
	getDepartmentById: () => ({} as IDepartment),
	getDepartmentNamesByUserId: () => [],
	getUserById: () => ({} as IStaff),
	getUsersByIds: () => [],
	getUsersByDepartmentId: () => [],
	getUsersForHeaderBoard: () => [],
	getAllUsersByDepartmentId: () => [],
	getDepartmentsByParentId: () => [],
	search: () => [],
	addUserMap: () => {},
});

export const useContactContext = (): IState => useContext(UserContext);

export const ContactContextProvider: React.FC = ({ children }) => {
	const { userMap: originUserMap, departmentMap, phase } = useContact();
	const [otherUserMap, setOtherUserMap] = useState({});

	const userMap = useMemo(
		() => ({
			...originUserMap,
			...otherUserMap,
		}),
		[originUserMap, otherUserMap],
	);

	const getDepartmentById = useCallback((departmentId: string): IDepartment => departmentMap[departmentId], [departmentMap]);
	const getUserById = useCallback((userId: string): IStaff => userMap[userId], [userMap]);
	const getUsersByIds = useCallback((ids: string[]): IStaff[] => ids.map((id) => userMap[id]).filter((user) => user), [userMap]);

	const getUsersByDepartmentId = useCallback(
		(departmentId: string): IStaff[] => {
			const users = Array.from(new Set([...(departmentMap[departmentId]?.managers || []), ...(departmentMap[departmentId]?.users || [])]));
			return users.map((user) => userMap[user]).filter((user) => !!user);
		},
		[departmentMap, userMap],
	);

	const getDepartmentsByParentId = useCallback(
		(departmentId: string): IDepartment[] => {
			const departments = departmentMap[departmentId]?.children?.map((id) => departmentMap[id]) || [];

			return departments.filter((department) => !!department);
		},
		[departmentMap],
	);

	const getUsersForHeaderBoard = useCallback(
		(departmentId: string): IStaff[] => {
			const getBoss = (): IStaff | undefined => Object.values(userMap).find((a) => a.name === '詹克团');
			const getHeadsByDepartmentId = (departmentId: string): string[] => {
				const department = departmentMap[departmentId];
				const departments = getDepartmentsByParentId(departmentId);
				return departments.length === 0
					? department.managers || []
					: Array.from(new Set([...(department?.managers || []), ...(department?.users || [])]));
			};
			const isHeadBoard = departmentId.startsWith('head_board');
			const departments = getDepartmentsByParentId(departmentId);
			if (isHeadBoard) {
				departmentId = departmentId.substring(11);
				let users = getHeadsByDepartmentId(departmentId);
				if (departmentId === departmentMap.root?._id) {
					const departments = getDepartmentsByParentId(departmentId);
					departments.forEach((dep) => {
						if (dep.type === 'L3D') {
							const managers = getHeadsByDepartmentId(dep._id);
							users = [...users, ...managers];
						}
					});

					const boss = getBoss();
					if (boss) {
						users.unshift(boss.username);
					}
				}

				return Array.from(new Set(users))
					.map((user) => userMap[user])
					.filter((user) => !!user);
			}
			if (departments.length > 0) {
				return []; // 只有最底层部门和heads才展示人员
			}
			const users = Array.from(new Set([...(departmentMap[departmentId]?.managers || []), ...(departmentMap[departmentId]?.users || [])]));
			return users.map((user) => userMap[user]).filter((user) => !!user);
			// let users = Array.from(new Set([...(departmentMap[departmentId]?.managers || []), ...(departmentMap[departmentId]?.users || [])]));
			// const departments = getDepartmentsByParentId(departmentId);
			// const showUsers = isHeadBoard || departments.length === 0;
			// if (isHeadBoard && departments.length === 0) {
			// users = departmentMap[departmentId]?.managers || [];
			// } else if (departments.length === 0) {
			// 	// 最后一级Heads
			// 	const managers = departmentMap[departmentId]?.managers || [];
			// 	users = users.filter((userId) => !managers.includes(userId));
			// }
			// return users.map((user) => userMap[user]).filter((user) => !!user);
		},
		[departmentMap, userMap],
	);

	const getAllUsersByDepartmentId = useCallback(
		(departmentId: string): IStaff[] => {
			const result = getUsersByDepartmentId(departmentId);
			const departments = getDepartmentsByParentId(departmentId);
			departments.forEach((a) => {
				const arr = getAllUsersByDepartmentId(a._id);
				// 合并时需要去重
				arr.forEach((b) => {
					if (!result.find((c) => c._id === b._id)) {
						result.push(b);
					}
				});
			});
			return result;
		},
		[departmentMap, userMap],
	);

	const search = useCallback(
		(keyword: string): IStaff[] => {
			const regexp = new RegExp(escapeRegExp(keyword), 'i');

			return sortBy(
				Object.values(userMap).filter(
					(user) =>
						(user.name && regexp.test(user.name)) ||
						(user.ename && regexp.test(user.ename)) ||
						(user.pinyin && regexp.test(user.pinyin)) ||
						regexp.test(user.username),
				),
				(user) => user.pinyin,
			);
		},
		[userMap],
	);

	const getDepartmentNamesByUserId = (id: string) =>
		getUserById(id)
			?.departments?.map((departmentId) => {
				const department = getDepartmentById(departmentId);

				if (department) {
					const res = [];

					if (department.parentDepartmentName) {
						res.push(department.parentDepartmentName);
					}

					if (department.name) {
						res.push(department.name);
					}

					return res.join('/');
				}

				return '';
			})
			.filter((v) => v) || [];

	return (
		<UserContext.Provider
			value={{
				loading: phase === AsyncStatePhase.LOADING,
				userMap,
				root: departmentMap.root,
				departmentMap,
				getDepartmentById,
				getDepartmentNamesByUserId,
				getUserById,
				getUsersByIds,
				getUsersByDepartmentId,
				getUsersForHeaderBoard,
				getAllUsersByDepartmentId,
				getDepartmentsByParentId,
				search,
				addUserMap: setOtherUserMap,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};
