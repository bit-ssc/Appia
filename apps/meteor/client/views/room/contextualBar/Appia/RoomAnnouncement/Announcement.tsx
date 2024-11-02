import type { IRoom } from '@rocket.chat/core-typings';
import { Box, Callout } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { useCallback, useMemo, useState } from 'react';

import Content from './Content';
import Edit from './Edit';
import { AnnouncementIcon } from '../../../../../components/AppiaIcon';
import VerticalBar from '../../../../../components/VerticalBar';
import { AsyncStatePhase } from '../../../../../hooks/useAsyncState';
import { useEndpointData } from '../../../../../hooks/useEndpointData';
import { useTabBarClose } from '../../../contexts/ToolboxContext';

const Announcement: React.FC<{ rid: string }> = ({ rid }) => {
	const params = useMemo(() => ({ roomId: rid }), [rid]);
	const t = useTranslation();
	const onClickClose = useTabBarClose();
	const { phase, value, error, reload } = useEndpointData('/v1/rooms.info', { params });
	const [state, setState] = useState<'add' | 'edit' | 'detail'>('detail');
	const onAdd = useCallback(() => {
		setState('add');
	}, []);
	const onEdit = useCallback(() => {
		setState('edit');
	}, []);
	const onPreview = useCallback(() => {
		setState('detail');
	}, []);

	if (phase === AsyncStatePhase.LOADING) {
		return <VerticalBar.Skeleton />;
	}

	if (error) {
		return (
			<VerticalBar>
				<VerticalBar.Header>
					<Box is='span' color='rgba(0, 0, 0, 0.4)' cursor='pointer' alignItems='center' display='flex' fontSize={24}>
						<AnnouncementIcon />
					</Box>
					<VerticalBar.Text>{t('Team_Info')}</VerticalBar.Text>
					<VerticalBar.Close />
				</VerticalBar.Header>
				<VerticalBar.ScrollableContent>
					<Callout type='danger'>{JSON.stringify(error)}</Callout>
				</VerticalBar.ScrollableContent>
			</VerticalBar>
		);
	}
	const { room } = value;
	const isTeam = room.teamMain;
	const title = isTeam ? '群公告' : '频道公告';

	const header = (
		<VerticalBar.Header>
			<Box is='span' color='rgba(0, 0, 0, 0.4)' cursor='pointer' alignItems='center' display='flex' fontSize={24}>
				<AnnouncementIcon />
			</Box>

			<VerticalBar.Text>
				{state === 'detail' ? (
					title
				) : (
					<Box display='flex' alignItems='center'>
						<Box is='span' color='rgba(0, 0, 0, 0.4)' cursor='pointer' onClick={onPreview}>
							{title}
						</Box>

						<svg
							width='16'
							height='16'
							viewBox='0 0 16 16'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
							style={{ margin: '0 5px', color: 'rgba(0, 0, 0, 0.4)' }}
						>
							<path
								d='M6.4603 12.4592L5.54106 11.54L9.08144 7.99961L5.54106 4.45923L6.4603 3.53999L10.9199 7.99961L6.4603 12.4592Z'
								fill='black'
								fillOpacity='0.4'
							/>
						</svg>
						<Box is='span'>{state === 'edit' ? '编辑公告' : '添加公告'}</Box>
					</Box>
				)}
			</VerticalBar.Text>
			{onClickClose && <VerticalBar.Close onClick={onClickClose} />}
		</VerticalBar.Header>
	);

	if (state === 'detail') {
		return (
			<>
				{header}
				<Content room={room as unknown as IRoom} rid={rid} onAdd={onAdd} onEdit={onEdit} reload={reload} />
			</>
		);
	}

	return (
		<>
			{header}
			<Edit room={room as unknown as IRoom} type={state} rid={rid} onPreview={onPreview} reload={reload} r />
		</>
	);
};

export default Announcement;
