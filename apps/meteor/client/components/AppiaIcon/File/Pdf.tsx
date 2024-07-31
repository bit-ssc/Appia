import React from 'react';

import type { ISvgProps } from '../IAppiaIcon';

const PdfIcon: React.FC<ISvgProps> = ({ fontSize = 32, style }) => (
	<svg style={style} fontSize={fontSize} width='1em' height='1em' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'>
		<g transform='translate(-246 -359.976)'>
			<path d='M4,0H44a4,4,0,0,1,4,4V44a4,4,0,0,1-4,4H4a4,4,0,0,1-4-4V4A4,4,0,0,1,4,0Z' transform='translate(246 359.976)' fill='#b1414a' />
			<g transform='translate(262 359.976)'>
				<text id='p' transform='translate(0 31)' fill='#fff' fontSize='29' fontFamily='PingFangSC-Medium, PingFang SC' fontWeight='500'>
					<tspan x='0' y='0'>
						p
					</tspan>
				</text>
			</g>
		</g>
	</svg>
);

export default PdfIcon;
