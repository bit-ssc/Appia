import type { IMessage, IOmnichannelRoom, IOmnichannelRoomClosingInfo, ISetting, IVisitor } from '@rocket.chat/core-typings';
import type { FindCursor, UpdateResult, AggregationCursor, Document, FindOptions, DeleteResult } from 'mongodb';

import type { FindPaginated } from '..';
import type { IBaseModel } from './IBaseModel';

type Period = {
	start: any;
	end: any;
};

type WithDepartment = {
	departmentId: any;
};

type WithOnlyCount = {
	onlyCount?: boolean;
};

type WithOptions = {
	options?: any;
};

export interface ILivechatRoomsModel extends IBaseModel<IOmnichannelRoom> {
	getQueueMetrics(params: { departmentId: any; agentId: any; includeOfflineAgents: any; options?: any }): any;

	findAllNumberOfAbandonedRooms(params: Period & WithDepartment & WithOnlyCount & WithOptions): Promise<any>;

	findPercentageOfAbandonedRooms(params: Period & WithDepartment & WithOnlyCount & WithOptions): Promise<any>;

	findAllAverageOfChatDurationTime(params: Period & WithDepartment & WithOnlyCount & WithOptions): any;

	findAllAverageWaitingTime(params: Period & WithDepartment & WithOnlyCount & WithOptions): any;

	findAllRooms(params: Period & WithDepartment & WithOnlyCount & WithOptions & { answered: any }): any;

	findAllServiceTime(params: Period & WithDepartment & WithOnlyCount & WithOptions): any;

	findAllNumberOfTransferredRooms(params: Period & WithDepartment & WithOptions): any;

	countAllOpenChatsBetweenDate(params: Period & WithDepartment): any;

	countAllClosedChatsBetweenDate(params: Period & WithDepartment): any;

	countAllQueuedChatsBetweenDate(params: Period & WithDepartment): any;

	countAllOpenChatsByAgentBetweenDate(params: Period & WithDepartment): any;

	countAllOnHoldChatsByAgentBetweenDate(params: Period & WithDepartment): any;

	countAllClosedChatsByAgentBetweenDate(params: Period & WithDepartment): any;

	countAllOpenChatsByDepartmentBetweenDate(params: Period & WithDepartment): any;

	countAllClosedChatsByDepartmentBetweenDate(params: Period & WithDepartment): any;

	calculateResponseTimingsBetweenDates(params: Period & WithDepartment): any;

	calculateReactionTimingsBetweenDates(params: Period & WithDepartment): any;

	calculateDurationTimingsBetweenDates(params: Period & WithDepartment): any;

	findAllAverageOfServiceTime(params: Period & WithDepartment & WithOnlyCount & WithOptions): any;

	findByVisitorId(visitorId: any, options: any): any;

	findPaginatedByVisitorId(visitorId: any, options: any): any;

	findRoomsByVisitorIdAndMessageWithCriteria(params: {
		visitorId: any;
		searchText: any;
		open: any;
		served: any;
		onlyCount?: boolean;
		options?: any;
		source?: string;
	}): any;

	findRoomsWithCriteria(params: {
		agents: any;
		roomName: any;
		departmentId: any;
		open: any;
		served?: any;
		createdAt: any;
		closedAt: any;
		tags: any;
		customFields: any;
		visitorId?: any;
		roomIds?: any;
		onhold: any;
		options?: any;
	}): FindPaginated<FindCursor<IOmnichannelRoom>>;

	getOnHoldConversationsBetweenDate(from: any, to: any, departmentId: any): any;

	findAllServiceTimeByAgent(params: Period & WithOptions & WithOnlyCount): any;

	findAllAverageServiceTimeByAgents(params: Period & WithOptions & WithOnlyCount): any;

	setDepartmentByRoomId(roomId: any, departmentId: any): any;

	findOpen(): FindCursor<IOmnichannelRoom>;

	setAutoTransferOngoingById(roomId: string): Promise<UpdateResult>;

	unsetAutoTransferOngoingById(roomId: string): Promise<UpdateResult>;

	setAutoTransferredAtById(roomId: string): Promise<UpdateResult>;

	findAvailableSources(): AggregationCursor<Document>;

	setTranscriptRequestedPdfById(rid: string): Promise<UpdateResult>;
	unsetTranscriptRequestedPdfById(rid: string): Promise<UpdateResult>;
	setPdfTranscriptFileIdById(rid: string, fileId: string): Promise<UpdateResult>;

	setEmailTranscriptRequestedByRoomId(
		rid: string,
		transcriptInfo: NonNullable<IOmnichannelRoom['transcriptRequest']>,
	): Promise<UpdateResult>;
	unsetEmailTranscriptRequestedByRoomId(rid: string): Promise<UpdateResult>;

	closeRoomById(roomId: string, closeInfo: IOmnichannelRoomClosingInfo): Promise<UpdateResult>;

	bulkRemoveDepartmentAndUnitsFromRooms(departmentId: string): Promise<Document | UpdateResult>;
	findOneByIdOrName(_idOrName: string, options?: FindOptions<IOmnichannelRoom>): Promise<IOmnichannelRoom | null>;
	updateSurveyFeedbackById(_id: string, surveyFeedback: unknown): Promise<UpdateResult>;
	updateDataByToken(token: string, key: string, value: string, overwrite?: boolean): Promise<UpdateResult | Document | true>;
	saveRoomById(
		data: { _id: string; topic: string; tags: string[]; livechatData: unknown } & Record<string, unknown>,
	): Promise<UpdateResult | undefined>;
	findById(_id: string, fields?: FindOptions<IOmnichannelRoom>['projection']): FindCursor<IOmnichannelRoom>;
	findByIds(ids: string[], fields?: FindOptions<IOmnichannelRoom>['projection']): FindCursor<IOmnichannelRoom>;
	findOneByIdAndVisitorToken(
		_id: string,
		visitorToken: string,
		fields?: FindOptions<IOmnichannelRoom>['projection'],
	): Promise<IOmnichannelRoom | null>;
	findOneByVisitorTokenAndEmailThread(
		visitorToken: string,
		emailThread: string[],
		options?: FindOptions<IOmnichannelRoom>,
	): Promise<IOmnichannelRoom | null>;
	findOneByVisitorTokenAndEmailThreadAndDepartment(
		visitorToken: string,
		emailThread: string[],
		departmentId?: string,
		options?: FindOptions<IOmnichannelRoom>,
	): Promise<IOmnichannelRoom | null>;
	findOneOpenByVisitorTokenAndEmailThread(
		visitorToken: string,
		emailThread: string,
		options: FindOptions<IOmnichannelRoom>,
	): Promise<IOmnichannelRoom | null>;
	updateEmailThreadByRoomId(roomId: string, threadIds: string[] | string): Promise<UpdateResult>;
	findOneLastServedAndClosedByVisitorToken(visitorToken: string, options?: FindOptions<IOmnichannelRoom>): Promise<IOmnichannelRoom | null>;
	findOneByVisitorToken(visitorToken: string, fields?: FindOptions<IOmnichannelRoom>['projection']): Promise<IOmnichannelRoom | null>;
	updateRoomCount(): Promise<ISetting | null>;
	findOpenByVisitorToken(visitorToken: string, options?: FindOptions<IOmnichannelRoom>): FindCursor<IOmnichannelRoom>;
	findOneOpenByVisitorToken(visitorToken: string, options?: FindOptions<IOmnichannelRoom>): Promise<IOmnichannelRoom | null>;
	findOneOpenByVisitorTokenAndDepartmentIdAndSource(
		visitorToken: string,
		departmentId: string,
		source?: string,
		options?: FindOptions<IOmnichannelRoom>,
	): Promise<IOmnichannelRoom | null>;
	findOpenByVisitorTokenAndDepartmentId(
		visitorToken: string,
		departmentId: string,
		options?: FindOptions<IOmnichannelRoom>,
	): FindCursor<IOmnichannelRoom>;
	findByVisitorToken(visitorToken: string): FindCursor<IOmnichannelRoom>;
	findByVisitorIdAndAgentId(visitorId?: string, agentId?: string, options?: FindOptions<IOmnichannelRoom>): FindCursor<IOmnichannelRoom>;
	findOneOpenByRoomIdAndVisitorToken(
		roomId: string,
		visitorToken: string,
		options?: FindOptions<IOmnichannelRoom>,
	): Promise<IOmnichannelRoom | null>;
	findClosedRooms(departmentIds?: string[], options?: FindOptions<IOmnichannelRoom>): FindCursor<IOmnichannelRoom>;
	setResponseByRoomId(roomId: string, response: { user: { _id: string; username: string } }): Promise<UpdateResult>;
	setNotResponseByRoomId(roomId: string): Promise<UpdateResult>;
	setAgentLastMessageTs(roomId: string): Promise<UpdateResult>;
	saveAnalyticsDataByRoomId(
		room: IOmnichannelRoom,
		message: IMessage,
		analyticsData?: Record<string, string | number | Date>,
	): Promise<UpdateResult>;
	getTotalConversationsBetweenDate(t: string, date: string, data?: { departmentId: string }): Promise<number>;
	getAnalyticsMetricsBetweenDate(
		t: string,
		date: string,
		data?: { departmentId: string },
	): FindCursor<Pick<IOmnichannelRoom, 'ts' | 'departmentId' | 'open' | 'servedBy' | 'metrics' | 'msgs'>>;
	getAnalyticsMetricsBetweenDateWithMessages(
		t: string,
		date: string,
		data?: { departmentId: string },
		extraQuery?: Document,
	): AggregationCursor<Pick<IOmnichannelRoom, '_id' | 'ts' | 'departmentId' | 'open' | 'servedBy' | 'metrics' | 'msgs'>>;
	getAnalyticsBetweenDate(
		date: string,
		data?: { departmentId: string },
	): AggregationCursor<Pick<IOmnichannelRoom, 'ts' | 'departmentId' | 'open' | 'servedBy' | 'metrics' | 'msgs' | 'onHold'>>;
	findOpenByAgent(userId: string): FindCursor<IOmnichannelRoom>;
	changeAgentByRoomId(roomId: string, newAgent: { agentId: string; username: string }): Promise<UpdateResult>;
	changeDepartmentIdByRoomId(roomId: string, departmentId: string): Promise<UpdateResult>;
	saveCRMDataByRoomId(roomId: string, crmData: unknown): Promise<UpdateResult>;
	updateVisitorStatus(token: string, status: IVisitor['status']): Promise<UpdateResult>;
	removeAgentByRoomId(roomId: string): Promise<UpdateResult>;
	removeByVisitorToken(token: string): Promise<DeleteResult>;
	removeById(_id: string): Promise<DeleteResult>;
	setVisitorLastMessageTimestampByRoomId(roomId: string, lastMessageTs: Date): Promise<UpdateResult>;
	setVisitorInactivityInSecondsById(roomId: string, visitorInactivity: any): Promise<UpdateResult>;
	changeVisitorByRoomId(roomId: string, visitor: { _id: string; username: string; token: string }): Promise<UpdateResult>;
	unarchiveOneById(roomId: string): Promise<UpdateResult>;
}
