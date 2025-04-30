import React from 'react';

import type { ISvgProps } from '../IAppiaIcon';

const ExcelIcon: React.FC<ISvgProps> = ({ style, fontSize }) => (
	<svg style={style} fontSize={fontSize} width='1em' height='1em' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'>
		<g transform='translate(-246 -359.976)'>
			<rect width='48' height='48' rx='4' transform='translate(246 359.976)' fill='#1b7c41' />
			<g transform='translate(261 362.976)'>
				<text transform='translate(0 31)' fill='#fff' fontSize='29' fontFamily='PingFangSC-Medium, PingFang SC' fontWeight='500'>
					<tspan x='0' y='0'>
						E
					</tspan>
				</text>
			</g>
		</g>
	</svg>
);

export default ExcelIcon;
