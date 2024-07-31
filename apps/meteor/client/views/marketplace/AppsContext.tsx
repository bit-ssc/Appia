import { createContext, useContext } from 'react';

import type { App } from './types';
import type { AsyncState } from '../../lib/asyncState';
import { AsyncStatePhase } from '../../lib/asyncState';

type AppsContextValue = {
	installedApps: AsyncState<{ apps: App[] }>;
	marketplaceApps: AsyncState<{ apps: App[] }>;
	privateApps: AsyncState<{ apps: App[] }>;
	reload: () => Promise<void>;
};

export const AppsContext = createContext<AppsContextValue>({
	installedApps: {
		phase: AsyncStatePhase.LOADING,
		value: undefined,
		error: undefined,
	},
	marketplaceApps: {
		phase: AsyncStatePhase.LOADING,
		value: undefined,
		error: undefined,
	},
	privateApps: {
		phase: AsyncStatePhase.LOADING,
		value: undefined,
		error: undefined,
	},
	reload: () => Promise.resolve(),
});

export const useAppsReload = (): (() => void) => {
	const { reload } = useContext(AppsContext);
	return reload;
};

export const useAppsResult = (): AppsContextValue => useContext(AppsContext);
