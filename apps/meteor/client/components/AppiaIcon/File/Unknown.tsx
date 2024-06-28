import React from 'react';

import type { ISvgProps } from '../IAppiaIcon';

const UnknownIcon: React.FC<ISvgProps> = ({ fontSize = 32, style }) => (
	<svg style={style} fontSize={fontSize} width='1em' height='1em' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'>
		<g transform='translate(-293 -307)'>
			<g transform='translate(47 -52.976)'>
				<rect width='48' height='48' rx='4' transform='translate(246 359.976)' fill='#b9b9b9' />
			</g>
			<g id='question-line' transform='translate(305 319)'>
				<path d='M0,0H24V24H0Z' fill='none' />
				<path
					d='M13.853,24.97H18.2v4.345H13.853ZM18.2,21.4v1.4H13.853V19.538a2.173,2.173,0,0,1,2.173-2.173,3.259,3.259,0,1,0-3.2-3.9l-4.263-.854A7.607,7.607,0,1,1,18.2,21.4Z'
					transform='translate(-4.066 -6.158)'
					fill='#fff'
				/>
			</g>
		</g>
	</svg>
);

export default UnknownIcon;
