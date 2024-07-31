import { useContext, useMemo } from 'react';

import type { QueryStringParameters, RouteParameters } from '../RouterContext';
import { RouterContext } from '../RouterContext';

type Route = {
	getPath: (parameters?: RouteParameters, queryStringParameters?: QueryStringParameters) => string | undefined;
	getUrl: (parameters?: RouteParameters, queryStringParameters?: QueryStringParameters) => string | undefined;
	push: (
		parameters?: RouteParameters,
		queryStringParameters?: ((prev: Record<string, string>) => Record<string, string>) | Record<string, string>,
	) => void;
	replace: (
		parameters?: RouteParameters,
		queryStringParameters?: ((prev: Record<string, string>) => Record<string, string>) | Record<string, string>,
	) => void;
};

export const useRoute = (name: string): Route => {
	const { queryRoutePath, queryRouteUrl, pushRoute, replaceRoute } = useContext(RouterContext);

	return useMemo<Route>(
		() => ({
			getPath: (parameters, queryStringParameters) => queryRoutePath(name, parameters, queryStringParameters)[1](),
			getUrl: (parameters, queryStringParameters) => queryRouteUrl(name, parameters, queryStringParameters)[1](),
			push: (parameters, queryStringParameters) => pushRoute(name, parameters, queryStringParameters),
			replace: (parameters, queryStringParameters) => replaceRoute(name, parameters, queryStringParameters),
		}),
		[queryRoutePath, queryRouteUrl, name, pushRoute, replaceRoute],
	);
};
