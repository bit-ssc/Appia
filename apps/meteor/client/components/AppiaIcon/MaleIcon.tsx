import React from 'react';

import type { ISvgProps } from './IAppiaIcon';

const MaleIcon: React.FC<ISvgProps> = ({ style }) => (
	<svg style={style} width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M10.5 4C10.5 5.933 8.933 7.5 7 7.5C5.067 7.5 3.5 5.933 3.5 4C3.5 2.067 5.067 0.5 7 0.5C8.933 0.5 10.5 2.067 10.5 4Z'
			fill='#5297FF'
		/>
		<path
			d='M12.9631 9.85277C13.297 10.0122 13.5 10.3547 13.5 10.7246V13C13.5 13.2761 13.2761 13.5 13 13.5H1C0.723859 13.5 0.5 13.2761 0.5 13V10.7246C0.5 10.3547 0.703016 10.0122 1.03686 9.85277C2.8494 8.98708 4.86651 8.5 7 8.5C9.13349 8.5 11.1506 8.98708 12.9631 9.85277Z'
			fill='#5297FF'
		/>
	</svg>
);

export default MaleIcon;
