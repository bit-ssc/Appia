// import { useUserPreference, useSetting } from '@rocket.chat/ui-contexts';
import moment from 'moment';
import { useCallback } from 'react';

// const dayFormat = ['h:mm A', 'H:mm'] as const;

export const useFormatTime = (): ((input: moment.MomentInput) => string) => {
	// const clockMode = useUserPreference<1 | 2>('clockMode');
	// const format = useSetting('Message_TimeFormat') as string;
	// const sameDay = clockMode !== undefined ? dayFormat[clockMode - 1] : format;

	// return useCallback(
	// 	(time) => {
	// 		switch (clockMode) {
	// 			case 1:
	// 			case 2:
	// 				return moment(time).format(sameDay);

	// 			default:
	// 				return moment(time).format(format);
	// 		}
	// 	},
	// 	[clockMode, format, sameDay],
	// );

	return useCallback((date:moment.MomentInput) => {
		const sevenDaysAgo = moment().subtract(7, 'days');
		const givenDate = moment(date)
		const offset = givenDate.utcOffset()
		const offsetHours = offset / 60
		let utcOffsetString;
		if (offset === 0) {
			// 如果偏移量为0，则为UTC时间
			utcOffsetString = 'UTC';
		} else {
			// 否则，创建带有正确符号的偏移字符串
			const hours = Math.abs(offsetHours);
			const sign = offset > 0 ? '+' : '-';
			utcOffsetString = `UTC${sign}${hours}`;
		}

		if(givenDate.isAfter(sevenDaysAgo)) {
			// 判断给定日期是否在过去七天之内
			return givenDate.utcOffset(offset).format(`MM/DD HH:mm (${utcOffsetString})`)
		}
	
		return givenDate.utcOffset(offset).format(`YYYY/MM/DD HH:mm (${utcOffsetString})`)
	
	},[])
};
