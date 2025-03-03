import moment from 'moment';
import { useCallback } from 'react';

export const useFormatHourMinute = (): ((input: moment.MomentInput) => string) => {
	return useCallback((date:moment.MomentInput) => {
		const givenDate = moment(date)
		return givenDate.format('HH:mm')
	},[])
};
