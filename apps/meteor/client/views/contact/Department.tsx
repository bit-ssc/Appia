import type { IDepartmentCount } from '@rocket.chat/core-typings';
import { Box, Table } from '@rocket.chat/fuselage';
import { useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';
import { Table as AntTable, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

import { useContactContext } from './ContactContext';

interface IDepartmentProps {
	id: string;
	departmentType?: number; // 0:普通部门 1:公司 2:emt
}

const Department: React.FC<IDepartmentProps> = ({ id, departmentType = 0 }) => {
	const { getDepartmentById, getUsersForHeaderBoard, getUserById, root, rootStat, emtMembers } = useContactContext();
	const companyId = root?._id;
	const companyName = useSetting('Enterprise_Name') as string;
	const companyEMT = 'EMT';
	let department = departmentType === 0 ? getDepartmentById(id) : {};
	// department = {
	// 	...department,
	// 	labourRanges: [
	// 		{
	// 			productName: ' A ',
	// 			productDescription: 'A',
	// 			KO: 'KO1',
	// 			RP: 'RP1',
	// 			productCode: 'CODE1',
	// 		},
	// 		{
	// 			productName: 'B',
	// 			productDescription: 'B',
	// 			KO: 'KO2',
	// 			RP: 'RP2',
	// 			productCode: 'CODE2',
	// 		},
	// 	],
	// };
	const t = useTranslation();

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

	if (departmentType === 2) {
		return (
			<div className='contact-info-wrapper'>
				<Box flexDirection='column' display='flex' flexGrow={1} alignContent='center' justifyContent='center' textAlign='center'>
					<Box color={'rgba(0, 0, 0, 0.6)'} fontSize={16} lineHeight={24} fontWeight={400} marginBlockEnd='x12'>
						{companyName}
					</Box>
					<Box color={'rgba(0, 0, 0, 0.9)'} fontSize={26} lineHeight={24} fontWeight={600} marginBlockEnd='x12'>
						{companyEMT}
					</Box>
					<Box fontSize={14} marginTop='x12'>{`${t('emtMembers')}：${emtMembers
						.map((v) => v.name)
						.join('、')}`}
					</Box>
				</Box>
			</div>
		);
	}

	if (!department && departmentType === 0) {
		return null;
	}

	let officialCadre = '';
	let deputyCadre = '';
	if (department.type === 'PMT') {
		officialCadre = t('General_Manager');
		deputyCadre = t('Deputy_General_Manager');
	} else if (department.type === 'L1D') {
		officialCadre = t('Director');
		deputyCadre = t('Department_Director');
	} else if (department.type === 'L3D') {
		officialCadre = t('President');
		deputyCadre = t('Vice_President');
	}

	const arrayIsNotNull = (array: string[]) => {
		return Array.isArray(array) && array.length > 0;
	};

	const name = id === companyId ? companyName : department?.name;
	const fields = [
		{
			key: 'fullTime',
			label: t('Full-time'),
		},
		{
			key: 'outsourcing',
			label: t('Outsourced'),
		},
		{
			key: 'internship',
			label: t('Internship'),
		},
		{
			key: 'partTime',
			label: t('Part-time'),
		},
		{
			key: 'other',
			label: t('Other'),
		},
	];

	return (
		<div className='contact-info-wrapper'>
			<Box flexDirection='column' display='flex' flexGrow={1} alignContent='center' justifyContent='center' textAlign='center'>
				<Box >
					{id !== companyId && (
						<Box
							color={departmentType === 1 ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.6)'}
							fontSize={departmentType === 1 ? 24 : 16}
							lineHeight={24}
							fontWeight={departmentType === 1 ? 600 : 400}
							marginBlockEnd='x12'
						>
							{companyName}
							{/* {department.parentDepartmentName ? `/${department.parentDepartmentName.replace('EMT/', '')}` : null}						 */}
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
							<div className='contact-info-code'>{`${t('Dpt_code')}:${department.code}`}</div>
						)}
					</Box>
					<Box color='rgba(0, 0, 0, 0.6)' fontSize={14} display='flex' alignItems='center' justifyContent='center' flexWrap='wrap'>
						{departmentType === 0 && department?.countIncludeChildren?.all > -1 ? (
							<div className='contact-info-count'>{`${t('Department_Total_count', {
								count: department.countIncludeChildren.all,
							})}`}</div>
						) : null}
						{departmentType === 1 && rootStat.all > -1 ? (
							<div className='contact-info-count'>{`${t('Department_Total_count', {
								count: rootStat.all,
							})}`}</div>
						) : null}

						{fields
							.filter(({ key }) =>
								departmentType === 1
									? !!rootStat[key as keyof IDepartmentCount]
									: !!department.countIncludeChildren[key as keyof IDepartmentCount],
							)
							.map(({ key, label }) => (
								<div key={key} className='contact-info-divider'>
									{`${label} ${t('Department_Position_count', {
										count:
											departmentType === 1
												? rootStat[key as keyof IDepartmentCount]
												: department.countIncludeChildren[key as keyof IDepartmentCount],
									})}`}
								</div>
							))}
					</Box>
					{department.type === 'L1D' ? (
						<Box marginBlockStart='x12' display='flex' flexDirection='row' justifyContent='center'>
							{arrayIsNotNull(department?.deputyCadre) && (
								<div style={{ marginLeft: 10, marginRight: 10 }}>{`${deputyCadre}：${department?.deputyCadre.map(
									(item) => getUserById(item).name,
								)}`}</div>
							)}

							{arrayIsNotNull(department?.officialCadre) && (
								<div style={{ marginLeft: 10, marginRight: 10 }}>{`${officialCadre}：${department?.officialCadre.map(
									(item) => getUserById(item).name,
								)}`}</div>
							)}
						</Box>
					) : (
						<Box marginBlockStart='x12' display='flex' flexDirection='row' justifyContent='center'>
							{arrayIsNotNull(department?.sponsor) && (
								<div style={{ marginLeft: 10, marginRight: 10 }}>{`${t('Department_Director')}：${department?.sponsor.map(
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
								<div style={{ marginLeft: 10, marginRight: 10 }}>{`${t('Product_Manager')}：${department?.manager.map(
									(item) => getUserById(item).name,
								)}`}</div>
							)}
						</Box>
					)}
					{department.labourRanges && (
						<div style={{ marginTop: '24px' }}>
							<AntTable
								title={() => (
									<div style={{ 
										textAlign: 'center', 
										fontSize: '14px',
										fontWeight: '600',
										padding: '12px 0'
									}}>
										劳动范围
										<Tooltip title="如信息需更正，请至流程中心提交修改申请">
											<InfoCircleOutlined style={{ marginLeft: '5px', color: '#8c8c8c', cursor: 'pointer' }} />
										</Tooltip>
									</div>
								)}
								columns={[
									{
										title: '产品名称',
										dataIndex: 'productName',
										key: 'productName',
										width: '15%',
										minWidth: '100px',
										align: 'center',
										onCell: () => ({
											style: {
												verticalAlign: 'middle',
											},
										}),
									},
									{
										title: '产品描述',
										dataIndex: 'productDescription',
										key: 'productDescription',
										width: '35%',
										minWidth: '120px',
										align: 'center',
										onCell: () => ({
											style: {
												verticalAlign: 'middle',
											},
										}),
									},
									{
										title: 'KO',
										dataIndex: 'kO',
										key: 'kO',
										width: '25%',
										minWidth: '60px',
										align: 'center',
										onCell: () => ({
											style: {
												verticalAlign: 'middle',
											},
										}),
									},
									{
										title: 'RP',
										dataIndex: 'rP',
										key: 'rP',
										width: '10%',
										minWidth: '60px',
										align: 'center',
										onCell: () => ({
											style: {
												verticalAlign: 'middle',
											},
										}),
									},
									{
										title: '产品编码',
										dataIndex: 'productCode',
										key: 'productCode',
										width: '15%',
										minWidth: '100px',
										align: 'center',
										onCell: () => ({
											style: {
												verticalAlign: 'middle',
											},
										}),
									},
								]}
								dataSource={department.labourRanges.map((item, index) => ({
									...item,
									key: index,
								}))}
								pagination={false}
								bordered
								style={{
									background: 'transparent',
									color: '#4E5969',
									fontSize: '12px',
									fontWeight: '400',
								}}
								className="labour-range-table"
								locale={{
									emptyText: '待上传信息'
								}}
							/>
							<style>
								{`
									.labour-range-table .ant-table-title {
										padding: 0;
										border: 0;
									}
									.labour-range-table .ant-table {
										background: transparent;
										border: 1px solid #E5E6EB;
									}
									.labour-range-table .ant-table:hover {
										background: transparent;
									}
									.labour-range-table .ant-table-thead > tr > th {
										background: transparent;
										font-weight: 400;
										padding: 12px 8px;
									}
									.labour-range-table .ant-table-tbody > tr > td {
										padding: 12px 8px;
									}
								`}
							</style>
						</div>
					)}
				</Box>
			</Box>
			
		</div>
	);
};

export default Department;
