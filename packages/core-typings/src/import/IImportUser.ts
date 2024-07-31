export interface IImportUser {
	// #ToDo: Remove this _id, as it isn't part of the imported data
	_id?: string;

	username?: string;
	emails: Array<string>;
	importIds: Array<string>;
	name?: string;
	pinyinName?: string;
	employeeID?: string;
	telephoneNumber?: string;
	utcOffset?: number;
	avatarUrl?: string;
	deleted?: boolean;
	statusText?: string;
	roles?: Array<string>;
	type: 'user' | 'bot';
	bio?: string;
	updateFlag: number;
	adminDisplayName: string;
	itemType: string;
	employeeStatus: string;
	employeeType: string;
	jobName: string;
	workPlaceName: string;
	sexId: number;

	services?: Record<string, Record<string, any>>;
	customFields?: Record<string, any>;
}
