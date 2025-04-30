import React from 'react';

import type { ISvgProps } from '../IAppiaIcon';

const ZipIcon: React.FC<ISvgProps> = ({ style, fontSize }) => (
	<svg style={style} fontSize={fontSize} width='1em' height='1em' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'>
		<g transform='translate(-246 -359.976)'>
			<rect width='48' height='48' rx='4' transform='translate(246 359.976)' fill='#952323' />
			<g transform='translate(253.477 367.452)'>
				<path d='M0,0H33.046V33.046H0Z' fill='none' />
				<path
					d='M26.408,29.539H4.377A1.377,1.377,0,0,1,3,28.162V3.377A1.377,1.377,0,0,1,4.377,2H26.408a1.377,1.377,0,0,1,1.377,1.377V28.162A1.377,1.377,0,0,1,26.408,29.539Zm-1.377-2.754V4.754H5.754V26.785ZM18.146,15.769v6.885H12.639V18.523h2.754V15.769ZM15.392,4.754h2.754V7.508H15.392ZM12.639,7.508h2.754v2.754H12.639Zm2.754,2.754h2.754v2.754H15.392Zm-2.754,2.754h2.754v2.754H12.639Z'
					transform='translate(1.131 0.754)'
					fill='#fff'
				/>
			</g>
		</g>
	</svg>
);

export default ZipIcon;
