import type { IRocketChatRecord } from './IRocketChatRecord';

export interface IAppiaRecord extends IRocketChatRecord {
	content: string;
	module: string | null;
	name: string;
	tag: string;
	user_info: string;
	createdAt: Date;
	updatedAt: Date;
}
