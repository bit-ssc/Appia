import colorTokens from '@rocket.chat/fuselage-tokens/colors.json';
import { addons } from '@storybook/addons';
import { create } from '@storybook/theming';

import logo from './logo.svg';
import manifest from '../package.json';

addons.setConfig({
	theme: create({
		base: 'light',
		brandTitle: manifest.name,
		brandImage: logo,
		brandUrl: manifest.author.url,
		colorPrimary: colorTokens.n500,
		colorSecondary: colorTokens.b500,
	}),
});
