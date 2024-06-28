import type { Awaited } from '@rocket.chat/core-typings';
import type { ServerMethodFunction, ServerMethodParameters, ServerMethods } from '@rocket.chat/ui-contexts';
import { useMethod, useToastMessageDispatch } from '@rocket.chat/ui-contexts';
import { useCallback, useEffect } from 'react';

import type { AsyncState } from './useAsyncState';
import { useAsyncState } from './useAsyncState';

export const useMethodData = <MethodName extends keyof ServerMethods, Result = Awaited<ReturnType<ServerMethodFunction<MethodName>>>>(
	methodName: MethodName,
	args: ServerMethodParameters<MethodName>,
	initialValue?: Result | (() => Result),
): AsyncState<Result> & { reload: () => void } => {
	const { resolve, reject, reset, ...state } = useAsyncState<Result>(initialValue);
	const dispatchToastMessage = useToastMessageDispatch();
	const getData: ServerMethodFunction<MethodName> = useMethod(methodName);

	const fetchData = useCallback(() => {
		reset();
		getData(...args)
			.then(resolve)
			.catch((error) => {
				console.error(error);
				dispatchToastMessage({
					type: 'error',
					message: error,
				});
				reject(error);
			});
	}, [reset, getData, args, resolve, dispatchToastMessage, reject]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return {
		...state,
		reload: fetchData,
	};
};
