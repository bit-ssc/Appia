import type { IRocketChatRecord } from './IRocketChatRecord';

export interface IAppiaData extends IRocketChatRecord {
	content: any;
	dataKey: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
}
