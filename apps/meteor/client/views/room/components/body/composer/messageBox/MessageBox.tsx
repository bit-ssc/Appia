/* eslint-disable complexity */
import type { IMessage, IRoom, ISubscription } from '@rocket.chat/core-typings';
import { Button, Icon } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { escapeRegExp } from '@rocket.chat/string-helpers';
import {
	MessageComposerAction,
	MessageComposerToolbarActions,
	MessageComposer,
	MessageComposerInput,
	MessageComposerToolbar,
	MessageComposerActionsDivider,
	MessageComposerToolbarSubmit,
} from '@rocket.chat/ui-composer';
import { useTranslation, useUserPreference, useLayout, useEndpoint } from '@rocket.chat/ui-contexts';
import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import type { ReactElement, FormEvent, KeyboardEventHandler, KeyboardEvent, Ref, ClipboardEventHandler } from 'react';
import React, { memo, useRef, useReducer, useCallback } from 'react';
import _ from 'underscore';
import { useSubscription } from 'use-subscription';

// import { EmojiPicker } from '../../../../../../../app/emoji/client';
import { appiaChannelMentions, appiaMentions } from '../../../../../../../app/ui-message/client/appia/appiaMentions';
import { createComposerAPI } from '../../../../../../../app/ui-message/client/messageBox/createComposerAPI';
import type { FormattingButton } from '../../../../../../../app/ui-message/client/messageBox/messageBoxFormatting';
import { formattingButtons } from '../../../../../../../app/ui-message/client/messageBox/messageBoxFormatting';
import ComposerBoxPopup from '../../../../../../../app/ui-message/client/popup/ComposerBoxPopup';
import ComposerBoxPopupPreview from '../../../../../../../app/ui-message/client/popup/components/composerBoxPopupPreview/ComposerBoxPopupPreview';
import { useComposerBoxPopup } from '../../../../../../../app/ui-message/client/popup/hooks/useComposerBoxPopup';
import { getImageExtensionFromMime } from '../../../../../../../lib/getImageExtensionFromMime';
import { useFormatDateAndTime } from '../../../../../../hooks/useFormatDateAndTime';
import { useReactiveValue } from '../../../../../../hooks/useReactiveValue';
import type { ComposerAPI } from '../../../../../../lib/chats/ChatAPI';
import { roomCoordinator } from '../../../../../../lib/rooms/roomCoordinator';
import { keyCodes } from '../../../../../../lib/utils/keyCodes';
import AudioMessageRecorder from '../../../../../composer/AudioMessageRecorder';
import VideoMessageRecorder from '../../../../../composer/VideoMessageRecorder';
import { useChat } from '../../../../contexts/ChatContext';
import { useComposerPopup } from '../../../../contexts/ComposerPopupContext';
import ComposerUserActionIndicator from '../ComposerUserActionIndicator';
import { useAutoGrow } from '../RoomComposer/hooks/useAutoGrow';
import { useMessageComposerMergedRefs } from '../hooks/useMessageComposerMergedRefs';
import ActionsToolbarDropdown from './MessageBoxActionsToolbar/ActionsToolbarDropdown';
import MessageBoxFormattingToolbar from './MessageBoxFormattingToolbar';
import MessageBoxReplies from './MessageBoxReplies';
import { useMessageBoxAutoFocus } from './hooks/useMessageBoxAutoFocus';

import { withDebouncing } from '/lib/utils/highOrderFunctions';

import { Meteor } from 'meteor/meteor';

import { useRoom } from '../../../../contexts/RoomContext';

import { useDraft } from '/client/views/root/contexts/DraftsProvider';

const reducer = (_: unknown, event: FormEvent<HTMLInputElement>): boolean => {
	const target = event.target as HTMLInputElement;

	return Boolean(target.value.trim());
};

const handleFormattingShortcut = (
	event: KeyboardEvent<HTMLTextAreaElement>,
	formattingButtons: FormattingButton[],
	composer: ComposerAPI,
) => {
	const isMacOS = navigator.platform.indexOf('Mac') !== -1;
	const isCmdOrCtrlPressed = (isMacOS && event.metaKey) || (!isMacOS && event.ctrlKey);

	if (!isCmdOrCtrlPressed) {
		return false;
	}

	const key = event.key.toLowerCase();

	const formatter = formattingButtons.find((formatter) => 'command' in formatter && formatter.command === key);

	if (!formatter || !('pattern' in formatter)) {
		return false;
	}

	composer.wrapSelection(formatter.pattern);
	return true;
};

const emptySubscribe = () => () => undefined;
const getEmptyFalse = () => false;
const a: any[] = [];
const getEmptyArray = () => a;

type MessageBoxProps = {
	rid: IRoom['_id'];
	tmid?: IMessage['_id'];
	readOnly: boolean;
	onSend?: (params: { value: string; tshow?: boolean }) => Promise<void>;
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

const MessageBox = ({
	rid,
	tmid,
	onSend,
	onJoin,
	onNavigateToNextMessage,
	onNavigateToPreviousMessage,
	onUploadFiles,
	onEscape,
	onTyping,
	readOnly,
	tshow,
	answering,
	bot,
}: MessageBoxProps): ReactElement => {
	const [typing, setTyping] = useReducer(reducer, false);

	const { isMobile } = useLayout();
	const sendOnEnterBehavior = useUserPreference<'normal' | 'alternative' | 'desktop'>('sendOnEnter') || isMobile;
	const sendOnEnter = sendOnEnterBehavior == null || sendOnEnterBehavior === 'normal' || (sendOnEnterBehavior === 'desktop' && !isMobile);

	const t = useTranslation();

	const chat = useChat();
	const room = useRoom();
	const draftContext = useDraft();

	const [messageApi, contextHolder] = message.useMessage();

	const sendFeedback = useEndpoint('POST', '/v1/feedback.save');

	if (!chat) {
		throw new Error('Chat context not found');
	}

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const messageComposerRef = useRef<HTMLElement>(null);
	const shadowRef = useRef(null);

	const storageID = `${rid}${tmid ? `-${tmid}` : ''}`;

	const callbackRef = useCallback(
		(node: HTMLTextAreaElement) => {
			if (node === null) {
				return;
			}
			chat.setComposerAPI(createComposerAPI(node, storageID));
		},
		[chat, storageID],
	);

	const autofocusRef = useMessageBoxAutoFocus();

	const handleSendMessage = useMutableCallback(() => {
		const value = chat?.composer?.text ?? '';
		chat?.composer?.clear();

		const mentions = {
			map: {},
			list: [],
		};

		appiaMentions.get(rid).forEach(({ n, u }) => {
			mentions.map[n] = u;
			mentions.list.push(n);
		});

		mentions.list = _.sortBy(mentions.list, (mention) => mention.length).map((mention) => escapeRegExp(mention));

		const message = mentions.list.length
			? value.replace(new RegExp(`[\s]?@(${mentions.list.join('|')})`, 'g'), (_, k) => ` @${mentions.map[k]}`)
			: value;

		// 替换消息中的频道fname为name
		const channelMentions = {
			map: {},
			list: [],
		};
		appiaChannelMentions.get(rid).forEach(({ n, f }) => {
			channelMentions.map[f] = n;
			channelMentions.list.push(f);
		});
		channelMentions.list = _.sortBy(channelMentions.list, (mention) => mention.length).map((mention) => escapeRegExp(mention));
		const text = channelMentions.list.length
			? message.replace(new RegExp(`#(${channelMentions.list.join('|')})`, 'g'), (_, k) => `#${channelMentions.map[k]}`)
			: message;

		onSend?.({
			value: text,
			tshow,
		});
	});

	const handler: KeyboardEventHandler<HTMLTextAreaElement> = useMutableCallback((event) => {
		const { which: keyCode } = event;

		const input = event.target as HTMLTextAreaElement;

		const isSubmitKey = keyCode === keyCodes.CARRIAGE_RETURN || keyCode === keyCodes.NEW_LINE;

		if (isSubmitKey) {
			const withModifier = event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
			const isSending = (sendOnEnter && !withModifier) || (!sendOnEnter && withModifier);

			event.preventDefault();
			if (!isSending) {
				chat?.composer?.insertNewLine();
				return false;
			}
			if (canSend && (typing || isEditing) && !answering) {
				handleSendMessage();
			}
			return false;
		}

		if (chat?.composer && handleFormattingShortcut(event, [...formattingButtons], chat?.composer)) {
			return;
		}

		if (event.shiftKey || event.ctrlKey || event.metaKey) {
			return;
		}

		switch (event.key) {
			case 'Escape': {
				if (chat?.currentEditing) {
					event.preventDefault();
					event.stopPropagation();

					chat?.currentEditing.reset().then((reset) => {
						if (!reset) {
							chat?.currentEditing?.cancel();
						}
					});

					return;
				}

				if (!input.value.trim()) onEscape?.();
				return;
			}
		}

		onTyping?.();
	});

	const isEditing = useSubscription({
		getCurrentValue: chat.composer?.editing.get ?? getEmptyFalse,
		subscribe: chat.composer?.editing.subscribe ?? emptySubscribe,
	});

	const isRecordingAudio = useSubscription({
		getCurrentValue: chat.composer?.recording.get ?? getEmptyFalse,
		subscribe: chat.composer?.recording.subscribe ?? emptySubscribe,
	});

	const isMicrophoneDenied = useSubscription({
		getCurrentValue: chat.composer?.isMicrophoneDenied.get ?? getEmptyFalse,
		subscribe: chat.composer?.isMicrophoneDenied.subscribe ?? emptySubscribe,
	});

	const isRecordingVideo = useSubscription({
		getCurrentValue: chat.composer?.recordingVideo.get ?? getEmptyFalse,
		subscribe: chat.composer?.recordingVideo.subscribe ?? emptySubscribe,
	});

	const formatters = useSubscription({
		getCurrentValue: chat.composer?.formatters.get ?? getEmptyArray,
		subscribe: chat.composer?.formatters.subscribe ?? emptySubscribe,
	});

	const isRecording = isRecordingAudio || isRecordingVideo;

	const { textAreaStyle, shadowStyle } = useAutoGrow(textareaRef, shadowRef, isRecordingAudio);

	const canSend = useReactiveValue(useCallback(() => roomCoordinator.verifyCanSendMessage(rid), [rid]));

	const format = useFormatDateAndTime();

	const joinMutation = useMutation(async () => onJoin?.());

	const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = useMutableCallback((event) => {
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
		}
	});

	const composerPopupConfig = useComposerPopup();

	const {
		popup,
		focused,
		items,
		ariaActiveDescendant,
		suspended,
		select,
		commandsRef,
		callbackRef: c,
	} = useComposerBoxPopup<{ _id: string; sort?: number }>({
		configurations: composerPopupConfig,
	});

	const mergedRefs = useMessageComposerMergedRefs(c, textareaRef, callbackRef, autofocusRef);

	const renderPopup = () => {
		// 私聊不显示弹窗
		if (room.t === 'd') {
			return null;
		}
		return (
			popup &&
			!popup.preview && (
				<ComposerBoxPopup select={select} items={items} focused={focused} title={popup.title} renderItem={popup.renderItem} />
			)
		);
	};

	const persist = withDebouncing({ wait: 300 })(() => {
		if (textareaRef.current?.value) {
			Meteor._localStorage.setItem(storageID, textareaRef.current.value);
			return;
		}

		Meteor._localStorage.removeItem(storageID);
		draftContext.updateFlag(new Date().toString());
	});

	const handleFeedback = useMutableCallback(() => {
		if (textareaRef.current?.value) {
			sendFeedback({
				user_info: {
					user_id: String(Meteor.userId()),
					user_name: Meteor.user()?.username || '',
				},
				content: {
					feedback: textareaRef.current?.value || '',
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
			chat?.composer?.clear();
		} else {
			messageApi.open({
				type: 'error',
				content: t('Feedback_Placeholder'),
			});
		}
	});

	return (
		<>
			{contextHolder}
			{chat?.composer?.quotedMessages && <MessageBoxReplies />}
			{renderPopup()}
			{popup?.preview && (
				<ComposerBoxPopupPreview
					select={select}
					items={items as any}
					focused={focused as any}
					renderItem={popup.renderItem}
					ref={commandsRef}
					rid={rid}
					tmid={tmid}
					suspended={suspended}
				/>
			)}

			{isRecordingVideo && <VideoMessageRecorder reference={messageComposerRef} rid={rid} tmid={tmid} />}
			<MessageComposer ref={messageComposerRef} variant={isEditing ? 'editing' : undefined}>
				{isRecordingAudio && <AudioMessageRecorder rid={rid} isMicrophoneDenied={isMicrophoneDenied} />}
				<MessageComposerInput
					ref={mergedRefs as unknown as Ref<HTMLInputElement>}
					aria-label={t('Message')}
					name='msg'
					disabled={isRecording || !canSend}
					onChange={(e) => {
						setTyping(e);
						persist();
					}}
					style={textAreaStyle}
					placeholder={t('Message')}
					onKeyDown={handler}
					onPaste={handlePaste}
					aria-activedescendant={ariaActiveDescendant}
				/>
				<div ref={shadowRef} style={shadowStyle} />

				<MessageComposerToolbar>
					<MessageComposerToolbarActions aria-label={t('Message_composer_toolbox_primary_actions')}>
						{chat.composer && formatters.length > 0 && (
							<MessageBoxFormattingToolbar composer={chat.composer} variant='large' items={formatters} disabled={isRecording || !canSend} />
						)}
						<MessageComposerActionsDivider />
						{bot ? null : (
							<ActionsToolbarDropdown
								variant='large'
								isRecording={isRecording}
								typing={typing}
								canSend={canSend}
								rid={rid}
								tmid={tmid}
								isMicrophoneDenied={isMicrophoneDenied}
							/>
						)}
					</MessageComposerToolbarActions>
					<MessageComposerToolbarSubmit>
						<MessageComposerAction
							small
							key='Feedback'
							data-id={'Feedback'}
							title={t('Feedback')}
							children={
								typing || isEditing ? (
									<svg width='36' height='32' viewBox='0 0 36 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
										<rect x='0.5' y='0.5' width='35' height='31' rx='7.5' stroke='#156FF5' />
										<path
											d='M21.9291 10.4621C21.9291 10.3638 21.8487 10.2835 21.7505 10.2835H13.1791C13.0809 10.2835 13.0005 10.3638 13.0005 10.4621V11.5335C13.0005 11.6317 13.0809 11.7121 13.1791 11.7121H21.7505C21.8487 11.7121 21.9291 11.6317 21.9291 11.5335V10.4621ZM21.7505 13.4978H13.1791C13.0809 13.4978 13.0005 13.5781 13.0005 13.6763V14.7478C13.0005 14.846 13.0809 14.9263 13.1791 14.9263H21.7505C21.8487 14.9263 21.9291 14.846 21.9291 14.7478V13.6763C21.9291 13.5781 21.8487 13.4978 21.7505 13.4978ZM17.2862 16.7121H13.1791C13.0809 16.7121 13.0005 16.7924 13.0005 16.8906V17.9621C13.0005 18.0603 13.0809 18.1406 13.1791 18.1406H17.2862C17.3845 18.1406 17.4648 18.0603 17.4648 17.9621V16.8906C17.4648 16.7924 17.3845 16.7121 17.2862 16.7121ZM16.2148 23.5871H11.2148V7.87277H23.7148V15.5513C23.7148 15.6496 23.7952 15.7299 23.8934 15.7299H25.1434C25.2416 15.7299 25.322 15.6496 25.322 15.5513V6.97991C25.322 6.58482 25.0028 6.26562 24.6077 6.26562H10.322C9.92686 6.26562 9.60767 6.58482 9.60767 6.97991V24.4799C9.60767 24.875 9.92686 25.1942 10.322 25.1942H16.2148C16.313 25.1942 16.3934 25.1138 16.3934 25.0156V23.7656C16.3934 23.6674 16.313 23.5871 16.2148 23.5871Z'
											fill='#156FF5'
										/>
										<path
											d='M26.1278 17.4256L26.1274 17.4269L23.5972 24.8541L23.597 24.8549C23.5667 24.942 23.5098 25.0173 23.4344 25.0703C23.3589 25.1232 23.2687 25.1511 23.1766 25.15C23.0844 25.1488 22.9949 25.1187 22.9208 25.0639C22.8467 25.009 22.7918 24.9323 22.7637 24.8445L22.7634 24.8436L21.6805 21.3846L18.1581 20.2913C18.1581 20.2913 18.158 20.2913 18.158 20.2913L18.1579 20.2912L26.1278 17.4256ZM26.1278 17.4256C26.1535 17.3479 26.157 17.2646 26.1377 17.1851C26.1185 17.1056 26.0774 17.033 26.019 16.9756C25.9607 16.9183 25.8874 16.8784 25.8076 16.8606C25.7277 16.8427 25.6445 16.8476 25.5673 16.8746L26.1278 17.4256ZM19.6859 19.8499L25.0069 17.9946L23.1995 23.3016L22.5295 21.1619L23.5544 20.1483L23.6612 20.0428L23.5556 19.9361L23.1532 19.5298L23.0477 19.4233L22.9411 19.5287L21.9169 20.5421L19.6859 19.8499Z'
											fill='#156FF5'
											stroke='#156FF5'
											stroke-width='0.3'
										/>
									</svg>
								) : (
									<svg width='15' height='15' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
										<g id='Solution'>
											<path
												id='Vector'
												d='M13.9291 4.46205C13.9291 4.36384 13.8487 4.28348 13.7505 4.28348H5.17908C5.08087 4.28348 5.00051 4.36384 5.00051 4.46205V5.53348C5.00051 5.6317 5.08087 5.71205 5.17908 5.71205H13.7505C13.8487 5.71205 13.9291 5.6317 13.9291 5.53348V4.46205ZM13.7505 7.49777H5.17908C5.08087 7.49777 5.00051 7.57813 5.00051 7.67634V8.74777C5.00051 8.84598 5.08087 8.92634 5.17908 8.92634H13.7505C13.8487 8.92634 13.9291 8.84598 13.9291 8.74777V7.67634C13.9291 7.57813 13.8487 7.49777 13.7505 7.49777ZM9.28622 10.7121H5.17908C5.08087 10.7121 5.00051 10.7924 5.00051 10.8906V11.9621C5.00051 12.0603 5.08087 12.1406 5.17908 12.1406H9.28622C9.38444 12.1406 9.4648 12.0603 9.4648 11.9621V10.8906C9.4648 10.7924 9.38444 10.7121 9.28622 10.7121ZM8.2148 17.5871H3.21479V1.87277H15.7148V9.55134C15.7148 9.64955 15.7952 9.72991 15.8934 9.72991H17.1434C17.2416 9.72991 17.3219 9.64955 17.3219 9.55134V0.979911C17.3219 0.584821 17.0027 0.265625 16.6077 0.265625H2.32194C1.92685 0.265625 1.60765 0.584821 1.60765 0.979911V18.4799C1.60765 18.875 1.92685 19.1942 2.32194 19.1942H8.2148C8.31301 19.1942 8.39337 19.1138 8.39337 19.0156V17.7656C8.39337 17.6674 8.31301 17.5871 8.2148 17.5871Z'
												fill='#CBCED1'
											/>
											<path
												id='Vector_2'
												d='M18.1278 11.4256L18.1274 11.4269L15.5972 18.8541L15.597 18.8549C15.5667 18.942 15.5098 19.0173 15.4344 19.0703C15.3589 19.1232 15.2687 19.1511 15.1766 19.15C15.0844 19.1488 14.9949 19.1187 14.9208 19.0639C14.8467 19.009 14.7918 18.9323 14.7637 18.8445L14.7634 18.8436L13.6805 15.3846L10.1581 14.2913C10.1581 14.2913 10.158 14.2913 10.158 14.2913L10.1579 14.2912L18.1278 11.4256ZM18.1278 11.4256C18.1535 11.3479 18.157 11.2646 18.1377 11.1851C18.1185 11.1056 18.0774 11.033 18.019 10.9756C17.9607 10.9183 17.8874 10.8784 17.8076 10.8606C17.7277 10.8427 17.6445 10.8476 17.5673 10.8746L18.1278 11.4256ZM11.6859 13.8499L17.0069 11.9946L15.1995 17.3016L14.5295 15.1619L15.5544 14.1483L15.6612 14.0428L15.5556 13.9361L15.1532 13.5298L15.0477 13.4233L14.9411 13.5287L13.9169 14.5421L11.6859 13.8499Z'
												fill='#CBCED1'
												stroke='#CBCED1'
												stroke-width='0.3'
											/>
										</g>
									</svg>
								)
							}
							disabled={!canSend || (!typing && !isEditing) || answering}
							info={typing || isEditing}
							onClick={handleFeedback}
							style={{ marginRight: '8px' }}
						/>
						{bot ? null : <MessageComposerActionsDivider />}
						<MessageComposerAction
							aria-label={t('Send')}
							icon='send'
							disabled={!canSend || (!typing && !isEditing) || answering}
							onClick={handleSendMessage}
							secondary={typing || isEditing}
							info={typing || isEditing}
							style={{ width: '40px', marginLeft: '8px', height: '24px', marginRight: '5px' }}
						/>
					</MessageComposerToolbarSubmit>
				</MessageComposerToolbar>

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
			</MessageComposer>
			<ComposerUserActionIndicator rid={rid} tmid={tmid} />
		</>
	);
};

export default memo(MessageBox);
