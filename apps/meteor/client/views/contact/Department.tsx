import type { IDepartmentCount } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import { useSetting } from '@rocket.chat/ui-contexts';
import React from 'react';

import { useContactContext } from './ContactContext';

interface IDepartmentProps {
	id: string;
}

const Department: React.FC<IDepartmentProps> = ({ id }) => {
	const { getDepartmentById, getUsersForHeaderBoard, getUserById, root } = useContactContext();
	const companyId = root?._id;
	const companyName = useSetting('Enterprise_Name') as string;
	let department = getDepartmentById(id);

	if (!id) {
		return null;
	}

	const isHeadBoard = id.startsWith('head_board');
	if (isHeadBoard) {
		const parent = getDepartmentById(id.substring(11)) || {};
		const users = getUsersForHeaderBoard(id);
		department = {
			...parent,
			_id: id,
			name: `${parent.name} - Heads`,
			countIncludeChildren: { all: users.length },
		};
	}

	if (!department) {
		return null;
	}

	let officialCadre = '';
	let deputyCadre = '';
	if (department.type === 'PMT') {
		officialCadre = '总监';
		deputyCadre = '副总监';
	} else if (department.type === 'L1D') {
		officialCadre = '处长';
		deputyCadre = '副处长';
	} else if (department.type === 'L3D') {
		officialCadre = '总裁';
		deputyCadre = '副总裁';
	}

	const arrayIsNotNull = (array: string[]) => {
		return Array.isArray(array) && array.length > 0;
	};

	const name = id === companyId ? companyName : department?.name;
	const fields = [
		{
			key: 'fullTime',
			label: '全职',
		},
		{
			key: 'outsourcing',
			label: '外包',
		},
		{
			key: 'internship',
			label: '实习',
		},
		{
			key: 'partTime',
			label: '兼职',
		},
		{
			key: 'other',
			label: '其他',
		},
	];

	return (
		<div className='contact-info-wrapper'>
			<Box flexDirection='column' display='flex' flexGrow={1} alignContent='center' justifyContent='center' textAlign='center'>
				<Box padding='x40'>
					{id !== companyId && (
						<Box color='rgba(0, 0, 0, 0.6)' fontSize={16} lineHeight={24} marginBlockEnd='x12'>
							{companyName}
							{department.parentDepartmentName ? `/${department.parentDepartmentName}` : null}
						</Box>
					)}
					<Box
						color='rgba(0, 0, 0, 0.9)'
						fontSize={24}
						fontWeight={600}
						marginBlockEnd='x12'
						display='flex'
						alignItems='center'
						justifyContent='center'
					>
						{name}{' '}
						{['PMT', 'PDT'].includes(department.type) && !!department.code && (
							<div className='contact-info-code'>{`部门编码:${department.code}`}</div>
						)}
					</Box>
					<Box color='rgba(0, 0, 0, 0.6)' fontSize={14} display='flex' alignItems='center' justifyContent='center'>
						{department?.countIncludeChildren?.all > -1 ? (
							<div className='contact-info-count'>共{department.countIncludeChildren.all}人</div>
						) : null}
						{fields
							.filter(({ key }) => !!department.countIncludeChildren[key as keyof IDepartmentCount])
							.map(({ key, label }) => (
								<div key={key} className='contact-info-divider'>
									{label} {department.countIncludeChildren[key as keyof IDepartmentCount]} 人
								</div>
							))}
					</Box>
					<Box marginBlockStart='x12' display='flex' flexDirection='row' justifyContent='center'>
						{arrayIsNotNull(department?.sponsor) && (
							<div style={{ marginLeft: 10, marginRight: 10 }}>{`Sponsor：${department?.sponsor.map(
								(item) => getUserById(item).name,
							)}`}</div>
						)}
						{arrayIsNotNull(department?.officialCadre) && (
							<div style={{ marginLeft: 10, marginRight: 10 }}>{`${officialCadre}：${department?.officialCadre.map(
								(item) => getUserById(item).name,
							)}`}</div>
						)}
						{arrayIsNotNull(department?.deputyCadre) && (
							<div style={{ marginLeft: 10, marginRight: 10 }}>{`${deputyCadre}：${department?.deputyCadre.map(
								(item) => getUserById(item).name,
							)}`}</div>
						)}
						{arrayIsNotNull(department?.manager) && (
							<div style={{ marginLeft: 10, marginRight: 10 }}>{`PDT经理：${department?.manager.map(
								(item) => getUserById(item).name,
							)}`}</div>
						)}
					</Box>
				</Box>
			</Box>
		</div>
	);
};

export default Department;
