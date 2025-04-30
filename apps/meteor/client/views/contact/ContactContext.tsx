import type { IDepartment, IStaff } from '@rocket.chat/core-typings';
import type { partners } from '@rocket.chat/rest-typings/dist/v1/appia';
import { escapeRegExp, sortBy } from 'lodash';
import type { Dispatch, SetStateAction } from 'react';
import React, { createContext, useCallback, useContext, useState, useMemo } from 'react';

import usePartnerList from '../../components/Contacts/hook/usePartnerList';
import { AsyncStatePhase } from '../../lib/asyncState';
import useContact from './useContact';

interface IState {
	loading: boolean;
	userMap: Record<string, IStaff>;
	root: IDepartment | undefined;
	departmentMap: Record<string, IDepartment>;
	rootTree: string[];
	rootStat: Record<string, any>;
	currentParentDepartmentIds: string[];
	updateCurrentParentDepartmentIds: (id: string) => void;
	getDepartmentById: (id: string) => IDepartment;
	getDepartmentNamesByUserId: (id: string) => string[];
	getUserById: (id: string) => IStaff;
	getUsersByIds: (ids: string[]) => IStaff[];
	getUsersByDepartmentId: (id: string) => IStaff[];
	getUsersForHeaderBoard: (id: string) => IStaff[];
	getAllUsersByDepartmentId: (id: string) => IStaff[];
	getDepartmentsByParentId: (id: string) => IDepartment[];
	getAllParentDepartmentIds: (id: string) => string[];
	search: (keyword: string) => IStaff[];
	searchFromL1D: (keyword: string) => (IStaff | IDepartment)[];
	searchFromPMT: (keyword: string) => (IStaff | IDepartment)[];
	addUserMap: Dispatch<SetStateAction<Record<string, IStaff>>>;
	partners: partners;
	emtMembers: IStaff[];
}

const UserContext = createContext<IState>({
	loading: true,
	userMap: {},
	root: undefined,
	departmentMap: {},
	rootTree: [],
	rootStat: {},
	currentParentDepartmentIds: [],
	getDepartmentById: () => ({} as IDepartment),
	getDepartmentNamesByUserId: () => [],
	getUserById: () => ({} as IStaff),
	getUsersByIds: () => [],
	getUsersByDepartmentId: () => [],
	getUsersForHeaderBoard: () => [],
	getAllUsersByDepartmentId: () => [],
	getDepartmentsByParentId: () => [],
	search: () => [],
	searchFromL1D: () => [],
	searchFromPMT: () => [],
	addUserMap: () => {},
	partners: undefined,
	updateCurrentParentDepartmentIds: () => {},
	emtMembers: [],
});

export const useContactContext = (): IState => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useDraft must be used within a ContactContextProvider');
	}
	return context;
};

export const ContactContextProvider: React.FC = ({ children }) => {
	const { userMap: originUserMap, departmentMap, rootTree, rootStat, phase, root } = useContact();
	const { partners } = usePartnerList();
	const [otherUserMap, setOtherUserMap] = useState({});
	const [currentParentDepartmentIds, setCurrentParentDepartmentIds] = useState<string[]>([]);

	const userMap = useMemo(() => {
		const res = { ...originUserMap };

		Object.keys(otherUserMap).forEach((key) => {
			if (res[key]) {
				Object.assign(res[key], otherUserMap[key]);
			} else {
				res[key] = otherUserMap[key];
			}
		});

		return res;
	}, [originUserMap, otherUserMap]);

	const emtMembers = useMemo(() => {
		const result: IStaff[] = [];
		if (!root?.users) {
			return [];
		}
		/* 		const getBoss = Object.values(userMap).find((a) => a.name === '詹克团');
		if (getBoss) {
			result.push(getBoss);
		} */

		Object.values(root.users).forEach((username) => {
			const user = originUserMap[username];
			if (user) {
				result.push(user);
			}
		});
		console.log('emtMembers', result);
		return sortBy(result, u => u.employeeID);
	}, [originUserMap, root, userMap]);

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

	const getAllParentDepartmentIds = useCallback(
		(departmentId: string): string[] => {
			const departments = [];
			departments.push(departmentId);
			let parentId = departmentMap[departmentId]?.parent;
			while (parentId) {
				departments.push(parentId);
				parentId = departmentMap[parentId]?.parent;
			}
			return departments;
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
				const users = getHeadsByDepartmentId(departmentId);
				if (rootTree.includes(departmentId)) {
					// const departments = getDepartmentsByParentId(departmentId);
					// departments.forEach((dep) => {
					// 	if (dep.type === 'L3D') {
					// 		const managers = getHeadsByDepartmentId(dep._id);
					// 		users = [...users, ...managers];
					// 	}
					// });

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

	const updateCurrentParentDepartmentIds = useCallback(
		(departmentId: string) => {
			const ids = getAllParentDepartmentIds(departmentId);
			setCurrentParentDepartmentIds(ids);
		},
		[getAllParentDepartmentIds],
	);

	const search = useCallback(
		(keyword: string): IStaff[] => {
			const regexp = new RegExp(escapeRegExp(keyword), 'i');

			return sortBy(
				Object.values(userMap).filter(
					(user) =>
						(user.name && regexp.test(user.name)) ||
						(user.ename && regexp.test(user.ename)) ||
						(user.pinyin && regexp.test(user.pinyin.replace(/\s*/g, ''))) ||
						regexp.test(user.username),
				),
				(user) => user.pinyin,
			);
		},
		[userMap],
	);

	const searchFromL1D = useCallback(
		(keyword: string): IDepartment[] => {
			const regexp = new RegExp(escapeRegExp(keyword), 'i');

			return sortBy(
				Object.values(departmentMap).filter(
					(department) =>
						department.name && regexp.test(department.name) && (department.type === 'L1D' || department.type === 'L1DVirtual'),
				),
				(department) => department.name,
			);
		},
		[departmentMap],
	);

	const searchFromPMT = useCallback(
		(keyword: string): IDepartment[] => {
			const regexp = new RegExp(escapeRegExp(keyword), 'i');

			return sortBy(
				Object.values(departmentMap).filter(
					(department) => department.name && regexp.test(department.name) && department.type !== 'L1D' && department.type !== 'L1DVirtual',
				),
				(department) => department.name,
			);
		},
		[departmentMap],
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
				rootTree,
				rootStat,
				getDepartmentById,
				getDepartmentNamesByUserId,
				getUserById,
				getUsersByIds,
				getUsersByDepartmentId,
				getUsersForHeaderBoard,
				getAllUsersByDepartmentId,
				getDepartmentsByParentId,
				getAllParentDepartmentIds,
				search,
				searchFromL1D,
				searchFromPMT,
				addUserMap: setOtherUserMap,
				partners,
				currentParentDepartmentIds,
				updateCurrentParentDepartmentIds,
				emtMembers,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};
