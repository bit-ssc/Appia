import React from 'react';

import type { ISvgProps } from './IAppiaIcon';

const ArrowIcon: React.FC<ISvgProps> = ({ style, fontSize }) => (
	<svg style={style} fontSize={fontSize} width='1em' height='1em' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M3.54028 6.45964L4.45952 5.54041L7.9999 9.08079L11.5403 5.54041L12.4595 6.45964L7.9999 10.9193L3.54028 6.45964Z'
			fill='currentColor'
		/>
	</svg>
);

export default ArrowIcon;
