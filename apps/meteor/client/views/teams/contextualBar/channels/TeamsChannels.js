import { useMutableCallback, useLocalStorage, useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import { useSetModal, usePermission } from '@rocket.chat/ui-contexts';
import React, { useCallback, useMemo, useState } from 'react';

import AddExistingModal from './AddExistingModal';
import BaseTeamsChannels from './BaseTeamsChannels';
import { useTeamsChannelList } from './hooks/useTeamsChannelList';
import { useRecordList } from '../../../../hooks/lists/useRecordList';
import { AsyncStatePhase } from '../../../../lib/asyncState';
import { roomCoordinator } from '../../../../lib/rooms/roomCoordinator';
import CreateChannelWithData from '../../../../sidebar/header/CreateChannel';
import { useTabBarClose } from '../../../room/contexts/ToolboxContext';
import RoomInfo from '../../../room/contextualBar/Info';

const useReactModal = (Component, teamId, reload) => {
	const setModal = useSetModal();

	return useMutableCallback((e) => {
		e.preventDefault();

		const handleClose = () => {
			setModal(null);
			reload();
		};

		setModal(() => <Component onClose={handleClose} teamId={teamId} />);
	});
};

const TeamsChannels = ({ teamId, rid }) => {
	const [state, setState] = useState({});
	const onClickClose = useTabBarClose();

	const [type, setType] = useLocalStorage('channels-list-type', 'all');
	const [text, setText] = useState('');

	const debouncedText = useDebouncedValue(text, 800);

	const { teamsChannelList, loadMoreItems, reload } = useTeamsChannelList(
		useMemo(() => ({ teamId, text: debouncedText, type }), [teamId, debouncedText, type]),
	);

	const { phase, items, itemCount: total } = useRecordList(teamsChannelList);

	const handleTextChange = useCallback((event) => {
		setText(event.currentTarget.value);
	}, []);

	const canAddExistingTeam = usePermission('add-team-channel', rid);
	const addExisting = useReactModal(AddExistingModal, teamId, reload);
	const createNew = useReactModal(CreateChannelWithData, teamId, reload);

	const goToRoom = useCallback((room) => roomCoordinator.openRouteLink(room.t, room), []);
	const handleBack = useCallback(() => setState({}), [setState]);
	const viewRoom = useMutableCallback((room) => {
		goToRoom(room);
	});

	if (state.tab === 'RoomInfo') {
		return <RoomInfo rid={state.rid} onClickClose={onClickClose} onClickBack={handleBack} onEnterRoom={goToRoom} resetState={setState} />;
	}

	return (
		<BaseTeamsChannels
			loading={phase === AsyncStatePhase.LOADING}
			type={type}
			text={text}
			setType={setType}
			setText={handleTextChange}
			channels={items}
			total={total}
			onClickClose={onClickClose}
			onClickAddExisting={canAddExistingTeam && addExisting}
			onClickCreateNew={canAddExistingTeam && createNew}
			onClickView={viewRoom}
			loadMoreItems={loadMoreItems}
			reload={reload}
		/>
	);
};

export default TeamsChannels;
