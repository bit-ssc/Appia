import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { useState } from 'react';

import VerticalBar from '../../../../../components/VerticalBar';
import { useRoom } from '../../../contexts/RoomContext';
import { useTabBarClose } from '../../../contexts/ToolboxContext';
import MentionsTab from '../../MentionsTab';
import MessageSearch from '../../MessageSearchTab';
import RoomFilesWithData from '../../RoomFiles/RoomFilesWithData';
import MediaMessages from '../MediaMessages';
import { appiaSearchMessagesStyle } from '../appia-style';

const SearchMessages: React.FC = () => {
	const room = useRoom();
	const onClickClose = useTabBarClose();
	const t = useTranslation();

	const [selectedValue, setSelectedValue] = useState(0);
	const className = (baseName: string, isSelected: boolean) => (isSelected ? [baseName].concat('selected') : [baseName]).join(' ');

	const renderList = () => (
		<div className='rocket-search-tabs'>
			<div className='rocket-search-tablist'>
				<div className={className('rocket-search-tab-list-item', selectedValue === 0)} onClick={() => setSelectedValue(0)}>
					消息
				</div>
				<div className={className('rocket-search-tab-list-item', selectedValue === 1)} onClick={() => setSelectedValue(1)}>
					文件
				</div>
				<div className={className('rocket-search-tab-list-item', selectedValue === 2)} onClick={() => setSelectedValue(2)}>
					图片/视频
				</div>
				<div className={className('rocket-search-tab-list-item', selectedValue === 3)} onClick={() => setSelectedValue(3)}>
					被提及
				</div>
			</div>
			<div className='rocket-search-tab-pannel'>
				{selectedValue === 0 && (
					<div className='rocket-search-tab-panel-item'>
						<MessageSearch />
					</div>
				)}
				{selectedValue === 1 && (
					<div className='rocket-search-tab-panel-item'>
						<RoomFilesWithData rid={room._id} />
					</div>
				)}
				{selectedValue === 2 && (
					<div className='rocket-search-tab-panel-item'>
						<MediaMessages rid={room._id} />
					</div>
				)}
				{selectedValue === 3 && (
					<div className='rocket-search-tab-panel-item-metion'>
						<MentionsTab rid={room._id} />
					</div>
				)}
			</div>
		</div>
	);

	let message = t('Message');
	switch (room.t) {
		case 'c':
			message = t('Channel');
			break;
		case 'p':
			message = t('Teams');
			break;

		default:
			break;
	}
	return (
		<Box className={appiaSearchMessagesStyle}>
			<VerticalBar.Header>
				<VerticalBar.Icon name='magnifier' />
				<VerticalBar.Text>{`搜索${message}内容`}</VerticalBar.Text>

				<VerticalBar.Close onClick={onClickClose} />
			</VerticalBar.Header>
			<VerticalBar.Content>
				{/* <Tabs defaultActiveKey='1' items={items} onChange={onChange} centered /> */}
				{renderList()}
			</VerticalBar.Content>
		</Box>
	);
};

export default SearchMessages;
