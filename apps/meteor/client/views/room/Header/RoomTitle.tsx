import type { IRoom } from '@rocket.chat/core-typings';
import { Header } from '@rocket.chat/ui-client';
import { usePermission, useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { Input } from 'antd';

// import HeaderIconWithRoom from './HeaderIconWithRoom';
import { FederationIcon } from '../../../components/AppiaIcon';
import { useEndpointActionExperimental } from '../../../hooks/useEndpointActionExperimental';

import { APPIA_TAG, hasPermission } from '/lib/utils/permission';

type RoomTitleProps = {
	room: IRoom;
};

const RoomTitle = ({ room }: RoomTitleProps): ReactElement => {
	const [editing, setEditing] = useState(false);
	const [text, setText] = useState(room.name);
	const canEdit = usePermission('edit-team-channel', room._id) || room.prid;
	const t = useTranslation();
	const saveAction = useEndpointActionExperimental('POST', '/v1/rooms.saveRoomSettings');
	const inputRef = useRef();
	const onBlur = useCallback(async () => {
		if (!text) {
			setEditing(false);
			return;
		}
		if (text !== room.name) {
			await saveAction({
				rid: room._id,
				roomName: text,
			});
		}
		setEditing(false);
	}, [text, room.name, room._id, saveAction]);

	const onClick = useCallback(() => {
		if (canEdit) {
			setText(room.name);
			setEditing(true);
			setTimeout(() => {
				inputRef.current?.focus();
			}, 0);
		}
	}, [room.name, inputRef]);

	const onChange = useCallback((e) => {
		setText(e.target.value);
	}, []);
	if (room.t === 'd')
		return (
			<>
				{/* <HeaderIconWithRoom room={room} />*/}
				<Header.Title is='h1'>{room.name}</Header.Title>
				{hasPermission(room.showAppiaTag, APPIA_TAG.external) ? <FederationIcon /> : null}
			</>
		);

	const handleKeyDown = (event) => {
		if (event.keyCode === 13) {
			// 回车键被按下
			onBlur();
		}
	};

	return (
		<>
			{!editing ? (
				<>
					{/* <HeaderIconWithRoom room={room} />*/}
					<div onClick={onClick} style={{ width: '100%' }}>
						<Header.Title is='h1'>{room.name}</Header.Title>
					</div>
				</>
			) : (
				<>
					<Input
						placeholder={t('Group_name_placeholder')}
						allowClear
						value={text}
						ref={inputRef}
						onBlur={onBlur}
						onChange={onChange}
						style={{ width: '100%', paddingTop: 4, paddingBottom: 4, minHeight: 0, marginRight: 5 }}
						onKeyDown={handleKeyDown}
					/>
				</>
			)}
			{/* {hasPermission(room.showAppiaTag, APPIA_TAG.external) ? <FederationIcon /> : null} */}
		</>
	);
};

export default RoomTitle;
