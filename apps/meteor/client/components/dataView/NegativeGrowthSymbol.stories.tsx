import { Box } from '@rocket.chat/fuselage';
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import NegativeGrowthSymbol from './NegativeGrowthSymbol';
import { useAutoSequence } from '../../stories/hooks/useAutoSequence';

export default {
	title: 'Components/Data/NegativeGrowthSymbol',
	component: NegativeGrowthSymbol,
	parameters: {
		layout: 'centered',
		controls: { hideNoControlsWarning: true },
	},
	decorators: [
		(fn) => {
			const color = useAutoSequence(['neutral-500', 'primary-500', 'danger-500', 'warning-500', 'success-500']);

			return <Box color={color}>{fn()}</Box>;
		},
	],
} as ComponentMeta<typeof NegativeGrowthSymbol>;

const Template: ComponentStory<typeof NegativeGrowthSymbol> = (args) => <NegativeGrowthSymbol {...args} />;

export const Default = Template.bind({});
Default.storyName = 'NegativeGrowthSymbol';
