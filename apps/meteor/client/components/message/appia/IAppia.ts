import type { IMessage } from '@rocket.chat/core-typings';

export interface IAppiaContentProps {
	msg: IMessage;
	user: any;
	room: any;
	settings: any;
	subscription: any;
}

export interface IForwardMsgHistoryProps {
	title: string;
	messages: any;
	user: any;
	room: any;
	settings: any;
	subscription: any;
	onClose: () => void;
}

export interface IMsgTag {
	text: string;
	color?: string;
	borderColor?: string;
	backgroundColor?: string;
}

export interface IMsgExtraValue {
	text: string;
	type?: string; // RoomView, WebView
	params?: string; // RoomView: {t, rid}, WebView: {url: string, appUrl: string, webUrl: string, needAuth: boolean}
}

export interface IMsgTextListItem {
	label: string;
	value: string;
	tags?: IMsgTag[];
	extraValue?: IMsgExtraValue[];
}

export interface IApprovalBtn {
	name: string;
	key?: string;
	bold?: boolean;
	type?: 'request' | 'open' | 'copy';
	needAuth?: boolean;
}

export interface IShareDynamic {
	cover: string;
	title: string;
	description: string;
	type: number;
	value: unknown;
}

export interface IMsgData {
	source?: string;
	tag?: string;
	title: string;
	textList: IMsgTextListItem[];
	linkInfo: {
		name: string;
		url: string;
		appUrl?: string;
		title?: string;
		needAuth?: boolean;
	};
	btnList?: IApprovalBtn[];
}

export interface IMentionType {
	type?: number;
	source?: string;
	content: string;
	buttonText: string;
	name: string;
	roomName: string;
	askContent?: string;
}

export interface IUdeskMsg {
	assign_type: string; // urobot
	customer_token: string;
	messages: {
		ansType: number;
		sessionId: number;
		logId: number;
		aid: unknown;
		msgType: string; // plain
		ansContent: string;
		suggestQuestionList: unknown[];
		hitQuestion: unknown;
	};
}

export interface ILeXiang {
	url: string;
	title: string;
	content: string;
	imageUrl: string;
}
