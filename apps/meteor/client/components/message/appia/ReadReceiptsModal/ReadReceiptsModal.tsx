import type { IMessage, IUser } from '@rocket.chat/core-typings';
import { css } from '@rocket.chat/css-in-js';
import { Skeleton, Modal } from '@rocket.chat/fuselage';
import { useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import type { ReactElement } from 'react';
import React, { useMemo, useEffect, useState } from 'react';

import { useRecordList } from '../../../../hooks/lists/useRecordList';
import { useMethodData } from '../../../../hooks/useMethodData';
import { AsyncStatePhase } from '../../../../lib/asyncState';
import { useMembersList } from '../../../../views/hooks/useMembersList';
import UserAvatar from '../../../avatar/UserAvatar';
// import ReadReceiptRow from './ReadReceiptRow';

type ReadReceiptsModalProps = {
	messageId: IMessage['_id'];
	rid?: string;
	roomType?: 'd' | 'p' | 'c';
	onClose: () => void;
};

const styles = {
	titleIcon: {
		width: '4px',
		height: '16px',
		margin: 0,
		background: 'linear-gradient(180deg, #2878FF 0%, rgba(40, 120, 255, 0.4) 100%)',
		borderRadius: '2px 0px',
	},
	tabBox: {
		display: 'flex',
		// flexWrap: 'nowrap',
		alignItems: 'center',
		justifyContent: 'space-around',
		borderBottomWidth: '1px',
		borderColor: '#DCDCDC',
	},
	tabItem: {
		fontSize: '16px',
		borderColor: '#FFFFFF',
		borderBottomWidth: '1px',
		padding: '10px',
	},
	tabName: {
		verticalAlign: 'middle',
	},
	tabSelected: {
		marginBottom: '-1px',
		color: '#2878FF',
		borderBottomWidth: '2px',
		borderColor: '#2878FF',
		fontWeight: 600,
	},
	listCount: {
		display: 'inline-block',
		marginLeft: '8px',
		fontWeight: 400,
		fontSize: '12px',
		minWidth: '20px',
		lineHeight: '20px',
		borderRadius: '10px',
		background: '#EEEEEE',
		color: 'rgba(0, 0, 0, 0.6)',
		textAlign: 'center',
		padding: '0 6px',
	},
	selectedCount: {
		background: '#2878FF',
		color: '#FFFFFF',
	},
	list: {
		height: '480px',
		margin: '10px 0 20px 30px',
		overflowY: 'auto',
	},
	item: {
		padding: '10px 0',
	},
	username: {
		marginLeft: '16px',
	},
};

const headerStyle = css`
	.rcx-modal__header-inner {
		align-items: center;
	}
`;

const ReadReceiptsModal = ({ messageId, rid, roomType, onClose }: ReadReceiptsModalProps): ReactElement => {
	const [unreadView, setUnreadView] = useState(false);
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();
	const user = Meteor.user();

	const {
		phase: readPhase,
		value: readList,
		error,
	} = useMethodData(
		'getReadReceipts',
		useMemo(() => [{ messageId }], [messageId]),
	);

	const { membersList } = useMembersList(useMemo(() => ({ rid, type: 'all', count: 9999, roomType }), [rid, roomType]));

	const { phase, items } = useRecordList(membersList);
	useEffect(() => {
		if (error) {
			dispatchToastMessage({ type: 'error', message: error });
			onClose();
		}
	}, [error, dispatchToastMessage, t, onClose]);

	const onChangeTab = (type: string): void => {
		setUnreadView(type === 'unread');
	};

	const renderUser = (user: IUser) => (
		<div style={styles.item} key={user._id}>
			<UserAvatar size='x32' username={user.username || ''} />
			<span style={styles.username}>{user.name || user.username}</span>
		</div>
	);

	const renderContent = () => {
		const loading = unreadView ? phase === AsyncStatePhase.LOADING || !items : readPhase === AsyncStatePhase.LOADING || !readList || error;
		if (loading) {
			return <Skeleton type='rect' w='full' h='x120' />;
		}

		const unreadList = membersList.items
			? membersList.items.filter((a: IUser) => a._id !== user?._id && !readList.some((receipt) => receipt.user._id === a._id))
			: [];

		return (
			<Modal.Content style={{ margin: 0 }}>
				<div style={styles.tabBox}>
					<button onClick={() => onChangeTab('read')} style={unreadView ? styles.tabItem : { ...styles.tabItem, ...styles.tabSelected }}>
						<span style={styles.tabName}>{t('Room_announcement_read_Confirm')}</span>
						<span style={unreadView ? styles.listCount : { ...styles.listCount, ...styles.selectedCount }}>
							{readList ? readList.length : 0}
						</span>
					</button>
					<button onClick={() => onChangeTab('unread')} style={unreadView ? { ...styles.tabItem, ...styles.tabSelected } : styles.tabItem}>
						<span style={styles.tabName}>{t('Unread')}</span>
						<span style={unreadView ? { ...styles.listCount, ...styles.selectedCount } : styles.listCount}>{unreadList.length}</span>
					</button>
				</div>
				{!unreadView && <div style={styles.list}>{readList.map((receipt) => renderUser(receipt.user as IUser))}</div>}
				{unreadView && <div style={styles.list}>{unreadList.map((user: IUser) => renderUser(user))}</div>}
			</Modal.Content>
		);
	};
	return (
		<Modal style={{ maxWidth: '400px' }}>
			<Modal.Header className={headerStyle} style={{ margin: '20px 20px 10px 32px' }}>
				<span style={styles.titleIcon}></span>
				<Modal.Title style={{ fontSize: '16px' }}>{t('Details')}</Modal.Title>
				<Modal.Close onClick={onClose} />
			</Modal.Header>
			{renderContent()}
		</Modal>
	);
};

export default ReadReceiptsModal;
