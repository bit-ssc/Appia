import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { useMemo } from 'react';

import companyKV from '../../components/Contacts/companyKV';
import { useContactContext } from './ContactContext';

interface IDepartmentProps {
	name: 'ssc' | 'bitmain' | 'sophgo' | 'antpool' | 'antalpha';
}

const FederatedDepartment: React.FC<IDepartmentProps> = ({ name }) => {
	const t = useTranslation();
	const { partners } = useContactContext();
	const membersCount = useMemo(() => partners[name]?.usersArray?.length || 0, [name, partners]);
	const orgName = useMemo(() => companyKV[name]?.name, [name]);
	console.log('dxd========FederatedDepartment', name);
	if (!name) {
		return null;
	}

	return (
		<div className='contact-federated-info-wrapper'>
			<Box
				color='rgba(0, 0, 0, 0.9)'
				fontSize={24}
				fontWeight={600}
				marginBlockEnd='x12'
				display='flex'
				alignItems='center'
				justifyContent='center'
			>
				{orgName}
			</Box>
			<div className='contact-info-count'>{t('Department_Total_count', { count: membersCount })}</div>
		</div>
	);
};

export default FederatedDepartment;
