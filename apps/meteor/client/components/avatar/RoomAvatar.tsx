import { useRoomAvatarPath,useEndpoint } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import type { IUser } from '@rocket.chat/core-typings';
import React, { memo,useEffect,useState } from 'react';

import { DiscussionDotIcon, ChannelDotIcon } from '../AppiaIcon';
import BaseAvatar from './BaseAvatar';

import '../../views/contact/style.css'

// TODO: frontend chapter day - Remove inline Styling

type RoomAvatarProps = {
	/* @deprecated */
	size?: 'x16' | 'x20' | 'x28' | 'x36' | 'x40' | 'x124' | 'x332';
	/* @deprecated */
	url?: string;

	roomHeader?: boolean;

	room: {
		_id: string;
		type?: string;
		t?: string;
		avatarETag?: string;
		prid?: string;
		teamMain?: boolean;
	};
};

const RoomAvatar = function RoomAvatar({ roomHeader,room, ...rest }: RoomAvatarProps): ReactElement {
	const getRoomPathAvatar = useRoomAvatarPath();
	const { url = getRoomPathAvatar(room), ...props } = rest;
	const [user,setUser] = useState<IUser | null>(null)
	const fetchUser = useEndpoint('GET','/v1/users.info');

	const getUserByRoomType = async () => {
		if(room.t === 'd'){
			try {
				const me = room?.u?.username || ''
				const [userId] = room?.usernames?.filter(name => name !== me)
				const {user} = await fetchUser({ userId })
				setUser(user)
			} catch(e){
				console.error(e)
				setUser(null)
			}
		}
	}

	useEffect(() => {
		if(roomHeader){
			getUserByRoomType()
		}
	}, [room.t,room,roomHeader])

	/* 	if (room.prid) {
		return (
			<div style={{ position: 'relative', overflow: 'visible' }}>
				<BaseAvatar url={url} {...props} />
				<TeamDotIcon style={{ position: 'absolute', bottom: 0, right: -5 }} />
			</div>
		);
	}
 */
	if (room.t === 'c') {
		return (
			<div style={{ position: 'relative', overflow: 'visible' }}>
				<BaseAvatar url={url} {...props} />
				<ChannelDotIcon style={{ position: 'absolute', bottom: 0, right: -5 }} />
			</div>
		);
	}
	if (room.teamMain || room.t === 'p') {
		return (
			<div style={{ position: 'relative', overflow: 'visible' }}>
				<BaseAvatar url={url} {...props} />
				<DiscussionDotIcon style={{ position: 'absolute', bottom: 0, right: -5 }} />
			</div>
		);
	}
	// 私聊 显示对方在线状态
	if(roomHeader && room.t === 'd'){
		return (
			<div style={{ position: 'relative'}}>
				<BaseAvatar url={url} {...props} />
				<div className={`contact-info-user-status-room-header contact-info-user-status-${user?.status}`} />
			</div>
		)
	}
	return <BaseAvatar url={url} {...props} />;
};

export default memo(RoomAvatar);
