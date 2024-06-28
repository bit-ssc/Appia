import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import AddUsers from './AddUsers';
import VerticalBar from '../../../../../components/VerticalBar';

export default {
	title: 'Room/Contextual Bar/RoomMembers/AddUsers',
	component: AddUsers,
	parameters: {
		layout: 'fullscreen',
		actions: { argTypesRegex: '^on.*' },
	},
	decorators: [(fn) => <VerticalBar height='100vh'>{fn()}</VerticalBar>],
} as ComponentMeta<typeof AddUsers>;

export const Default: ComponentStory<typeof AddUsers> = (args) => <AddUsers {...args} />;
Default.storyName = 'AddUsers';
Default.args = {
	users: ['rocket.cat'],
};
