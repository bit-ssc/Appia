import Editor from '@appia/editor';
import type { IMessage, IRoom, ISubscription } from '@rocket.chat/core-typings';
import { css } from '@rocket.chat/css-in-js';
import { Box, Button, Icon } from '@rocket.chat/fuselage';
import { useBreakpoints, useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { MessageComposerAction, MessageComposerActionsDivider, MessageComposerToolbarSubmit } from '@rocket.chat/ui-composer';
import { useTranslation, useEndpoint, useUserPreference } from '@rocket.chat/ui-contexts';
import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { Meteor } from 'meteor/meteor';
import type { ReactElement, ClipboardEventHandler } from 'react';
import React, { memo, useRef, useReducer, useCallback, useEffect } from 'react';
import { useSubscription } from 'use-subscription';

import { appiaMentions } from '../../../../../../../app/ui-message/client/appia/appiaMentions';
import { createComposerAPI } from '../../../../../../../app/ui-message/client/messageBox/createComposerAPI';
import { getImageExtensionFromMime } from '../../../../../../../lib/getImageExtensionFromMime';
import { useFormatDateAndTime } from '../../../../../../hooks/useFormatDateAndTime';
import { useReactiveValue } from '../../../../../../hooks/useReactiveValue';
import { roomCoordinator } from '../../../../../../lib/rooms/roomCoordinator';
import { useDraft } from '../../../../../root/contexts/DraftsProvider';
import { useChat } from '../../../../contexts/ChatContext';
import { useRoom } from '../../../../contexts/RoomContext';
import FileUpload from './MessageBoxActionsToolbar/actions/FileUpload';
import CreateMeeting from './MessageBoxComposerActions/CreateMeeting';
import CreateMeetingSummary from './MessageBoxComposerActions/CreateMeetingSummary';
import FeedBack from './MessageBoxComposerActions/FeedBack';
import MessageBoxReplies from './MessageBoxReplies';
import MessageBoxEdit from './MessageBoxEdit';
import SendButton from './SendButton';
import { formatMentionsStr } from './helper';
import { useEditor } from './hooks/useEditor';
import { QuickReplies } from './MessageBoxComposerActions/QuickReplies';
interface IValue {
	md: string;
	html: string;
	json: unknown;
}

const reducer = (_: unknown, value?: IValue): boolean => Boolean(value?.md.trim());

const emptySubscribe = () => () => undefined;
const getEmptyFalse = () => false;

type MessageBoxProps = {
	rid: IRoom['_id'];
	tmid?: IMessage['_id'];
	readOnly: boolean;
	onSend?: (params: { value: string; tshow?: boolean, md?: unknown }) => Promise<void>;
	onJoin?: () => Promise<void>;
	onResize?: () => void;
	onTyping?: () => void;
	onEscape?: () => void;
	onNavigateToPreviousMessage?: () => void;
	onNavigateToNextMessage?: () => void;
	onUploadFiles?: (files: readonly File[]) => void;
	tshow?: IMessage['tshow'];
	subscription?: ISubscription;
	showFormattingTips: boolean;
	isEmbedded?: boolean;
	answering?: boolean;
	bot?: boolean;
};

const editorStyle = css`
	.appia-editor-container {
		// border: 0;

		// border-top: 1px solid #e5e6eb;
		// border-right: 1px solid #e5e6eb;
		// border-bottom: 1px solid #e5e6eb;

		border-radius: 0;
		border-bottom-right-radius: 8px;
	}

	.appia-editor-container:focus-within {
		// box-shadow: none;
	}

	.appia-editor-toolbar {
		padding-top: 0;
	}
`;

const MessageBox = ({ rid, tmid, onSend, onJoin, onUploadFiles, onTyping, tshow, answering, onResize }: MessageBoxProps): ReactElement => {
	const [typing, setTyping] = useReducer(reducer, false);

	const t = useTranslation();

	const chat = useChat();
	const room = useRoom();
	const draftContext = useDraft();

	const [messageApi, contextHolder] = message.useMessage();

	const sendFeedback = useEndpoint('POST', '/v1/feedback.save');

	if (!chat) {
		throw new Error('Chat context not found');
	}

	const contentRef = useRef<IValue | null>(null);
	const editorRef = useRef<{ clear: () => void; focus: () => void }>();
	const wrapperRef = useRef<HTMLDivElement>();
	const breakpoints = useBreakpoints(); // ["xs", "sm", "md", "lg", "xl", "xxl"]

	const storageID = `${rid}${tmid ? `-${tmid}` : ''}`;

	useEffect(() => {
		editorRef.current?.clear();
		chat.setComposerAPI(createComposerAPI(storageID, editorRef));
	}, [chat, storageID]);

	const clear = () => {
		appiaMentions.reset(rid);
		chat.composer?.clear();
		persist();
	};

	useEffect(() => {
		const observer = new ResizeObserver(() => {
			onResize?.();
		});

		observer.observe(wrapperRef.current);

		return () => {
			observer.disconnect();
		};
	}, []);

	const handleSendMessage = useMutableCallback(() => {
		const value = contentRef.current?.md ?? '';

		if (!value.trim()) {
			return;
		}
		const text = formatMentionsStr(contentRef.current) as string;

		console.log(contentRef.current?.json)
		onSend?.({
			value: text,
			md: contentRef.current?.json,
			tshow,
		});

		clear();
	});

	const isEditing = useSubscription({
		getCurrentValue: chat.composer?.editing.get ?? getEmptyFalse,
		subscribe: chat.composer?.editing.subscribe ?? emptySubscribe,
	});

	const canSend = useReactiveValue(useCallback(() => roomCoordinator.verifyCanSendMessage(rid), [rid]));
	const sendOnEnterBehavior = useUserPreference<'normal' | 'alternative'>('sendOnEnter', 'alternative');
	const keys =
		sendOnEnterBehavior === 'normal'
			? {
					key1: 'Ctrl + Enter',
					key2: 'Enter',
			  }
			: {
					key1: 'Enter',
					key2: 'Ctrl + Enter',
			  };

	const format = useFormatDateAndTime();
	const editorProps = useEditor(handleSendMessage, room, { editorRef, wrapperRef });

	const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = (event) => {
		const { clipboardData } = event;

		if (!clipboardData) {
			return;
		}

		const items = Array.from(clipboardData.items);

		if (items.some(({ kind, type }) => kind === 'string' && type === 'text/plain')) {
			return;
		}

		const files = items
			.filter((item) => item.kind === 'file' && item.type.indexOf('image/') !== -1)
			.map((item) => {
				const fileItem = item.getAsFile();

				if (!fileItem) {
					return;
				}

				const imageExtension = fileItem ? getImageExtensionFromMime(fileItem.type) : undefined;

				const extension = imageExtension ? `.${imageExtension}` : '';

				Object.defineProperty(fileItem, 'name', {
					writable: true,
					value: `Clipboard - ${format(new Date())}${extension}`,
				});
				return fileItem;
			})
			.filter((file): file is File => !!file);

		if (files.length) {
			event.preventDefault();
			onUploadFiles?.(files);
			persist();
			chat.composer?.cacheText(contentRef.current?.html);
		}
	};

	const joinMutation = useMutation(async () => onJoin?.());

	const persist = () => {
		if (contentRef.current?.md.trim()) {
			Meteor._localStorage.setItem(storageID, contentRef.current.html);
			return;
		}

		Meteor._localStorage.removeItem(storageID);
		draftContext.updateFlag(new Date().toString());
	};

	const handleFeedback = useMutableCallback(() => {
		if (contentRef.current?.md.trim()) {
			sendFeedback({
				user_info: {
					user_id: String(Meteor.userId()),
					user_name: Meteor.user()?.username || '',
				},
				content: {
					feedback: contentRef.current?.md || '',
					platform: `web`,
					pageParams: { rid },
					brand: window.navigator.platform.toLowerCase(),
					osVersion: window.navigator.userAgent,
				},
			}).then((res) => {
				console.info('res =', res);
				messageApi.open({
					type: 'success',
					content: t('Save_Successfully'),
				});
			});
			clear();
		} else {
			messageApi.open({
				type: 'error',
				content: t('Feedback_Placeholder'),
			});
		}
	});

	const toolbarExtraRender = useCallback(() => {
		return (
			<MessageComposerToolbarSubmit>
				<MessageComposerAction
					key='Quick_Replies'
					data-id={'Quick_Replies'}
					style={{ width: '30px', height: '24px'}}
					children={<QuickReplies refs={{ editorRef, wrapperRef }} room={room} />}
				/>
				<MessageComposerActionsDivider height='16px' />
				<MessageComposerAction
					key='From_Local_Files'
					data-id={'From_Local_Files'}
					title={t('From_Local_Files')}
					style={{ width: '30px', height: '24px'}}
					children={<FileUpload room={room} />}
				/>
				<MessageComposerActionsDivider height='16px' />
				<MessageComposerAction
					key='Book_Meeting'
					data-id={'Book_Meeting'}
					title={t('Book_Meeting')}
					style={{ width: '30px', height: '24px'}}
					children={<CreateMeeting />}
				/>
				<SendButton
					aria-label={t('Send')}
					disabled={!canSend || (!typing && !isEditing) || answering}
					onClick={handleSendMessage}
					secondary={typing || isEditing}
					info={typing || isEditing}
				/>
			</MessageComposerToolbarSubmit>
		);
	}, [breakpoints, canSend, handleFeedback, handleSendMessage, isEditing, room, t, typing, answering]);

	useEffect(() => {
		editorRef.current?.setContent(chat.composer?.text);
	}, [chat.composer?.text]);

	return (
		<>
			{contextHolder}
			{chat.composer?.quotedMessages && <MessageBoxReplies />}
			{chat.composer?.editedMessages && <MessageBoxEdit />}

			<Box onPaste={handlePaste} className={editorStyle} ref={wrapperRef}>
				{chat.composer ? (
					<Editor
						{...editorProps}
						ref={editorRef}
						className='appia-editor-container'
						toolbarClassName='appia-editor-toolbar'
						style={{ minHeight: '30px', paddingBottom: '2px' }}
						autoFocus={false}
						placeholder={<div style={{ color: 'rgba(158, 162, 168, 0.5)' }}>{t('Type_your_message_here', keys)}</div>}
						onChange={(value: IValue) => {
							const flag = contentRef.current?.html != value.html;
							contentRef.current = {
								md: value.md,
								json: value.json,
								html: value.html,
							};

							setTyping(value);
							onTyping?.();
							if (flag) {
								persist();
							}
						}}
						toolbarExtraRender={toolbarExtraRender}
					/>
				) : null}
			</Box>

			{!canSend && (
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						bottom: 0,
						right: 0,
						background: 'rgba(255, 255, 255, 0.8)',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<div style={{ lineHeight: '22px', marginBottom: '8px' }}>{t('Outside_chal_cant_msg')}</div>
					<Button small primary onClick={onJoin} disabled={joinMutation.isLoading}>
						<Icon name='plus' size='x16' />
						{t('Join')}
					</Button>
				</div>
			)}
		</>
	);
};
export default memo(MessageBox);
