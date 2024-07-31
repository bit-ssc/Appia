/* eslint-disable complexity */
import type { IMessage, IRoom, ISubscription } from '@rocket.chat/core-typings';
import { Button, Tag, Box, Icon } from '@rocket.chat/fuselage';
// import { useContentBoxSize, useMutableCallback } from '@rocket.chat/fuselage-hooks';
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
import { useTranslation, useUserPreference, useLayout } from '@rocket.chat/ui-contexts';
import { useMutation } from '@tanstack/react-query';
// import type { MouseEventHandler, ReactElement, FormEvent, KeyboardEventHandler, KeyboardEvent, Ref, ClipboardEventHandler } from 'react';
import type { ReactElement, FormEvent, KeyboardEventHandler, KeyboardEvent, Ref, ClipboardEventHandler } from 'react';
import React, { memo, useRef, useReducer, useCallback } from 'react';
import _ from 'underscore';
import { useSubscription } from 'use-subscription';

// import { EmojiPicker } from '../../../../../../../app/emoji/client';
import MessageBoxActionsToolbar from './MessageBoxActionsToolbar';
import MessageBoxFormattingToolbar from './MessageBoxFormattingToolbar';
import MessageBoxReplies from './MessageBoxReplies';
import { useMessageBoxAutoFocus } from './hooks/useMessageBoxAutoFocus';
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
}: MessageBoxProps): ReactElement => {
	const [typing, setTyping] = useReducer(reducer, false);

	const { isMobile } = useLayout();
	const sendOnEnterBehavior = useUserPreference<'normal' | 'alternative' | 'desktop'>('sendOnEnter') || isMobile;
	const sendOnEnter = sendOnEnterBehavior == null || sendOnEnterBehavior === 'normal' || (sendOnEnterBehavior === 'desktop' && !isMobile);

	const t = useTranslation();

	const chat = useChat();

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

	/**
	const useEmojis = useUserPreference<boolean>('useEmojis');

	const handleOpenEmojiPicker: MouseEventHandler<HTMLElement> = useMutableCallback((e) => {
		e.stopPropagation();
		e.preventDefault();

		if (!useEmojis) {
			return;
		}

		if (EmojiPicker.isOpened()) {
			EmojiPicker.close();
			return;
		}

		EmojiPicker.open(e.currentTarget, (emoji: string) => chat?.composer?.insertText(` :${emoji}: `));
	});
	 */

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
			handleSendMessage();
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

			case 'ArrowUp': {
				if (input.selectionEnd === 0) {
					event.preventDefault();
					event.stopPropagation();

					onNavigateToPreviousMessage?.();

					if (event.altKey) {
						input.setSelectionRange(0, 0);
					}
				}

				return;
			}

			case 'ArrowDown': {
				if (input.selectionEnd === input.value.length) {
					event.preventDefault();
					event.stopPropagation();

					onNavigateToNextMessage?.();

					if (event.altKey) {
						input.setSelectionRange(input.value.length, input.value.length);
					}
				}
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

	// const sizes = useContentBoxSize(textareaRef);

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

	return (
		<>
			{chat?.composer?.quotedMessages && <MessageBoxReplies />}

			{/* <BlazeTemplate w='full' name='messagePopupSlashCommandPreview' tmid={tmid} rid={rid} getInput={() => textareaRef.current} /> */}

			{popup && !popup.preview && (
				<ComposerBoxPopup select={select} items={items} focused={focused} title={popup.title} renderItem={popup.renderItem} />
			)}
			{/*
				SlashCommand Preview popup works in a weird way
				There is only one trigger for all the commands: "/"
				After that we need to the slashcommand list and check if the command exists and provide the preview
				if not the query is `suspend` which means the slashcommand is not found or doesn't have a preview
			*/}
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

			{/*
			{readOnly && (
				<Box mbe='x4'>
					<Tag title={t('Only_people_with_permission_can_send_messages_here')}>{t('This_room_is_read_only')}</Tag>
				</Box>
			)}
			*/}

			{isRecordingVideo && <VideoMessageRecorder reference={messageComposerRef} rid={rid} tmid={tmid} />}
			<MessageComposer ref={messageComposerRef} variant={isEditing ? 'editing' : undefined}>
				{isRecordingAudio && <AudioMessageRecorder rid={rid} isMicrophoneDenied={isMicrophoneDenied} />}
				<MessageComposerInput
					ref={mergedRefs as unknown as Ref<HTMLInputElement>}
					aria-label={t('Message')}
					name='msg'
					disabled={isRecording || !canSend}
					onChange={setTyping}
					style={textAreaStyle}
					placeholder={t('Message')}
					onKeyDown={handler}
					onPaste={handlePaste}
					aria-activedescendant={ariaActiveDescendant}
				/>
				<div ref={shadowRef} style={shadowStyle} />

				<MessageComposerToolbar>
					<MessageComposerToolbarActions aria-label={t('Message_composer_toolbox_primary_actions')}>
						{/**
						<MessageComposerAction
							icon='emoji'
							disabled={!useEmojis || isRecording || !canSend}
							onClick={handleOpenEmojiPicker}
							title={t('Emoji')}
						/>
						<MessageComposerActionsDivider />
						 */}
						{chat.composer && formatters.length > 0 && (
							<MessageBoxFormattingToolbar composer={chat.composer} variant='large' items={formatters} disabled={isRecording || !canSend} />
						)}
					</MessageComposerToolbarActions>
					<MessageComposerToolbarSubmit>
						<MessageBoxActionsToolbar
							variant='large'
							isRecording={isRecording}
							typing={typing}
							canSend={canSend}
							rid={rid}
							tmid={tmid}
							isMicrophoneDenied={isMicrophoneDenied}
						/>
						<MessageComposerActionsDivider />
						<MessageComposerAction
							aria-label={t('Send')}
							icon='send'
							disabled={!canSend || (!typing && !isEditing)}
							onClick={handleSendMessage}
							secondary={typing || isEditing}
							info={typing || isEditing}
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
						<div style={{ lineHeight: '22px', marginBottom: '8px' }}>未加入频道，禁止发送消息。点击下方按钮加入频道。</div>
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
