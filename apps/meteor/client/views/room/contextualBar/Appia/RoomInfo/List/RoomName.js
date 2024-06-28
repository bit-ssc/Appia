import { Box, TextInput, Margins } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { useCallback, useRef, useState } from 'react';

import { useEndpointActionExperimental } from '../../../../../../hooks/useEndpointActionExperimental';

import './room.css';

const RoomName = ({ name, rid, canEdit }) => {
	const [editing, setEditing] = useState(false);
	const [text, setText] = useState(name);
	const t = useTranslation();
	const inputRef = useRef();

	const saveAction = useEndpointActionExperimental('POST', '/v1/rooms.saveRoomSettings', t('Room_updated_successfully'));
	const onClick = useCallback(() => {
		if (canEdit) {
			setText(name);
			setEditing(true);
			setTimeout(() => {
				inputRef.current?.focus();
			}, 0);
		}
	}, [name, inputRef, canEdit]);

	const onChange = useCallback((e) => {
		setText(e.target.value);
	}, []);

	const onBlur = useCallback(async () => {
		if (text !== name) {
			await saveAction({
				rid,
				roomName: text,
			});
		}

		setText('');
		setEditing(false);
	}, [name, text, saveAction, rid]);

	return (
		<>
			{editing ? (
				<Margins inline='x4'>
					<TextInput
						width='100%'
						ref={inputRef}
						value={text}
						onBlur={onBlur}
						onChange={onChange}
						style={{ width: '100%' }}
						className='rcx-input-box__wrapper'
					/>
				</Margins>
			) : (
				<Box display='flex' alignItems='center' onClick={onClick} justifyContent='right'>
					<Box>{name}</Box>

					{canEdit ? (
						<svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path d='M13.6031 2.17124L17.6574 6.22546L18.5413 5.34158L14.487 1.28735L13.6031 2.17124Z' fill='black' fillOpacity='0.4' />
							<path
								d='M2.94094 17.3291L7.45714 16.4259L16.5791 7.30385L12.5249 3.24963L3.40292 12.3716L2.49968 16.8878C2.4472 17.1502 2.67854 17.3816 2.94094 17.3291ZM12.5249 5.01739L14.8114 7.30385L6.84088 15.2743L3.98281 15.846L4.55442 12.9879L12.5249 5.01739Z'
								fill='black'
								fillOpacity='0.4'
							/>
						</svg>
					) : null}
				</Box>
			)}
		</>
	);
};

export default RoomName;
