import type { IMeeting } from '@rocket.chat/core-typings';
import { useMemo } from 'react';

interface IEditPeriodicInfo {
	editPeriodicTypeInterval?: string;
	editPeriodicCountType?: string;
	editPeriodicEndTime?: string;
	editPeriodicCount?: number;
	editPeriodicUnit?: string;
	editPeriodicInterval?: number;
}

export const useEditPeriodicInfo = (editMeeting?: IMeeting): IEditPeriodicInfo | undefined => {
	return useMemo(() => {
		if (!editMeeting || !editMeeting.periodic || !editMeeting.periodicInfo) return undefined;
		const { periodicInfo } = editMeeting;

		// 结束类型 结束时间 结束次数 周期类型
		return {
			editPeriodicTypeInterval: '6',
			editPeriodicCountType: periodicInfo.periodicCountType || 'TO_DATE',
			editPeriodicEndTime: periodicInfo.periodicEndDate,
			editPeriodicCount: periodicInfo.periodicCount || 7,
			editPeriodicUnit: periodicInfo.periodicUnit !== 'WORKDAY' ? periodicInfo.periodicUnit : 'DAILY',
			editPeriodicInterval: periodicInfo.periodicInterval || 1,
		};
	}, [editMeeting]);
};
