import { Box, TextAreaInput } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { useCallback, useRef, useState, useMemo } from 'react';

import { useEndpointActionExperimental } from '../../../../../../hooks/useEndpointActionExperimental';
import { useEndpointData } from '../../../../../../hooks/useEndpointData';

import './room.css';

const RoomSchedule = ({ rid, canEdit, onClose }) => {
	const [editing, setEditing] = useState(false);
	// const [text, setText] = useState(defaultText);
	const t = useTranslation();
	const inputRef = useRef();

	const params = useMemo(() => ({ roomId: rid }), [rid]);
	const { value: resRoom } = useEndpointData('/v1/rooms.info', { params });

	const defaultText = resRoom?.room?.valueProposition?.message;
	const [text, setText] = useState(defaultText);

	const saveAction = useEndpointActionExperimental('POST', '/v1/rooms.saveRoomSettings', t('Room_updated_successfully'));
	const onClick = useCallback(() => {
		if (canEdit) {
			setText(defaultText);
			setEditing(true);
			setTimeout(() => {
				inputRef.current?.focus();
			}, 0);
		}
	}, [defaultText, inputRef, canEdit]);

	const onChange = useCallback((e) => {
		setText(e.target.value);
	}, []);

	const onBlur = useCallback(async () => {
		if (text !== defaultText) {
			await saveAction({
				rid,
				roomValueProposition: text,
			});
			onClose();
		}

		setText('');
		setEditing(false);
	}, [defaultText, text, saveAction, rid]);

	return (
		<>
			<Box display='flex' alignItems='center' justifyContent='space-between'>
				<span className='appia__team-info__title-label'>价值主张&Schedule</span>
				{canEdit ? <a onClick={onClick}>{editing ? '完成' : '编辑'}</a> : null}
			</Box>
			<Box>
				{editing ? (
					<TextAreaInput
						width='100%'
						rows={2}
						ref={inputRef}
						maxLength={100}
						value={text}
						onBlur={onBlur}
						onChange={onChange}
						style={{ width: '100%' }}
						className='rcx-input-box__wrapper'
					/>
				) : (
					<Box marginBlockEnd={defaultText ? 12 : 0} style={{ whiteSpace: 'break-spaces' }}>
						{defaultText}
					</Box>
				)}
			</Box>
		</>
	);
};

export default RoomSchedule;
