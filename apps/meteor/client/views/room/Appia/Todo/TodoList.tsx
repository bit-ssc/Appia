import type { IRoom } from '@rocket.chat/core-typings';
import { Box, Button } from '@rocket.chat/fuselage';
import { useTranslation, useEndpoint } from '@rocket.chat/ui-contexts';
import DOMPurify from 'dompurify';
import { debounce } from 'lodash';
import type { FC } from 'react';
import React, { memo, useState, useEffect, useRef } from 'react';

import { ChatMessage } from '../../../../../app/models/client';
import { ArrowIcon } from '../../../../components/AppiaIcon';
import FileIcon from '../../../../components/FileIcon';
import VerticalBarClose from '../../../../components/VerticalBar/VerticalBarClose';
import { useMediaUrl } from '../../../../components/message/Attachments/context/AttachmentContext';
import { dispatchToastMessage } from '../../../../lib/toast';
import { setMessageJumpQueryStringParameter } from '../../../../lib/utils/setMessageJumpQueryStringParameter';
import { useRoomContext } from '../../contexts/RoomContext';
import { emitter } from '../../contextualBar/Appia/Todos/TodoUtils';
import AnnouncementComponent from '../Announcement/AnnouncementComponent';
import { generateFormattedData } from '../Announcement/Meeting/TimeUtils';
import Location from './Icon/Location';
import type { IToDo } from './hook/useTodo';
import { useTodo } from './hook/useTodo';

type AnnouncementParams = {
	room: IRoom;
};

enum ItemFoldStatus {
	default = '0',
	fold = '1',
	unfold = '2',
}

const TodoList: FC<AnnouncementParams> = ({ room }) => {
	const t = useTranslation();
	const getURL = useMediaUrl();
	const { setRoomTopView } = useRoomContext();
	const { todos, refreshTodos } = useTodo(room._id, room.todoCount);
	const [rows, setRows] = useState<ItemFoldStatus[]>([]);
	const [currentFoldIndex, setCurrentFoldIndex] = useState(-1);
	const elementRef = useRef(null);
	const cancelTodos = useEndpoint('POST', '/v1/appia/update-message-todo-status');

	const handleRows = () => {
		const newRows = todos?.map((item, index) => {
			let foldStatus = ItemFoldStatus.default;
			const divElement = document.getElementById(`todo-row-${index}`);
			if (divElement) {
				const isMultiLine = divElement.scrollWidth > divElement.clientWidth || divElement.clientHeight > 20 || /\r|\n/.test(item.title);
				if (isMultiLine) {
					foldStatus = index === currentFoldIndex ? ItemFoldStatus.unfold : ItemFoldStatus.fold;
				}
			}
			return foldStatus;
		});
		setRows(newRows || []);
	};

	// 更新窗口宽度的函数
	const handleResize = () => {
		handleRows();
	};

	// 使用防抖包装处理函数
	const debouncedHandleResize = debounce(handleResize, 250);

	useEffect(() => {
		const resizeObserver = new ResizeObserver((_) => {
			debouncedHandleResize();
		});

		const currentElement = elementRef.current;
		if (currentElement) {
			resizeObserver.observe(currentElement);
		}

		return () => {
			if (currentElement) {
				resizeObserver.unobserve(currentElement);
			}
		};
	}, [elementRef.current]);

	useEffect(() => {
		debouncedHandleResize();
	}, [currentFoldIndex, todos]);

	const handleFoldItem = (index: number) => {
		setCurrentFoldIndex(index === currentFoldIndex ? -1 : index);
	};

	const handleFinish = (id: string) => {
		cancelTodos({
			id,
			status: -1,
		});
		refreshTodos();
		emitter.emit('updateTodos');
	};

	const goToMessage = (todo: IToDo) => {
		if (!todo.mid) return;
		setMessageJumpQueryStringParameter(todo.mid);
		const message = ChatMessage.findOne(todo.mid);
		if (message?.t === 'rollback-message') {
			dispatchToastMessage({ type: 'success', message: t('Message_Recalled') });
		}
	};

	const renderTodoHeader = (todo: IToDo, index: number) => {
		const headerText = t('Room_todo_title_time', { time: generateFormattedData(todo.createdAt) });

		return (
			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', whiteSpace: 'pre-wrap' }}>
				<div className='antTitle3'>{`(${index + 1})  `}</div> {headerText}
			</div>
		);
	};

	const renderFinishIcon = (item: IToDo) => {
		if (!item) return null;

		return (
			<Button
				style={{
					border: '1px solid #1B5BFF',
					color: '#1B5BFF',
					fontSize: 14,
					padding: '2px 4px',
					backgroundColor: '#fff',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
				onClick={(e) => {
					e.stopPropagation();
					handleFinish(item.id);
				}}
			>
				{t('Completed_todo')}
			</Button>
		);
	};

	const renderLocation = (show: boolean, fold: boolean, item: IToDo) => {
		if (!show) return null;
		return fold ? (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					verticalAlign: 'middle',
					color: '#1B5BFF',
					fontWeight: 400,
					cursor: 'pointer',
				}}
				onClick={() => goToMessage(item)}
			>
				<Location />
				{`${t('Anchor')}`}
			</div>
		) : (
			<span
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					verticalAlign: 'middle',
					marginLeft: 10,
					color: '#1B5BFF',
					fontWeight: 400,
					cursor: 'pointer',
				}}
				onClick={() => goToMessage(item)}
			>
				<Location />
				{`${t('Anchor')}`}
			</span>
		);
	};

	return (
		<AnnouncementComponent>
			<div className='antHeader' ref={elementRef}>
				<div className='antTitle1'>{t('Todo')}</div>
				<div className='antRow' onClick={() => setRoomTopView('')}>
					<VerticalBarClose />
				</div>
			</div>
			<div style={{ flexDirection: 'column', display: 'flex', maxHeight: '70vh', overflowY: 'scroll' }}>
				{todos?.map((item, index) => {
					const files = item.attachments || [];
					return (
						<Box className='antItem' key={index}>
							<Box className='antTodoItemLeft'>
								<Box display='flex' style={{ fontSize: '12px', color: '#555555' }}>
									{renderTodoHeader(item, index)}
								</Box>
								<div
									style={{
										marginTop: '6px',
										...(rows[index] !== ItemFoldStatus.unfold
											? {
													display: 'flex',
													flexDirection: 'row',
											  }
											: {}),
									}}
								>
									<Box
										style={{
											display: rows[index] !== ItemFoldStatus.unfold ? '' : 'inline',
											fontSize: '14px',
											textOverflow: 'ellipsis',
											overflowX: 'hidden',
											overflowY: 'scroll',
											whiteSpace: rows[index] !== ItemFoldStatus.unfold ? 'nowrap' : 'pre-wrap',
											wordBreak: 'break-word',
											maxHeight: '500px',
											verticalAlign: 'middle',
										}}
										dangerouslySetInnerHTML={{
											__html: DOMPurify.sanitize(item.title).replace(
												/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
												(text) => `<a target="_blank" rel="nofollow noopener noreferrer" href='${text}' style="color: #5297FF">${text}</a>`,
											),
										}}
										id={`todo-row-${index}`}
									></Box>
									{renderLocation(!!item.title, rows[index] !== ItemFoldStatus.unfold, item)}
								</div>
								<Box display='flex' flexDirection='row' flexWrap='wrap' style={{ marginTop: '5px' }}>
									{files.length > 0
										? files.map((element) => (
												<Box key={element.title_link} display='flex' alignItems='center' style={{ cursor: 'pointer', marginRight: '10px' }}>
													<FileIcon fileName={element.title} fontSize={16} style={{ flexShrink: 0 }} />
													<Box
														color='#5297FF'
														onClick={(e) => {
															e.stopPropagation();
															if (element.title_link) {
																window.location.href = getURL(element.title_link);
															}
														}}
														textAlign='left'
														margin='0 0 0 5px'
													>
														{element.title}
													</Box>
												</Box>
										  ))
										: null}
									{files.length > 0 && !item.title ? (
										<span
											style={{
												display: 'inline-flex',
												alignItems: 'center',
												verticalAlign: 'middle',
												marginLeft: 10,
												color: '#1B5BFF',
												fontWeight: 400,
												cursor: 'pointer',
											}}
											onClick={() => goToMessage(item)}
										>
											<Location />
											{`${t('Anchor')}`}
										</span>
									) : null}
								</Box>
							</Box>
							<Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 'auto', minWidth: '72px' }}>
								{renderFinishIcon(item)}
								{rows?.length > 0 && rows[index] !== ItemFoldStatus.default ? (
									<div
										className='antRow1'
										onClick={(e) => {
											e.stopPropagation();
											handleFoldItem(index);
										}}
									>
										<ArrowIcon
											fontSize='16px'
											style={{
												transform: `rotate(${rows[index] === ItemFoldStatus.fold ? 0 : 180}deg)`,
												transition: 'transform 0.5s ease',
											}}
										/>
										<div className='antTitle2'>{rows[index] === ItemFoldStatus.fold ? t('Announcement_Unfold') : t('fold')}</div>
									</div>
								) : null}
							</Box>
						</Box>
					);
				})}
			</div>
		</AnnouncementComponent>
	);
};

export default memo(TodoList);
