import { Root } from '@rocket.chat/message-parser';

export interface IAppiaMatrixMessageRecallParams {
	eventId: string;
	ts: number;
	operator: string;
}

export interface IAppiaMatrixFile {
	_id: string;
	name: string;
	type: string;
	description: string;
}

export interface IAppiaMatrixSyncMessageParams {
	mri: string;
	eventId: string;
	replyId: string;
	senderUsername: string;
	msg: string;
	formattedMsg: string;
	homeServerDomain: string;
	ts: number;
	md?: Root;
	file: IAppiaMatrixFile;
}

export interface IAppiaMatrixSyncMessageDeleteParams {
	eventId: string;
	operator: string;
}

export interface IAppiaMatrixSyncMessageReadParams {
	eventId: string;
	mri: string;
	externalUsername: string;
}

export type AppiaMatrixMessageEndpoints = {
	'/appiaMatrix/sync.message.recall': {
		POST: (params: IAppiaMatrixMessageRecallParams) => void;
	};
	'/appiaMatrix/sync.message.send': {
		POST: (params: IAppiaMatrixSyncMessageParams) => void;
	};
	'/appiaMatrix/sendMessage': {
		POST: (params: IAppiaMatrixSyncMessageParams) => void;
	};
	'/appiaMatrix/sync.message.delete': {
		POST: (params: IAppiaMatrixSyncMessageDeleteParams) => void;
	};
	'/appiaMatrix/deleteMessage': {
		POST: (params: IAppiaMatrixSyncMessageDeleteParams) => void;
	};
};
