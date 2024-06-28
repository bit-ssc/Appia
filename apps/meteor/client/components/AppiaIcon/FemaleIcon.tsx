import React from 'react';

import type { ISvgProps } from './IAppiaIcon';

const FemaleIcon: React.FC<ISvgProps> = ({ style }) => (
	<svg style={style} width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M11.5 5C11.5 6.933 9.933 8.5 8 8.5C6.067 8.5 4.5 6.933 4.5 5C4.5 3.067 6.067 1.5 8 1.5C9.933 1.5 11.5 3.067 11.5 5Z'
			fill='#F36D78'
		/>
		<path
			d='M13.9631 10.8528C14.297 11.0122 14.5 11.3547 14.5 11.7246V14C14.5 14.2761 14.2761 14.5 14 14.5H2C1.72386 14.5 1.5 14.2761 1.5 14V11.7246C1.5 11.3547 1.70302 11.0122 2.03686 10.8528C3.8494 9.98708 5.86651 9.5 8 9.5C10.1335 9.5 12.1506 9.98708 13.9631 10.8528Z'
			fill='#F36D78'
		/>
	</svg>
);

export default FemaleIcon;
