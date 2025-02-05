import type { IRoom } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useTranslation, useSetting, useSetModal } from '@rocket.chat/ui-contexts';
import React, { useState, useEffect } from 'react';
import type { FC } from 'react';

import { RoomTopTodoIcon } from '../../../components/AppiaIcon';
import FileIcon from '../../../components/FileIcon';
import FilePreview from '../../../components/message/Attachments/FilePreview';
import { useTodos } from '../../../hooks/todos/useTodos';
import './style/styles.css';

type ToDoPanelParams = {
	room: IRoom;
	isOpen: boolean;
	showTodosClick: () => void;
};

const ToDoPanel: FC<ToDoPanelParams> = ({ room, showTodosClick }) => {
	const fetchTodos = useTodos('GET', '/v1/appia/todos');
	const [content, setContent] = useState();
	const [todos, setTodos] = useState([]);
	const t = useTranslation();
	const baseUrl = useSetting('Site_Url') as string;
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());

	const fileContent = (fileName, fileUrl) => {
		return (
			<div className='room-panel-image-body'>
				<FileIcon fileName={fileName} fontSize={16} style={{ flexShrink: 0 }} />
				<Box
					color='#5297FF'
					onClick={() => {
						// setModal(<FilePreview url={fileUrl} fileName={fileName} fileSize={1024} onClose={closeModal} />);
						window.location.href = fileUrl;
					}}
					textAlign='left'
					margin='0 0 0 5px'
					style={{
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						cursor: 'pointer',
					}}
				>
					{fileName}
				</Box>
			</div>
		);
	};

	const getTodos = async (params: { rid: string; offset?: number; count?: number }) => {
		try {
			const { data } = await fetchTodos(params);
			let p_content = <div className='room-panel-body'>{t('Have_Nothing_To_Do')}</div>;
			if (data && data.list.length > 0) {
				if (data.list[0].title) {
					p_content = <div className='room-panel-body'>{data.list[0].title}</div>;
				} else if (data.list[0].attachments.length > 0) {
					if (data.list[0].attachments[0].image_url) {
						const fileUrl = `${baseUrl}${data.list[0].attachments[0].image_url}`;
						p_content = fileContent(data.list[0].attachments[0].title, fileUrl);
					} else if (data.list[0].attachments[0].title_link) {
						const fileUrl = `${baseUrl}${data.list[0].attachments[0].title_link}`;
						p_content = fileContent(data.list[0].attachments[0].title, fileUrl);
					}
				}
			}
			setContent(p_content);
			setTodos(data?.list || []);
		} catch (error) {
			console.log(error);
		} finally {
		}
	};

	useEffect(() => {
		getTodos({ rid: room._id });
	}, [room]);

	return (
		<div className='room-panel-container' style={{ width: room.t === 'd' ? '100%' : '50%' }}>
			<div className='room-panel-header'>
				<div className='room-panel-title'>
					<RoomTopTodoIcon />
					<div className='room-panel-title-text'>{t('Todo')}</div>
				</div>
				{todos.length > 0 && (
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<div
							className='room-panel-title-right'
							onClick={() => {
								showTodosClick && showTodosClick();
							}}
						>
							{`${t('unfold')}(${todos.length})`}
						</div>
					</div>
				)}
			</div>
			{content}
		</div>
	);
};

export default ToDoPanel;
