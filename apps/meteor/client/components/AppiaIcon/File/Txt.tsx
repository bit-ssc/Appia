import React from 'react';

import type { ISvgProps } from '../IAppiaIcon';

const TxtIcon: React.FC<ISvgProps> = ({ fontSize = 32, style }) => (
	<svg style={style} fontSize={fontSize} width='1em' height='1em' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'>
		<g transform='translate(-246 -359.976)'>
			<rect width='48' height='48' rx='4' transform='translate(246 359.976)' fill='#2c59ed' />
			<g transform='translate(261 363.976)'>
				<text transform='translate(0 31)' fill='#fff' fontSize='29' fontFamily='PingFangSC-Medium, PingFang SC' fontWeight='500'>
					<tspan x='0' y='0'>
						T
					</tspan>
				</text>
			</g>
		</g>
	</svg>
);

export default TxtIcon;
