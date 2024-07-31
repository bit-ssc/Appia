const colors = [
	{ text: '#FFFFFF', background: '#F44336' },
	{ text: '#FFFFFF', background: '#E91E63' },
	{ text: '#FFFFFF', background: '#9C27B0' },
	{ text: '#FFFFFF', background: '#673AB7' },
	{ text: '#FFFFFF', background: '#3F51B5' },
	{ text: '#FFFFFF', background: '#2196F3' },
	{ text: '#FFFFFF', background: '#03A9F4' },
	{ text: '#FFFFFF', background: '#00BCD4' },
	{ text: '#FFFFFF', background: '#009688' },
	{ text: '#FFFFFF', background: '#4CAF50' },
	{ text: '#FFFFFF', background: '#8BC34A' },
	{ text: '#FFFFFF', background: '#CDDC39' },
	{ text: '#FFFFFF', background: '#FFC107' },
	{ text: '#FFFFFF', background: '#FF9800' },
	{ text: '#FFFFFF', background: '#FF5722' },
	{ text: '#FFFFFF', background: '#795548' },
	{ text: '#FFFFFF', background: '#9E9E9E' },
	{ text: '#FFFFFF', background: '#607D8B' },
];

export const getAvatarColor = (name) => colors[name.length % colors.length];
