export interface ILivechatDepartment {
	_id: string;
	name: string;
	enabled: boolean;
	description?: string;
	showOnRegistration: boolean;
	showOnOfflineForm: boolean;
	requestTagBeforeClosingChat?: boolean;
	email: string;
	chatClosingTags?: string[];
	offlineMessageChannelName: string;
	numAgents: number;
	_updatedAt?: Date;
	businessHourId?: string;
	fallbackForwardDepartment?: string;
	archived?: boolean;
	departmentsAllowedToForward?: string[];
	ancestors?: string[];
	// extra optional fields
	[k: string]: any;
}
