import { css } from '@rocket.chat/css-in-js';
import { Box, Icon, TextInput, Margins } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import colors from '@rocket.chat/fuselage-tokens/colors';
import { useMediaUrl, useSetModal, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import React, { useCallback, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import VideoPlayIcon from './VideoPlayIcon';
import { List, Skeleton } from '../../../../../components/AppiaUI';
import FilePreview from '../../../../../components/message/content/attachments/FilePreview';
import { useRecordList } from '../../../../../hooks/lists/useRecordList';
import { AsyncStatePhase } from '../../../../../hooks/useAsyncState';
import { useFilesList } from '../../RoomFiles/hooks/useFilesList';

const hoverClass = css`
	&:hover {
		cursor: pointer;
		background-color: ${colors.n100};
	}
`;

const MediaMessages: React.FC<{ rid: string }> = ({ rid }) => {
	const dispatchToastMessage = useToastMessageDispatch();

	const t = useTranslation();
	const [text, setText] = useState('');

	const { filesList, loadMoreItems } = useFilesList(useMemo(() => ({ rid, type: 'media', text }), [rid, text]));
	const { phase, items: filesItems, itemCount: totalItemCount } = useRecordList(filesList);

	const getURL = useMediaUrl();
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());

	const handleTextChange = useCallback((event) => {
		setText(event.currentTarget.value);
	}, []);

	const onLoadMore = () => {
		const start = filesItems.length;
		if (start >= totalItemCount) {
			dispatchToastMessage({ type: 'success', message: '没有更多数据了～' });
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
			<div id='scrollableDiv' className='rocket-search-media-list'>
				<InfiniteScroll
					dataLength={data.length}
					next={onLoadMore}
					hasMore={filesItems.length < totalItemCount}
					loader={filesItems.length < totalItemCount ? <Skeleton avatar paragraph={{ rows: 1 }} active /> : null}
					scrollableTarget='scrollableDiv'
				>
					<List
						dataSource={data}
						grid={{ gutter: 16, column: 2 }}
						className='rocket-search-media-list-center'
						renderItem={(item, index) => {
							if (!item.url) {
								return null;
							}
							const itemUrl = item.url.replace('ufs/FileSystem:Uploads', 'file-proxy');
							return (
								<Box
									is='a'
									className={['rocket-search-media-item', hoverClass]}
									minWidth={0}
									download
									rel='noopener noreferrer'
									target='_blank'
									title={item.name}
									display='flex'
									flexGrow={1}
									flexShrink={1}
									href={itemUrl}
									key={index}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										setModal(<FilePreview url={getURL(itemUrl)} fileName={item.name} fileSize={item.size} onClose={closeModal} />);
									}}
								>
									{
										// eslint-disable-next-line @typescript-eslint/no-empty-interface
										item.typeGroup === 'image' ? (
											<img className='rocket-search-media-image' src={itemUrl} />
										) : (
											<div className='rocket-search-media-bg'>
												<VideoPlayIcon />
											</div>
										)
									}
								</Box>
							);
						}}
						// loadMore={loadMore}
						loading={phase === AsyncStatePhase.LOADING}
					/>
				</InfiniteScroll>
			</div>
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
