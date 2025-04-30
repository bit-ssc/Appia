import { Box } from '@rocket.chat/fuselage';
import { useContacts } from '@rocket.chat/ui-contexts';
import { Tooltip } from 'antd';
import React from 'react';

import { HomeIcon } from '../../../../components/AppiaIcon';
import { departmentStyles } from './appia-style';

const DepartmentName: React.FC<{ username: string }> = ({ username }) => {
	const { getDepartmentsByUsername } = useContacts();
	const departments = getDepartmentsByUsername(username);

	if (!departments.length) {
		return null;
	}

	return (
		<Box className={departmentStyles}>
			{departments.length && departments[0].name ? (
				<Tooltip title={departments[0].name}>
					<div className='department-item'>
						<HomeIcon />
						{departments[0].name}
					</div>
				</Tooltip>
			) : null}
			{/* {jobName ? (
				<Tooltip title={jobName}>
					<div className='department-item'>
						<IdCardIcon />
						{jobName}
					</div>
				</Tooltip>
			) : null} */}
		</Box>
	);
};

export default DepartmentName;
