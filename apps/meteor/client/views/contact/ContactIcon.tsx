import { Box } from '@rocket.chat/fuselage';
import { useAbsoluteUrl } from '@rocket.chat/ui-contexts';
import React from 'react';

import { OrganizationIcon } from '../../components/AppiaIcon';

const map = {
	PMT: 'pmt',
	PDT: 'pdt',
	L1D: 'l1d',
	L3D: 'l3d',
};

const Icon: React.FC<{ type: string }> = ({ type }) => {
	const absoluteUrl = useAbsoluteUrl();

	if (map[type as keyof typeof map]) {
		return <Box is='img' w={28} h={28} src={absoluteUrl(`/images/department/${map[type as keyof typeof map]}.png`)} />;
	}

	return <OrganizationIcon fontSize={28} />;
};

export default Icon;
