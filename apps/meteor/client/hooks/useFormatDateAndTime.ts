import { useUserPreference, useSetting } from '@rocket.chat/ui-contexts';
import type { MomentInput } from 'moment';
import moment from 'moment';
import { useCallback } from 'react';

type UseFormatDateAndTimeParams = {
	withSeconds?: boolean;
};

export const useFormatDateAndTime = ({ withSeconds }: UseFormatDateAndTimeParams = {}): ((input: MomentInput) => string) => {
	const clockMode = useUserPreference('clockMode');
	const format = useSetting('Message_TimeAndDateFormat') as string;

	return useCallback(
		(time) => {
			switch (clockMode) {
				case 1:
					return moment(time).format(withSeconds ? 'MMMM D, Y h:mm:ss A' : 'MMMM D, Y h:mm A');
				case 2:
					return moment(time).format(withSeconds ? 'MMMM D, Y H:mm:ss' : 'MMMM D, Y H:mm');

				default:
					return moment(time).format(withSeconds ? 'L LTS' : format);
			}
		},
		[clockMode, format, withSeconds],
	);
};

export const useFormatMessageRecordDateAndTime = () => {
	return useCallback((date:Date) => {
		const givenDate = moment(date);
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
	
		return givenDate.utcOffset(offset).format(`YYYY/MM/DD HH:mm (${utcOffsetString})`)
	
	},[])
}

