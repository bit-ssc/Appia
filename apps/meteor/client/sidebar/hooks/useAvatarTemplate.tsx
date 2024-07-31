import type { IRoom } from '@rocket.chat/core-typings';
import { useUserPreference } from '@rocket.chat/ui-contexts';
import type { ComponentType } from 'react';
import React, { useMemo } from 'react';

// import { DiscussionDotIcon, ChannelDotIcon, TeamDotIcon } from '../../components/AppiaIcon';
import RoomAvatar from '../../components/avatar/RoomAvatar';

export const useAvatarTemplate = (
	sidebarViewMode?: 'extended' | 'medium' | 'condensed',
	sidebarDisplayAvatar?: boolean,
): null | ComponentType<IRoom & { rid: string }> => {
	const sidebarViewModeFromSettings = useUserPreference<'extended' | 'medium' | 'condensed'>('sidebarViewMode');
	const sidebarDisplayAvatarFromSettings = useUserPreference('sidebarDisplayAvatar');

	const viewMode = sidebarViewMode ?? sidebarViewModeFromSettings;
	const displayAvatar = sidebarDisplayAvatar ?? sidebarDisplayAvatarFromSettings;
	return useMemo(() => {
		if (!displayAvatar) {
			return null;
		}

		const size = ((): 'x36' | 'x28' | 'x16' => {
			switch (viewMode) {
				case 'extended':
					return 'x36';
				case 'medium':
					return 'x28';
				case 'condensed':
				default:
					return 'x16';
			}
		})();

		const renderRoomAvatar: ComponentType<IRoom & { rid: string }> = (room) => {
			/* 		if (room.prid) {
				return (
					<div style={{ position: 'relative', overflow: 'visible' }}>
						<RoomAvatar size={size} room={{ ...room, _id: room.rid || room._id, type: room.t }} />
						<TeamDotIcon style={{ position: 'absolute', bottom: 0, right: -5 }} />
					</div>
				);
			}

			if (room.t === 'c') {
				return (
					<div style={{ position: 'relative', overflow: 'visible' }}>
						<RoomAvatar size={size} room={{ ...room, _id: room.rid || room._id, type: room.t }} />
						<ChannelDotIcon style={{ position: 'absolute', bottom: 0, right: -5 }} />
					</div>
				);
			}
			if (room.teamMain || room.t === 'p') {
				return (
					<div style={{ position: 'relative', overflow: 'visible' }}>
						<RoomAvatar size={size} room={{ ...room, _id: room.rid || room._id, type: room.t }} />
						<DiscussionDotIcon style={{ position: 'absolute', bottom: 0, right: -5 }} />
					</div>
				);
			} */
			return <RoomAvatar size={size} room={{ ...room, _id: room.rid || room._id, type: room.t }} />;
		};

		return renderRoomAvatar;
	}, [displayAvatar, viewMode]);
};
