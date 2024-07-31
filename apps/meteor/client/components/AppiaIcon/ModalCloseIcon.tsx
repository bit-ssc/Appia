import React from 'react';

const ModalCloseIcon: React.FC<{}> = () => (
	<svg width='36' height='48' viewBox='0 0 36 48' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<g filter='url(#filter0_d_3159_149699)'>
			<path d='M4 4H20C26.6274 4 32 9.37258 32 16V32C32 38.6274 26.6274 44 20 44H4V4Z' fill='white' shape-rendering='crispEdges' />
			<path
				d='M18 25.1504L21.8496 29L23 27.8495L19.1505 24L23 20.1505L21.8496 19L18 22.8496L14.1504 19L13 20.1504L16.8496 24L13 27.8496L14.1504 29L18 25.1504Z'
				fill='black'
				fill-opacity='0.6'
			/>
		</g>
		<defs>
			<filter id='filter0_d_3159_149699' x='0' y='0' width='36' height='48' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'>
				<feFlood flood-opacity='0' result='BackgroundImageFix' />
				<feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha' />
				<feOffset />
				<feGaussianBlur stdDeviation='2' />
				<feComposite in2='hardAlpha' operator='out' />
				<feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0' />
				<feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_3159_149699' />
				<feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_3159_149699' result='shape' />
			</filter>
		</defs>
	</svg>
);

export default ModalCloseIcon;
