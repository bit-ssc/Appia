import type { IRocketChatRecord } from './IRocketChatRecord';

interface IUser {
	username: string;
	name: string;
}
export interface IUploadFile {
	name: string;
	id: number;
	path: string;
	ossKey: string;
	version?: string;
	summary?: string;
	user?: IUser;
	_createdAt?: Date;
}

export interface IAppiaCopNode extends IRocketChatRecord {
	name: string; // 文档名称
	rid: string;   // 关联的频道id
	code: string;// 文档编号
	parentId: string; // 父节点id
	parentCode: string; // 直属上级文件编号
	address: string; // 文档地址
	visible: number; // 0 : 频道内可见 1: 全员可见
	owner: IUser;
	uploadFile: IUploadFile;
	uploadFiles: IUploadFile[];
	_createdAt?: Date;
	_updatedAt: Date;
}
