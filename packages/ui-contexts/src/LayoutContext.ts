import { createContext } from 'react';

export type SizeLayout = {
	sidebar: string;
	contextualBar: string;
};

export type LayoutContextValue = {
	isEmbedded: boolean;
	showTopNavbarEmbeddedLayout: boolean;
	isMobile: boolean;
	sidebar: {
		isCollapsed: boolean;
		toggle: () => void;
		collapse: () => void;
		expand: () => void;
		close: () => void;
	};
	size: SizeLayout;
	contextualBarExpanded: boolean;
	contextualBarPosition: 'absolute' | 'relative' | 'fixed';
};

export const LayoutContext = createContext<LayoutContextValue>({
	isEmbedded: false,
	showTopNavbarEmbeddedLayout: false,
	isMobile: false,
	sidebar: {
		isCollapsed: false,
		toggle: () => undefined,
		collapse: () => undefined,
		expand: () => undefined,
		close: () => undefined,
	},
	size: {
		sidebar: '380px',
		contextualBar: '380px',
	},
	contextualBarPosition: 'relative',
	contextualBarExpanded: false,
});
