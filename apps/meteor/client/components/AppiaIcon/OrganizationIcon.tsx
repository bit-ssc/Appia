import React from 'react';

import type { ISvgProps } from './IAppiaIcon';

const OrganizationIcon: React.FC<ISvgProps> = ({ fontSize = 32 }) => (
	<svg fontSize={fontSize} width='1em' height='1em' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<g clipPath='url(#clip0_2120_49726)'>
			<rect width='32' height='32' rx='4' fill='#CCE6FF' />
			<path d='M16 19.75V12.25' stroke='#2878FF' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
			<path
				d='M21.8332 9.75H10.1665V12.25H21.8332V9.75Z'
				fill='#2878FF'
				stroke='#2878FF'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M9.3335 19.3333L11.8335 16.4166H20.1561L22.6668 19.3333'
				stroke='#2878FF'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M10.9998 19.75H7.6665V23.0833H10.9998V19.75Z'
				fill='#2878FF'
				stroke='#2878FF'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M17.6668 19.75H14.3335V23.0833H17.6668V19.75Z'
				fill='#2878FF'
				stroke='#2878FF'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
			<path
				d='M24.3333 19.75H21V23.0833H24.3333V19.75Z'
				fill='#2878FF'
				stroke='#2878FF'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</g>
		<defs>
			<clipPath id='clip0_2120_49726'>
				<rect width='32' height='32' rx='4' fill='white' />
			</clipPath>
		</defs>
	</svg>
);

export default OrganizationIcon;
