import type { IOmnichannelRoom } from '@rocket.chat/core-typings';
import { Icon } from '@rocket.chat/fuselage';
import type { ComponentProps, ReactElement } from 'react';
import React from 'react';

const colors = {
	busy: 'status-font-on-danger',
	away: 'status-font-on-warning',
	online: 'status-font-on-success',
	offline: 'annotation',
};

const iconMap = {
	widget: 'livechat',
	email: 'mail',
	sms: 'sms',
	app: 'headset',
	api: 'headset',
	other: 'headset',
} as const;

export const OmnichannelCoreSourceRoomIcon = ({
	room,
	size = 'x16',
}: {
	room: IOmnichannelRoom;
	size: ComponentProps<typeof Icon>['size'];
}): ReactElement => {
	const icon = iconMap[room.source?.type || 'other'] || 'headset';
	return <Icon name={icon} size={size} color={colors[room.v?.status || 'offline']} />;
};
