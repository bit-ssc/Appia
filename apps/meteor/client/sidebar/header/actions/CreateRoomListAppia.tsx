import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetModal, useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import { APIClient } from '../../../../app/utils/client';
import CreateTeam from '../../../components/CreateTeam';
import ListItem from '../../../components/Sidebar/ListItem';
import { useMenuBarContext, EMenu } from '../../../views/root/contexts/MenuBar';

type CreateRoomListProps = {
	closeList: () => void;
};

const CreateRoomList = ({ closeList }: CreateRoomListProps): ReactElement => {
	const t = useTranslation();
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());

	const enterpriseId = useSetting('Enterprise_ID');
	const user = Meteor.user();
	const { menu } = useMenuBarContext();

	const removeUnreads = async () => {
		await APIClient.post('/v1/remove.my.unreads', {
			org: enterpriseId,
			username: user?.username,
			type: menu === EMenu.home ? 'talk' : 'channel',
		});
	};
	return (
		<ul>
			<ListItem
				role='listitem'
				icon='discussion'
				text='新建项目'
				onClick={() => {
					setModal(<CreateTeam defaultType='team' onClose={closeModal} />);
					closeList();
				}}
			/>
			<ListItem
				role='listitem'
				icon={
					<span style={{ fontSize: '1.25rem', padding: '0 0.25rem' }}>
						<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 16 16' fill='none'>
							<path
								d='M8.00065 1.73047C11.4635 1.73047 14.2708 4.53779 14.2708 8.00065C14.2708 11.4635 11.4635 14.2708 8.00065 14.2708C4.53779 14.2708 1.73047 11.4635 1.73047 8.00065C1.73047 4.53779 4.53779 1.73047 8.00065 1.73047Z'
								stroke='#484B53'
							/>
							<path
								d='M10.5464 5.22359L10.5465 5.22355C10.5786 5.21197 10.6134 5.20977 10.6468 5.21722C10.6802 5.22468 10.7107 5.24147 10.7349 5.26565C10.7591 5.28982 10.7759 5.32038 10.7833 5.35374C10.7908 5.38711 10.7886 5.4219 10.777 5.45407L10.777 5.45417L9.53165 8.91311L9.53163 8.91316C9.48027 9.05587 9.39804 9.18547 9.29081 9.29272L9.6444 9.64625L9.29081 9.29273C9.18358 9.39998 9.05399 9.48223 8.91129 9.53362L5.45222 10.7789L5.45211 10.779C5.41995 10.7905 5.38515 10.7927 5.35179 10.7853C5.31842 10.7778 5.28787 10.761 5.2637 10.7369C5.23952 10.7127 5.22273 10.6821 5.21527 10.6488C5.20782 10.6154 5.21001 10.5806 5.2216 10.5484L5.22164 10.5483L6.46694 7.08939L6.46696 7.08934C6.51832 6.94664 6.60055 6.81703 6.70779 6.70978C6.81501 6.60254 6.94459 6.52029 7.08726 6.4689C7.08728 6.46889 7.08729 6.46889 7.0873 6.46888L10.5464 5.22359Z'
								stroke='#484B53'
							/>
							<circle cx='7.99947' cy='7.99947' r='0.823686' fill='#484B53' />
						</svg>
					</span>
				}
				text='新建频道'
				onClick={() => {
					setModal(<CreateTeam defaultType='channel' onClose={closeModal} />);
					closeList();
				}}
			/>
			<ListItem
				role='listitem'
				icon={
					<span style={{ fontSize: '1.25rem', padding: '0 0.25rem' }}>
						<svg width='1em' height='1em' viewBox='0 0 25 25' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M10.9375 6.25H14.0625V3.125H10.9375V6.25ZM15.625 3.125V6.25H20.3125C21.1754 6.25 21.875 6.94956 21.875 7.8125V10.9375C21.875 11.7254 21.2918 12.3771 20.5335 12.4845L21.6202 20.0915C21.7547 21.0328 21.0243 21.875 20.0734 21.875H4.92658C3.97572 21.875 3.24531 21.0328 3.37978 20.0915L4.4665 12.4845C3.70821 12.3771 3.125 11.7254 3.125 10.9375V7.8125C3.125 6.94956 3.82455 6.25 4.6875 6.25H9.375V3.125C9.375 2.26206 10.0746 1.5625 10.9375 1.5625H14.0625C14.9254 1.5625 15.625 2.26206 15.625 3.125ZM18.9574 10.9375H20.3125V7.8125H14.0625H10.9375H4.6875L4.6875 10.9375H6.04265H18.9574ZM18.9574 12.5H6.04265L4.92658 20.3125H7.8125V17.1875H9.375V20.3125H11.7188V17.1875H13.2812V20.3125H15.625V17.1875H17.1875V20.3125H20.0734L18.9574 12.5Z'
								fill='#484B53'
							/>
						</svg>
					</span>
				}
				text={t('Remove_Unread')}
				onClick={() => {
					removeUnreads();
					closeList();
				}}
			/>
		</ul>
	);
};

export default CreateRoomList;
