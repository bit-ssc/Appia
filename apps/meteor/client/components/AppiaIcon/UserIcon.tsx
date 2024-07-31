import React from 'react';

import type { ISvgProps } from './IAppiaIcon';

const UserIcon: React.FC<ISvgProps> = ({ style, fontSize }) => (
	<svg style={style} fontSize={fontSize} width='1em' height='1em' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M8.625 3.75C8.625 5.19975 7.44975 6.375 6 6.375C4.55025 6.375 3.375 5.19975 3.375 3.75C3.375 2.30025 4.55025 1.125 6 1.125C7.44975 1.125 8.625 2.30025 8.625 3.75ZM7.875 3.75C7.875 2.71447 7.03553 1.875 6 1.875C4.96447 1.875 4.125 2.71447 4.125 3.75C4.125 4.78553 4.96447 5.625 6 5.625C7.03553 5.625 7.875 4.78553 7.875 3.75Z'
			fill='currentColor'
			fillOpacity='0.4'
		/>
		<path
			d='M10.4724 8.13958C10.7227 8.25917 10.875 8.51599 10.875 8.79347V10.5C10.875 10.7071 10.7071 10.875 10.5 10.875H1.5C1.29289 10.875 1.125 10.7071 1.125 10.5V8.79347C1.125 8.51599 1.27726 8.25917 1.52765 8.13958C2.88705 7.49031 4.39988 7.125 6 7.125C7.60012 7.125 9.11295 7.49031 10.4724 8.13958ZM6 7.875C4.52505 7.875 3.13076 8.2093 1.875 8.80487V10.125H10.125V8.80487C8.86924 8.2093 7.47495 7.875 6 7.875Z'
			fill='currentColor'
			fillOpacity='0.4'
		/>
	</svg>
);

export default UserIcon;
