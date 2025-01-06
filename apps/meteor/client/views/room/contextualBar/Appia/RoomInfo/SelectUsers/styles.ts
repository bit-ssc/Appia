import { css } from '@rocket.chat/css-in-js';

const styles = {
	flex: {
		display: 'flex',
	},
	model: {
		maxWidth: '720px',
	},
	header: {
		margin: '16px 20px',
	},
	headerTitle: {
		fontSize: '16px',
	},
	content: {
		margin: '0 30px 0 20px',
	},
	footer: {
		margin: '20px',
	},
	button: {
		padding: '8px 40px',
		marginRight: '16px',
	},
	field: {
		display: 'flex',
		marginBottom: '20px',
		alignItems: 'center',
	},
	fieldMember: {
		alignItems: 'flex-start',
	},
	fieldLabel: {
		flexShrink: 0,
		width: '60px',
		textAlign: 'right' as const,
		marginRight: '16px',
		fontSize: '16px',
	},
	fieldValue: {
		width: '100%',
	},
	radio: {
		display: 'flex',
		marginRight: '32px',
		alignItems: 'center',
	},
	radioLabel: {
		marginLeft: '12px',
	},
	tooltip: {
		height: '16px',
		marginLeft: '5px',
		verticalAlign: 'middle',
	},
};

export default styles;

export const selectUsersStyle = {
	container: {
		display: 'flex',
		jusitfyContent: 'space-between',
		border: '1px solid #DCDCDC',
		borderRadius: '4px',
	},
	leftBox: {
		position: 'relative',
		width: '50%',
	},
	rightBox: {
		width: '50%',
		padding: '10px 8px 10px 0',
		borderLeft: '1px solid #DCDCDC',
	},
	selectedInfo: {
		fontWeight: 400,
		fontSize: '14px',
		lineHeight: '22px',
		color: 'rgba(0, 0, 0, 0.6)',
		margin: '10px 10px 5px 15px',
	},
	checkbox: {
		display: 'flex',
		alignItems: 'center',
		padding: '12px 0 12px 16px',
		color: 'rgba(0, 0, 0, 0.9)',
		fontSize: 14,
		lineHeight: '22px',
		background: '#fff',
	},
};

export const tabsStyle = css`
	display: flex;
	height: 48px;
	justify-content: space-between;
	align-items: center;
	font-size: 14px;
	line-height: 48px;
	border-bottom: 1px solid rgb(220, 220, 220);
	margin-bottom: -1px;
	text-align: center;

	.tab {
		flex: 1;
		cursor: pointer;
	}

	.active {
		color: #2878ff;
		border-bottom: 2px solid #2878ff;
	}
`;
