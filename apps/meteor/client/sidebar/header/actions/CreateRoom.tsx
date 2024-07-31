import { Sidebar, Dropdown } from '@rocket.chat/fuselage';
import { useAtLeastOnePermission } from '@rocket.chat/ui-contexts';
import type { HTMLAttributes, VFC } from 'react';
import React, { useRef } from 'react';
import { createPortal } from 'react-dom';

import CreateRoomList from './CreateRoomListAppia';
import { useDropdownVisibility } from '../hooks/useDropdownVisibility';

const CREATE_ROOM_PERMISSIONS = ['create-c', 'create-p', 'create-d', 'start-discussion', 'start-discussion-other-user'];

const CreateRoom: VFC<Omit<HTMLAttributes<HTMLElement>, 'is'>> = (props) => {
	const reference = useRef(null);
	/**
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());
	const menu = useSession('menu');
	 */
	const target = useRef(null);
	const { isVisible, toggle } = useDropdownVisibility({ reference, target });

	/**
	const onClick = () => {
		setModal(<CreateTeam defaultType={menu === 'channel' ? 'channel' : 'team'} onClose={closeModal} />);
	};
	 */

	const showCreate = useAtLeastOnePermission(CREATE_ROOM_PERMISSIONS);

	return (
		<>
			{showCreate && <Sidebar.TopBar.Action icon='plus' onClick={toggle} {...props} ref={reference} />}
			{isVisible &&
				createPortal(
					<Dropdown reference={reference} ref={target}>
						<CreateRoomList closeList={(): void => toggle(false)} />
					</Dropdown>,
					document.body,
				)}
		</>
	);
};

export default CreateRoom;
