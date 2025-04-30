import type { IRocketChatRecord } from './IRocketChatRecord';

export interface IAppiaLog extends IRocketChatRecord {
	content: string;
	level: string;
	module: string | null;
	name: string;
	tag: string;
	platform: string;
	user_info: string;
	createdAt: Date;
	updatedAt: Date;
}
