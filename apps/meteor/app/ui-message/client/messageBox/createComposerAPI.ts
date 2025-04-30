import { Meteor } from 'meteor/meteor';
import type { IMessage } from '@rocket.chat/core-typings';
import { Emitter } from '@rocket.chat/emitter';
import $ from 'jquery';

// import { withDebouncing } from '../../../../lib/utils/highOrderFunctions';
import type { ComposerAPI } from '../../../../client/lib/chats/ChatAPI';
import type { FormattingButton } from './messageBoxFormatting';
import { formattingButtons } from './messageBoxFormatting';

const cache = {
	text: '',
};

export const covertStr = (str?: string): string => {
	let div: null | HTMLDivElement = document.createElement('div');
	div.innerHTML = (str || '').replace(/\r\n|\r|\n/g, '<br />');
	div.querySelectorAll('.appia-order-list-item, .appia-unordered-list-item').forEach((span) => {
		const parent = span.parentElement;

		if (parent) {
			parent.removeChild(span);
		}
	});

	const html = div.innerHTML;

	div = null;

	return html;
};

export const createComposerAPI = (storageID: string, ref): Partial<ComposerAPI> => {
	const emitter = new Emitter<{
		quotedMessagesUpdate: void;
		editedMessagesUpdate: void;
		editing: void;
		recording: void;
		recordingVideo: void;
		formatting: void;
		mircophoneDenied: void;
	}>();

	let _quotedMessages: IMessage[] = [];
	let _editedMessages: IMessage[] = [];

	const notifyQuotedMessagesUpdate = (): void => {
		emitter.emit('quotedMessagesUpdate');
	};

	const notifyEditedMessagesUpdate = (): void => {
		emitter.emit('editedMessagesUpdate');
	};

	const setText = (text: string): void => {
		const html = covertStr(text);
		cache.text = html;
		ref.current?.setContent(html);
	};
	const cacheText = (text: string): void => {
		cache.text = text;
	};

	const clear = (): void => {
		cache.text = '';
		ref.current?.clear();
		Meteor._localStorage.removeItem(storageID);
		focus();
	};

	const focus = (): void => {
		ref.current?.focus();
	};

	const editMessage = async (message: IMessage): Promise<void> => {
		_editedMessages = [message];
		notifyEditedMessagesUpdate();
		focus();
	};

	const dismissEditedMessage = async (mid: IMessage['_id']): Promise<void> => {
		_editedMessages = _editedMessages.filter((message) => message._id !== mid);
		notifyEditedMessagesUpdate();
	};

	const dismissAllEditedMessages = async (): Promise<void> => {
		_editedMessages = [];
		notifyEditedMessagesUpdate();
	};

	const editedMessages = {
		get: () => _editedMessages,
		subscribe: (callback: () => void) => emitter.on('editedMessagesUpdate', callback),
	};

	const quoteMessage = async (message: IMessage): Promise<void> => {
		_quotedMessages = [message];
		notifyQuotedMessagesUpdate();
		focus();
	};

	const dismissQuotedMessage = async (mid: IMessage['_id']): Promise<void> => {
		_quotedMessages = _quotedMessages.filter((message) => message._id !== mid);
		notifyQuotedMessagesUpdate();
	};

	const dismissAllQuotedMessages = async (): Promise<void> => {
		_quotedMessages = [];
		notifyQuotedMessagesUpdate();
	};

	const quotedMessages = {
		get: () => _quotedMessages,
		subscribe: (callback: () => void) => emitter.on('quotedMessagesUpdate', callback),
	};

	const [editing, setEditing] = (() => {
		let editing = false;

		return [
			{
				get: () => editing,
				subscribe: (callback: () => void) => emitter.on('editing', callback),
			},
			(value: boolean) => {
				editing = value;
				emitter.emit('editing');
			},
		];
	})();

	const [recording, setRecordingMode] = (() => {
		let recording = false;

		return [
			{
				get: () => recording,
				subscribe: (callback: () => void) => emitter.on('recording', callback),
			},
			(value: boolean) => {
				recording = value;
				emitter.emit('recording');
			},
		];
	})();

	const [recordingVideo, setRecordingVideo] = (() => {
		let recordingVideo = false;

		return [
			{
				get: () => recordingVideo,
				subscribe: (callback: () => void) => emitter.on('recordingVideo', callback),
			},
			(value: boolean) => {
				recordingVideo = value;
				emitter.emit('recordingVideo');
			},
		];
	})();

	const [isMicrophoneDenied, setIsMicrophoneDenied] = (() => {
		let isMicrophoneDenied = false;

		return [
			{
				get: () => isMicrophoneDenied,
				subscribe: (callback: () => void) => emitter.on('mircophoneDenied', callback),
			},
			(value: boolean) => {
				isMicrophoneDenied = value;
				emitter.emit('mircophoneDenied');
			},
		];
	})();

	const setEditingMode = (editing: boolean): void => {
		setEditing(editing);
	};

	const [formatters, stopFormatterTracker] = (() => {
		let actions: FormattingButton[] = [];

		const c = Tracker.autorun(() => {
			actions = formattingButtons.filter(({ condition }) => !condition || condition());
			emitter.emit('formatting');
		});

		return [
			{
				get: () => actions,
				subscribe: (callback: () => void) => emitter.on('formatting', callback),
			},
			c,
		];
	})();

	const release = (): void => {
		stopFormatterTracker.stop();
	};

	setText(Meteor._localStorage.getItem(storageID) ?? '');

	return {
		cacheText,
		blur: () => ref.current?.blur(),

		release,
		get text(): string {
			return cache.text;
		},
		get storageID(): string {
			return storageID;
		},

		editing,
		setEditingMode,
		recording,
		setRecordingMode,
		recordingVideo,
		setRecordingVideo,
		setText,
		clear,
		focus,
		quoteMessage,
		dismissQuotedMessage,
		dismissAllQuotedMessages,
		quotedMessages,
		editMessage,
		dismissEditedMessage,
		dismissAllEditedMessages,
		editedMessages,
		formatters,
		isMicrophoneDenied,
		setIsMicrophoneDenied,
	};
};
