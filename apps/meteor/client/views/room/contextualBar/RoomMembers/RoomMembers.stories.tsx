import { UserStatus } from '@rocket.chat/core-typings';
import { action } from '@storybook/addon-actions';
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import RoomMembers from './RoomMembers';
import VerticalBar from '../../../../components/VerticalBar';

export default {
	title: 'Room/Contextual Bar/RoomMembers',
	component: RoomMembers,
	parameters: {
		layout: 'fullscreen',
		actions: { argTypesRegex: '^on.*' },
	},
	decorators: [(fn) => <VerticalBar height='100vh'>{fn()}</VerticalBar>],
} as ComponentMeta<typeof RoomMembers>;

const Template: ComponentStory<typeof RoomMembers> = (args) => <RoomMembers {...args} />;

export const Default = Template.bind({});
Default.args = {
	loading: false,
	members: [
		{
			_id: 'rocket.cat',
			username: 'rocket.cat',
			status: UserStatus.ONLINE,
			name: 'Rocket.Cat',
			_updatedAt: new Date(),
		},
	],
	text: 'filter',
	type: 'online',
	setText: action('Lorem Ipsum'),
	setType: action('online'),
	total: 123,
	loadMoreItems: action('loadMoreItems'),
	rid: '!roomId',
	isTeam: false,
	isDirect: false,
	reload: action('reload'),
};

export const Loading = Template.bind({});
Loading.args = {
	loading: true,
	setText: action('setText'),
	setType: action('setType'),
	loadMoreItems: action('loadMoreItems'),
	reload: action('reload'),
};
