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
	appiaAvatarType: 'normal' | 'letter';
	showImageSummary: boolean;
	showDocumentSummary: boolean;
};

export const LayoutContext = createContext<LayoutContextValue>({
	isEmbedded: false,
	appiaAvatarType: 'normal',
	showImageSummary: true,
	showDocumentSummary: true,
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
		contextualBar: '300px',
	},
	contextualBarPosition: 'absolute',
	contextualBarExpanded: false,
});
