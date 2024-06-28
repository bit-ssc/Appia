import type { IOmnichannelRoomFromAppSource } from '@rocket.chat/core-typings';
import { Icon, Box } from '@rocket.chat/fuselage';
import type { ComponentProps, ReactElement } from 'react';
import React from 'react';

import { useOmnichannelRoomIcon } from './context/OmnichannelRoomIconContext';
import { AsyncStatePhase } from '../../../lib/asyncState/AsyncStatePhase';

const colors = {
	busy: 'status-font-on-danger',
	away: 'status-font-on-warning',
	online: 'status-font-on-success',
	offline: 'annotation',
};

const convertBoxSizeToNumber = (boxSize: ComponentProps<typeof Icon>['size']): number => {
	switch (boxSize) {
		case 'x20': {
			return 20;
		}
		case 'x24': {
			return 24;
		}
		case 'x16':
		default: {
			return 16;
		}
	}
};

export const OmnichannelAppSourceRoomIcon = ({
	room,
	size = 16,
	placement = 'default',
}: {
	room: IOmnichannelRoomFromAppSource;
	size: ComponentProps<typeof Icon>['size'];
	placement: 'sidebar' | 'default';
}): ReactElement => {
	const color = colors[room.v.status || 'offline'];
	const icon = (placement === 'sidebar' && room.source.sidebarIcon) || room.source.defaultIcon;
	const { phase, value } = useOmnichannelRoomIcon(room.source.id, icon || '');
	const fontSize = convertBoxSizeToNumber(size);
	if ([AsyncStatePhase.REJECTED, AsyncStatePhase.LOADING].includes(phase)) {
		return <Icon name='headset' size={size} color={color} />;
	}
	return (
		<Box size={fontSize} color={color}>
			<Box is='svg' size={fontSize} aria-hidden='true'>
				<Box is='use' href={`#${value}`} />
			</Box>
		</Box>
	);
};
