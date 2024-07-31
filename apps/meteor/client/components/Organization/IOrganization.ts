import type { IUserSummary, IDepartment } from '@rocket.chat/core-typings';
import type { CSSProperties } from 'react';

export interface IOnCheckArgs {
	user?: IUserSummary;
	department?: IDepartment;
	selectedUsers?: IUserSummary[];
	selectedDepartments?: IDepartment[];
}

export interface IOrgPros {
	style?: CSSProperties;
	hasCheckbox?: boolean;
	defaultSelected: IUserSummary[];
	disabledUsers?: string[];
	onChecked?: (checked: boolean, users: IUserSummary[]) => void;
}

export interface IContactItemPros extends IOrgPros {
	key: string;
	deep?: number;
	department: IDepartment;
}
