import { useQueryStringParameter } from './useQueryStringParameter';

export const useTest = (): Boolean => {
	return useQueryStringParameter('test') === '1'
};
