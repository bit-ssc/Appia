import type { RouterContextValue } from '@rocket.chat/ui-contexts';
import { RouterContext } from '@rocket.chat/ui-contexts';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tracker } from 'meteor/tracker';
import type { FC } from 'react';
import React from 'react';

import { createSubscription } from '../lib/createSubscription';

const queryRoutePath = (
	name: Parameters<RouterContextValue['queryRoutePath']>[0],
	parameters: Parameters<RouterContextValue['queryRoutePath']>[1],
	queryStringParameters: Parameters<RouterContextValue['queryRoutePath']>[2],
): ReturnType<RouterContextValue['queryRoutePath']> => createSubscription(() => FlowRouter.path(name, parameters, queryStringParameters));

const queryRouteUrl = (
	name: Parameters<RouterContextValue['queryRouteUrl']>[0],
	parameters: Parameters<RouterContextValue['queryRouteUrl']>[1],
	queryStringParameters: Parameters<RouterContextValue['queryRouteUrl']>[2],
): ReturnType<RouterContextValue['queryRouteUrl']> => createSubscription(() => FlowRouter.url(name, parameters, queryStringParameters));

const pushRoute = (
	name: Parameters<RouterContextValue['pushRoute']>[0],
	parameters: Parameters<RouterContextValue['pushRoute']>[1],
	queryStringParameters?: ((prev: Record<string, string>) => Record<string, string>) | Record<string, string>,
): ReturnType<RouterContextValue['pushRoute']> => {
	const queryParams =
		typeof queryStringParameters === 'function' ? queryStringParameters(FlowRouter.current().queryParams) : queryStringParameters;
	FlowRouter.go(name, parameters, queryParams);
};

const replaceRoute = (
	name: Parameters<RouterContextValue['replaceRoute']>[0],
	parameters: Parameters<RouterContextValue['replaceRoute']>[1],
	queryStringParameters?: ((prev: Record<string, string>) => Record<string, string>) | Record<string, string>,
): ReturnType<RouterContextValue['replaceRoute']> => {
	FlowRouter.withReplaceState(() => {
		const queryParams =
			typeof queryStringParameters === 'function' ? queryStringParameters(FlowRouter.current().queryParams) : queryStringParameters;
		FlowRouter.go(name, parameters, queryParams);
	});
};

const queryRouteParameter = (
	name: Parameters<RouterContextValue['replaceRoute']>[0],
): ReturnType<RouterContextValue['queryRouteParameter']> => createSubscription(() => FlowRouter.getParam(name));

const queryQueryStringParameter = (
	name: Parameters<RouterContextValue['queryQueryStringParameter']>[0],
): ReturnType<RouterContextValue['queryQueryStringParameter']> => createSubscription(() => FlowRouter.getQueryParam(name));

const queryCurrentRoute = (): ReturnType<RouterContextValue['queryCurrentRoute']> =>
	createSubscription(() => {
		FlowRouter.watchPathChange();
		const { route, params, queryParams } = FlowRouter.current();
		return [route?.name, params, queryParams, route?.group?.name];
	});

const setQueryString = (paramsOrFn: Record<string, string | null> | ((prev: Record<string, string>) => Record<string, string>)): void => {
	if (typeof paramsOrFn === 'function') {
		const prevParams = FlowRouter.current().queryParams;
		const emptyParams = Object.fromEntries(Object.entries(prevParams).map(([key]) => [key, null]));
		const newParams = paramsOrFn(prevParams);
		FlowRouter.setQueryParams({ ...emptyParams, ...newParams });
		return;
	}

	FlowRouter.setQueryParams(paramsOrFn);
};

const getRoutePath = (name: string, parameters?: Record<string, string>, queryStringParameters?: Record<string, string>) =>
	Tracker.nonreactive(() => FlowRouter.path(name, parameters, queryStringParameters));

const contextValue = {
	queryRoutePath,
	queryRouteUrl,
	pushRoute,
	replaceRoute,
	queryRouteParameter,
	queryQueryStringParameter,
	queryCurrentRoute,
	setQueryString,
	getRoutePath,
};

const RouterProvider: FC = ({ children }) => <RouterContext.Provider children={children} value={contextValue} />;

export default RouterProvider;
