import { css } from '@rocket.chat/css-in-js';
import { Box, Icon, TextInput, Margins } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import colors from '@rocket.chat/fuselage-tokens/colors';
import { useMediaUrl, useSetModal, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import React, { useCallback, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { List, Skeleton } from '../../../../../components/AppiaUI';
import FilePreview from '../../../../../components/message/content/attachments/FilePreview';
import { useRecordList } from '../../../../../hooks/lists/useRecordList';
import { AsyncStatePhase } from '../../../../../hooks/useAsyncState';
import { useFilesList } from '../../RoomFiles/hooks/useFilesList';
import VideoPlayIcon from './VideoPlayIcon';
// import { useMessages } from '../../../MessageList/hooks/useMessages'
// import {setMessageJumpQueryStringParameter} from '../../../../../lib/utils/setMessageJumpQueryStringParameter'
// import LocateToOriginImg from '../../../../../components/AppiaIcon/LocateToOriginImg';
import './style.css';
import { useFormatMessageRecordDateAndTime } from '../../../../../hooks/useFormatDateAndTime';

const hoverClass = css`
	position: relative;
	.locate-mask {
		display: none;
	}
	&:hover {
		cursor: pointer;
		background-color: ${colors.n100};

		.locate-mask {
			display: block;
			position: absolute;
			background: rgba(0, 0, 0, 0.3);
			width: calc(100% - 10px);
			bottom: 0;
			cursor: pointer;
			margin: 5px;
			text-align: center;
			line-height: 16px;
		}
	}
`;

const MediaMessages: React.FC<{ rid: string }> = ({ rid }) => {
	const dispatchToastMessage = useToastMessageDispatch();

	const format = useFormatMessageRecordDateAndTime();

	const t = useTranslation();
	const [text, setText] = useState('');

	const { filesList, loadMoreItems } = useFilesList(useMemo(() => ({ rid, type: 'media', text }), [rid, text]));
	const { phase, items: filesItems, itemCount: totalItemCount } = useRecordList(filesList);
	// const messages = useMessages({ rid });

	const getURL = useMediaUrl();
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());

	const handleTextChange = useCallback((event) => {
		setText(event.currentTarget.value);
	}, []);

	const onLoadMore = () => {
		const start = filesItems.length;
		if (start >= totalItemCount) {
			dispatchToastMessage({ type: 'success', message: t('No_More_Data') });
			return;
		}
		loadMoreItems(start, Math.min(50, totalItemCount - start));
	};

	// const loadMore = (
	// 	phase !== AsyncStatePhase.LOADING && filesItems.length < totalItemCount ? (
	// 	<div
	// 		style={{
	// 			textAlign: 'center',
	// 			marginTop: 12,
	// 			height: 32,
	// 			lineHeight: '32px',
	// 		}}
	// 	>
	// 		<Button onClick={onLoadMore}>加载更多</Button>
	// 	</div>
	// );
	// ) : null;

	const onRenderList = () => {
		const data = filesItems.filter((item) => item.typeGroup === 'image' || item.typeGroup === 'video');

		return (
			<>
				<div id='scrollableDiv' className='rocket-search-media-list'>
					<InfiniteScroll
						dataLength={data.length}
						next={onLoadMore}
						hasMore={true}
						loader={filesItems.length < totalItemCount ? <Skeleton avatar paragraph={{ rows: 1 }} active /> : null}
						scrollableTarget='scrollableDiv'
						scrollThreshold={0.6}
						style={{ overflow: 'none !important ' }}
					>
						<List
							dataSource={data}
							className='rocket-search-media-list-center'
							renderItem={(item, index) => {
								if (!item.url) {
									return null;
								}
								const itemUrl = item.url.replace('ufs/FileSystem:Uploads', 'file-proxy');
								// const message = messages.find((message) => message?.file?._id === item._id);
								let title = '';
								const uploadedAtFormat = item.uploadedAt ? format(item.uploadedAt) : '';
								let [text, time] = item.name?.split('-') || [];

								if (text && time && uploadedAtFormat) {
									text = text.trim();
									const [_, type] = time.split('.');
									title = `${text} - ${uploadedAtFormat}.${type}`;
								}

								return (
									<List.Item key={item.url} style={{ width: '50%' }}>
										<Box
											is='a'
											className={['rocket-search-media-item', hoverClass]}
											minWidth={0}
											download
											rel='noopener noreferrer'
											target='_blank'
											title={title}
											display='flex'
											flexGrow={1}
											flexShrink={1}
											href={itemUrl}
											key={index}
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												// setModal(<FilePreview url={getURL(itemUrl)} fileName={item.name} fileSize={item.size} onClose={closeModal} />);
												window.location.href = getURL(itemUrl);
											}}
										>
											{
												// eslint-disable-next-line @typescript-eslint/no-empty-interface
												item.typeGroup === 'image' ? (
													<img className='rocket-search-media-image' src={itemUrl} style={{ minHeight: '200px' }} />
												) : (
													<div className='rocket-search-media-bg'>
														<VideoPlayIcon />
													</div>
												)
											}
											{/* <div 
											className={"locate-mask"}
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												setMessageJumpQueryStringParameter(message?._id)}}>
												<LocateToOriginImg color={"rgba(255, 255, 255, 0.6)"} fontSize={16}/>
											</div> */}
										</Box>
									</List.Item>
								);
							}}
							// loadMore={loadMore}
							loading={phase === AsyncStatePhase.LOADING}
						/>
					</InfiniteScroll>
				</div>
			</>
		);
	};

	return (
		<Box width='full' height='full' pb='x16' overflow='hidden'>
			<Box display='flex' flexDirection='row' flexShrink={0}>
				<Box display='flex' flexDirection='row' flexGrow={1} mi='neg-x4'>
					<Margins inline='x4'>
						<TextInput
							data-qa-files-search
							placeholder={t('Search_Files')}
							value={text}
							onChange={handleTextChange}
							addon={<Icon name='magnifier' size='x20' />}
						/>
					</Margins>
				</Box>
			</Box>
			{/* {phase === AsyncStatePhase.LOADING && (
				<Box p='x12'>
					<Throbber size='x12' />
				</Box>
			)} */}
			{phase !== AsyncStatePhase.LOADING && filesItems.length <= 0 && (
				<Box textAlign='center' p='x12' color='neutral-600'>
					{t('No_files_found')}
				</Box>
			)}
			{onRenderList()}
		</Box>
	);
};

export default MediaMessages;
