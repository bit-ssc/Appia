import type { IMessage, IUser } from '@rocket.chat/core-typings';
import { isEditedMessage } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import {
	useCurrentRoute,
	usePermission,
	useQueryStringParameter,
	useRole,
	useSetting,
	useTranslation,
	useUser,
	useUserPreference,
} from '@rocket.chat/ui-contexts';
import type { MouseEventHandler, ReactElement, UIEvent } from 'react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { ChatMessage, RoomRoles } from '../../../../../app/models/client';
import { readMessage, RoomHistoryManager } from '../../../../../app/ui-utils/client';
import { getRoomHistoryManagerStorage, clearRoomHistoryManagerStorage } from '../../../../../app/ui-utils/client/lib/RoomHistoryManager';
import { isAtBottom } from '../../../../../app/ui/client/views/app/lib/scrolling';
import { callbacks } from '../../../../../lib/callbacks';
import { isTruthy } from '../../../../../lib/isTruthy';
import { withDebouncing, withThrottling } from '../../../../../lib/utils/highOrderFunctions';
import { Watermark } from '../../../../components/AppiaUI';
import ForwardMessage from '../../../../components/ForwardMessage';
import ScrollableContentWrapper from '../../../../components/ScrollableContentWrapper';
import { useEmbeddedLayout } from '../../../../hooks/useEmbeddedLayout';
import { useReactiveQuery } from '../../../../hooks/useReactiveQuery';
import { useReactiveValue } from '../../../../hooks/useReactiveValue';
import { RoomManager } from '../../../../lib/RoomManager';
import type { Upload } from '../../../../lib/chats/Upload';
import { UploadState } from '../../../../lib/chats/Upload';
import { imperativeModal } from '../../../../lib/imperativeModal';
import { roomCoordinator } from '../../../../lib/rooms/roomCoordinator';
import { setMessageJumpQueryStringParameter } from '../../../../lib/utils/setMessageJumpQueryStringParameter';
import Announcement from '../../Appia/Announcement';
import RoomSideMenuButton from '../../Appia/SideMenuButton/RoomSideMenuButton';
import RoomSideMenuStaffServiceButton from '../../Appia/SideMenuButton/RoomSideMenuStaffServiceButton';
import { MessageList } from '../../MessageList/MessageList';
import MessageListErrorBoundary from '../../MessageList/MessageListErrorBoundary';
import { useChat } from '../../contexts/ChatContext';
import { useRoom, useRoomSubscription, useRoomMessages } from '../../contexts/RoomContext';
import { useToolboxContext } from '../../contexts/ToolboxContext';
import { useScrollMessageList } from '../../hooks/useScrollMessageList';
import { selectedMessageStore } from '../../providers/SelectedMessagesProvider';
import DropTargetOverlay from './DropTargetOverlay';
import JumpToRecentMessagesBar from './JumpToRecentMessagesBar';
import LeaderBar from './LeaderBar';
import LoadingMessagesIndicator from './LoadingMessagesIndicator';
import NewMessagesButton from './NewMessagesButton';
/**
import RetentionPolicyWarning from './RetentionPolicyWarning';
import RoomForeword from './RoomForeword/RoomForeword';
*/
import NotJoinedChanelLimit from './NotJoinedChanelLimit';
import RetryLoadHistory from './RetryLoadHistory/RetryLoadHistory';
import UnreadMessagesIndicator from './UnreadMessagesIndicator';
// import UploadProgressIndicator from './UploadProgressIndicator';
import ComposerContainer from './composer/ComposerContainer';
import MeetingBar from './composer/meetingBar';
import { useFileUploadDropTarget } from './hooks/useFileUploadDropTarget';
import { useReadMessageWindowEvents } from './hooks/useReadMessageWindowEvents';
// import { useRetentionPolicy } from './hooks/useRetentionPolicy';
import { useUnreadMessages } from './hooks/useUnreadMessages';

import { useMessages } from '/client/views/room/MessageList/hooks/useMessages';

import { welcomeMsg } from './appia-style';

import { WelcomeMsgIcon } from '/client/components/SvgIcons';
import { useMenuBarContext } from '/client/views/root/contexts/MenuBar';

interface IUploadingFileMessage {
	_id: string;
	msg: string;
	rid: string;
	ts?: Date;
	u?: {
		_id?: string;
		username?: string;
		name?: string;
	};
	attachments: File[];
	fileData: {
		uploadState: string;
		progress: number;
		error?: Error;
		file?: File;
	};
	unread?: boolean;
}

const RoomBody = (): ReactElement => {
	const t = useTranslation();
	const isLayoutEmbedded = useEmbeddedLayout();
	const room = useRoom();
	const user = useUser();
	const toolbox = useToolboxContext();
	const admin = useRole('admin');
	const subscription = useRoomSubscription();
	const { uploadingFailedFiles } = useMenuBarContext();

	const [lastMessageDate, setLastMessageDate] = useState<Date | undefined>();
	const [hideLeaderHeader, setHideLeaderHeader] = useState(false);
	const [hasNewMessages, setHasNewMessages] = useState(false);

	const hideFlexTab = useUserPreference<boolean>('hideFlexTab') || undefined;
	const hideUsernames = useUserPreference<boolean>('hideUsernames');
	const displayAvatars = useUserPreference<boolean>('displayAvatars');

	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const messagesBoxRef = useRef<HTMLDivElement | null>(null);
	const atBottomRef = useRef(true);
	const lastScrollTopRef = useRef(0);
	const changingScrollTopRef = useRef(0);
	const [showWelcomeMsg, setShowWelcomeMsg] = useState(false);

	const chat = useChat();
	const canSend = useReactiveValue(useCallback(() => roomCoordinator.verifyCanSendMessage(room?.rid), [room?.rid]));

	if (!chat) {
		throw new Error('No ChatContext provided');
	}
	const [fileUploadTriggerProps, fileUploadOverlayProps] = useFileUploadDropTarget();

	/* 	let needDisplayAnnouncement = room.announcement && room.announcement.message;
	if (needDisplayAnnouncement && room.announcement.readUsers) {
		room.announcement.readUsers.forEach((u) => {
			if (needDisplayAnnouncement && u === user.username) {
				needDisplayAnnouncement = false;
			}
		});
	} */

	// 此处的副作用钩子的目的：当切换room时候，wrapperRef所指向的房间滚动条默认到底部
	useEffect(() => {
		if (wrapperRef.current) {
			wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
		}
		clearRoomHistoryManagerStorage();
	}, [room._id]);

	const _isAtBottom = useCallback((scrollThreshold = 0) => {
		const wrapper = wrapperRef.current;

		if (!wrapper) {
			return false;
		}

		if (isAtBottom(wrapper, scrollThreshold)) {
			setHasNewMessages(false);
			return true;
		}
		return false;
	}, []);

	const scrollMessageList = useScrollMessageList(wrapperRef);

	const sendToBottom = useCallback(() => {
		scrollMessageList((wrapper) => {
			return { left: 30, top: wrapper?.scrollHeight };
		});

		setHasNewMessages(false);
	}, [scrollMessageList]);

	const sendToBottomIfNecessary = useCallback(() => {
		if (atBottomRef.current === true) {
			sendToBottom();
		}
	}, [sendToBottom]);

	const checkIfScrollIsAtBottom = useCallback(() => {
		atBottomRef.current = _isAtBottom(100);
	}, [_isAtBottom]);

	const handleNewMessageButtonClick = useCallback(() => {
		atBottomRef.current = true;
		sendToBottomIfNecessary();
		chat.composer?.focus();
	}, [chat, sendToBottomIfNecessary]);

	const handleJumpToRecentButtonClick = useCallback(() => {
		atBottomRef.current = true;
		RoomHistoryManager.clear(room._id);
		RoomHistoryManager.getMoreIfIsEmpty(room._id);
	}, [room._id]);

	const [unread, setUnreadCount] = useUnreadMessages(room);

	const uploads = useSyncExternalStore(chat.uploads.subscribe, chat.uploads.get);

	useEffect(() => {
		const getUploadState = (upload: Upload) => {
			if (upload.statusCode === 200) {
				return UploadState.success;
			}
			return upload.error ? UploadState.fail : UploadState.uploading;
		};
		(() => {
			const isImage = (mimeType: string) => {
				const pattern = /^image\/(jpeg|png|gif|bmp|webp)$/;
				return pattern.test(mimeType);
			};
			const isVideo = (mimeType: string) => {
				const pattern = /^video\/(mp4|webm|ogg|avi|mov|m4v|wmv)$/;
				return pattern.test(mimeType);
			};
			uploads?.forEach((upload) => {
				if (upload.error) {
					uploadingFailedFiles.set(upload.id, upload.file);
				} else {
					uploadingFailedFiles.has(upload.id) && uploadingFailedFiles.delete(upload.id);
				}
				let attachment = {
					ts: upload.ts,
					title: upload.name,
					title_link: '',
					title_link_download: false,
					type: 'file',
					uploading: true,
					descriptionMd: upload.description ? [{ type: 'PARAGRAPH', value: [{ type: 'PLAIN_TEXT', value: upload.description }] }] : null,
					file: upload.file,
				} as unknown as File;
				let uploadingFileMessage: IUploadingFileMessage | undefined = {
					_id: upload.id,
					msg: '',
					unread: true,
					ts: upload.ts,
					rid: room._id,
					u: {
						_id: user?._id,
						name: user?.username,
						username: user?.username,
					},
					attachments: [attachment],
					fileData: {
						uploadState: getUploadState(upload),
						progress: upload.percentage,
						error: upload.error,
					},
				};
				if (isImage(upload.file.type)) {
					// @ts-ignore
					attachment = { ...attachment, image_url: upload.file.image_url, url: upload.file.image_url };
				}
				if (isVideo(upload.file.type)) {
					// @ts-ignore
					attachment = { ...attachment, video_url: upload.file.video_url, url: upload.file.video_url };
				}
				uploadingFileMessage = { ...uploadingFileMessage, attachments: [attachment] };
				try {
					const res = ChatMessage.findOneByRoomIdAndMessageId(room._id, upload.id);
					if (res && res._id) {
						// @ts-ignore
						ChatMessage.updateLoadingFileMessage(uploadingFileMessage);
					} else {
						// @ts-ignore
						ChatMessage.insertLoadingFileMessage(uploadingFileMessage);
					}
				} catch (e) {
					console.error(e);
				}
			});
		})();
	}, [uploads]);

	const { hasMorePreviousMessages, hasMoreNextMessages, isLoadingMoreMessages, loadHistoryFailure } = useRoomMessages();

	const allowAnonymousRead = useSetting('Accounts_AllowAnonymousRead') as boolean | undefined;

	const canPreviewChannelRoom = usePermission('preview-c-room');

	const subscribed = !!subscription;

	const canPreview = useMemo(() => {
		if (room && room.t !== 'c') {
			return true;
		}

		if (allowAnonymousRead === true) {
			return true;
		}

		if (canPreviewChannelRoom) {
			return true;
		}

		return subscribed;
	}, [allowAnonymousRead, canPreviewChannelRoom, room, subscribed]);

	const useRealName = useSetting('UI_Use_Real_Name') as boolean;

	const { data: roomLeader } = useReactiveQuery(['rooms', room._id, 'leader', { not: user?._id }], () => {
		const leaderRoomRole = RoomRoles.findOne({
			'rid': room._id,
			'roles': 'leader',
			'u._id': { $ne: user?._id },
		});

		if (!leaderRoomRole) {
			return null;
		}

		return {
			...leaderRoomRole.u,
			name: useRealName ? leaderRoomRole.u.name || leaderRoomRole.u.username : leaderRoomRole.u.username,
		};
	});

	const handleOpenUserCardButtonClick = useCallback(
		(event: UIEvent, username: IUser['username']) => {
			if (!username) {
				return;
			}

			chat?.userCard.open(username)(event);
		},
		[chat?.userCard],
	);

	const handleUnreadBarJumpToButtonClick = useCallback(() => {
		const rid = room._id;
		const { firstUnread } = RoomHistoryManager.getRoom(rid);
		let message = firstUnread?.get();
		if (!message) {
			message = ChatMessage.findOne({ rid, ts: { $gt: unread?.since } }, { sort: { ts: 1 }, limit: 1 });
		}
		if (!message) {
			return;
		}
		setMessageJumpQueryStringParameter(message?._id);
		setUnreadCount(0);
	}, [room._id, unread?.since, setUnreadCount]);

	const handleMarkAsReadButtonClick = useCallback(() => {
		readMessage.readNow(room._id);
		setUnreadCount(0);
	}, [room._id, setUnreadCount]);

	const handleUploadProgressClose = useCallback(
		(id: Upload['id']) => {
			chat.uploads.cancel(id);
		},
		[chat],
	);

	// const retentionPolicy = useRetentionPolicy(room);

	useEffect(() => {
		callbacks.add(
			'streamNewMessage',
			(msg: IMessage) => {
				if (room._id !== msg.rid || isEditedMessage(msg) || msg.tmid) {
					return;
				}

				if (msg.u._id === user?._id) {
					sendToBottom();
					return;
				}

				if (!_isAtBottom()) {
					setHasNewMessages(true);
				}
			},
			callbacks.priority.MEDIUM,
			room._id,
		);

		return () => {
			callbacks.remove('streamNewMessage', room._id);
		};
	}, [_isAtBottom, room._id, sendToBottom, user?._id]);

	useEffect(() => {
		const messageList = wrapperRef.current?.querySelector('ul');

		if (!messageList) {
			return;
		}

		const observer = new ResizeObserver(() => {
			sendToBottomIfNecessary();
		});

		observer.observe(messageList);

		return () => {
			observer?.disconnect();
		};
	}, [sendToBottomIfNecessary]);

	const [routeName] = useCurrentRoute();

	const roomRef = useRef(room);
	roomRef.current = room;
	const tabBarRef = useRef(toolbox);
	tabBarRef.current = toolbox;

	const debouncedReadMessageRead = useMemo(
		() =>
			withDebouncing({ wait: 500 })(() => {
				readMessage.read(room._id);
			}),
		[room._id],
	);

	useEffect(() => {
		if (!routeName || !roomCoordinator.isRouteNameKnown(routeName)) {
			return;
		}

		debouncedReadMessageRead();
		if (subscribed && (subscription?.alert || subscription?.unread)) {
			readMessage.refreshUnreadMark(room._id);
		}
	}, [debouncedReadMessageRead, room._id, routeName, subscribed, subscription?.alert, subscription?.unread]);

	useEffect(() => {
		if (!subscribed) {
			setUnreadCount(0);
			return;
		}

		const count = ChatMessage.find({
			rid: room._id,
			ts: { $lte: lastMessageDate, $gt: subscription?.ls },
		}).count();

		count && setUnreadCount(count);
	}, [lastMessageDate, room._id, setUnreadCount, subscribed, subscription?.ls]);

	useEffect(() => {
		if (!unread?.count) {
			return debouncedReadMessageRead();
		}
		readMessage.refreshUnreadMark(room._id);
	}, [debouncedReadMessageRead, room._id, unread?.count]);

	useEffect(() => {
		const wrapper = wrapperRef.current;

		if (!wrapper) {
			return;
		}

		const getElementFromPoint = (topOffset = 0): Element | undefined => {
			const messagesBox = messagesBoxRef.current;

			if (!messagesBox) {
				return;
			}

			const messagesBoxLeft = messagesBox.getBoundingClientRect().left + window.pageXOffset;
			const messagesBoxTop = messagesBox.getBoundingClientRect().top + window.pageYOffset;
			const messagesBoxWidth = parseFloat(getComputedStyle(messagesBox).width);

			let element;
			if (document.dir === 'rtl') {
				element = document.elementFromPoint(messagesBoxLeft + messagesBoxWidth - 1, messagesBoxTop + topOffset + 1);
			} else {
				element = document.elementFromPoint(messagesBoxLeft + 1, messagesBoxTop + topOffset + 1);
			}

			if (element?.classList.contains('rcx-message') || element?.classList.contains('rcx-message--sequential')) {
				return element;
			}
		};

		const updateUnreadCount = withThrottling({ wait: 300 })(() => {
			Tracker.afterFlush(() => {
				const lastInvisibleMessageOnScreen = getElementFromPoint(0) || getElementFromPoint(20) || getElementFromPoint(40);

				if (!lastInvisibleMessageOnScreen) {
					setUnreadCount(0);
					return;
				}

				const lastMessage = ChatMessage.findOne(lastInvisibleMessageOnScreen.id);
				if (!lastMessage) {
					setUnreadCount(0);
					return;
				}

				setLastMessageDate(lastMessage.ts);
			});
		});

		const handleWrapperScroll = withThrottling({ wait: 100 })((event) => {
			const roomLeader = messagesBoxRef.current?.querySelector('.room-leader');
			if (roomLeader) {
				if (event.target.scrollTop < lastScrollTopRef.current) {
					setHideLeaderHeader(false);
				} else if (_isAtBottom(100) === false && event.target.scrollTop > parseFloat(getComputedStyle(roomLeader).height)) {
					setHideLeaderHeader(true);
				}
			}
			lastScrollTopRef.current = event.target.scrollTop;
			const height = event.target.clientHeight;
			const isLoading = RoomHistoryManager.isLoading(room._id);
			const hasMore = RoomHistoryManager.hasMore(room._id);
			const hasMoreNext = RoomHistoryManager.hasMoreNext(room._id);
			const hasScrollDownMore = RoomHistoryManager.hasScrollDownMore(room._id);

			const isScrollToBottom = Math.ceil(lastScrollTopRef.current) >= event.target.scrollHeight - height;
			const isScrollDowning = lastScrollTopRef.current >= changingScrollTopRef.current && changingScrollTopRef.current !== 0;
			const { scrollLastMessage } = getRoomHistoryManagerStorage();

			if (isScrollDowning && scrollLastMessage && event.target.scrollHeight - lastScrollTopRef.current >= 2 * height) {
				if (hasScrollDownMore === false) {
					console.info('hasScrollDownMore');
					clearRoomHistoryManagerStorage();
				} else {
					console.info('getMoreWithScrollingDown');
					RoomHistoryManager.getMoreWithScrollingDown(scrollLastMessage);
				}
			}
			changingScrollTopRef.current = lastScrollTopRef.current;
			if ((isLoading === false && hasMore === true) || hasMoreNext === true) {
				if (hasMore === true && lastScrollTopRef.current <= height / 3) {
					RoomHistoryManager.getMore(room._id);
				} else if (hasMoreNext === true && isScrollToBottom) {
					RoomHistoryManager.getMoreNext(room._id, atBottomRef);
				}
			}
		});

		if (canSend) {
			wrapper.addEventListener('scroll', updateUnreadCount);
			wrapper.addEventListener('scroll', handleWrapperScroll);
		}

		return () => {
			wrapper.removeEventListener('scroll', updateUnreadCount);
			wrapper.removeEventListener('scroll', handleWrapperScroll);
		};
	}, [_isAtBottom, room._id, setUnreadCount, canSend]);

	useEffect(() => {
		const wrapper = wrapperRef.current;

		if (!wrapper) {
			return;
		}

		const store = RoomManager.getStore(room._id);

		const handleWrapperScroll = withThrottling({ wait: 30 })(() => {
			store?.update({ scroll: wrapper.scrollTop, atBottom: isAtBottom(wrapper, 50) });
		});

		const afterMessageGroup = (): void => {
			if (store?.scroll && !store.atBottom) {
				wrapper.scrollTop = store.scroll;
			} else {
				sendToBottom();
			}
			wrapper.removeEventListener('MessageGroup', afterMessageGroup);

			wrapper.addEventListener('scroll', handleWrapperScroll);
		};

		wrapper.addEventListener('MessageGroup', afterMessageGroup);

		return () => {
			wrapper.removeEventListener('MessageGroup', afterMessageGroup);
			wrapper.removeEventListener('scroll', handleWrapperScroll);
		};
	}, [room._id, sendToBottom]);

	useEffect(() => {
		// 此处的handleWheel执行会把上个房间的滚动条位置带到下个房间
		const wrapper = wrapperRef.current;

		if (!wrapper) {
			return;
		}

		const handleWheel = withThrottling({ wait: 100 })(() => {
			checkIfScrollIsAtBottom();
		});

		const handleTouchStart = (): void => {
			atBottomRef.current = false;
		};

		let timer1s: ReturnType<typeof setTimeout> | undefined;
		let timer2s: ReturnType<typeof setTimeout> | undefined;

		const handleTouchEnd = (): void => {
			checkIfScrollIsAtBottom();
			timer1s = setTimeout(() => checkIfScrollIsAtBottom(), 1000);
			timer2s = setTimeout(() => checkIfScrollIsAtBottom(), 2000);
		};

		// wrapper.addEventListener('mousewheel', handleWheel);
		// wrapper.addEventListener('wheel', handleWheel);
		wrapper.addEventListener('scroll', handleWheel);
		// wrapper.addEventListener('touchstart', handleTouchStart);
		// wrapper.addEventListener('touchend', handleTouchEnd);

		return (): void => {
			if (timer1s) clearTimeout(timer1s);
			if (timer2s) clearTimeout(timer2s);
			wrapper.removeEventListener('mousewheel', handleWheel);
			wrapper.removeEventListener('wheel', handleWheel);
			wrapper.removeEventListener('scroll', handleWheel);
			wrapper.removeEventListener('touchstart', handleTouchStart);
			wrapper.removeEventListener('touchend', handleTouchEnd);
		};
	}, [checkIfScrollIsAtBottom]);

	const handleComposerResize = useCallback((): void => {
		sendToBottomIfNecessary();
	}, [sendToBottomIfNecessary]);

	const handleNavigateToPreviousMessage = useCallback((): void => {
		chat.messageEditing.toPreviousMessage();
	}, [chat.messageEditing]);

	const handleNavigateToNextMessage = useCallback((): void => {
		chat.messageEditing.toNextMessage();
	}, [chat.messageEditing]);

	const handleUploadFiles = useCallback(
		(files: readonly File[]): void => {
			chat.flows.uploadFiles(files);
		},
		[chat],
	);

	const replyMID = useQueryStringParameter('reply');

	const messages = useMessages({ rid: room._id });
	useEffect(() => {
		const hasWelcomeMsg = room?.welcomeMsg || subscription?.welcomeMsg;
		const hasMessage = messages && messages.length > 0;
		setShowWelcomeMsg(!hasMessage && hasWelcomeMsg);
	}, [messages, room?.welcomeMsg, subscription?.welcomeMsg]);

	useEffect(() => {
		if (!replyMID) {
			return;
		}

		chat.data.getMessageByID(replyMID).then((message) => {
			if (!message) {
				return;
			}

			chat.composer?.quoteMessage(message);
		});
	}, [chat.data, chat.composer, replyMID]);

	useEffect(() => {
		chat.uploads.wipeFailedOnes();
	}, [chat]);

	const [selectedMessageCount, setSelectedMessageCount] = useState(0);
	const [isSelected, setIsSelected] = useState(false);

	useEffect(() => {
		const handle = () => {
			setSelectedMessageCount(selectedMessageStore.count());
			setIsSelected(selectedMessageStore.getIsSelecting());
		};
		selectedMessageStore.on('change', handle);
		return () => {
			selectedMessageStore.off('change', handle);
		};
	}, []);

	const handleCloseFlexTab: MouseEventHandler<HTMLElement> = useCallback(
		(e): void => {
			/*
			 * check if the element is a button or anchor
			 * it considers the role as well
			 * usually, the flex tab is closed when clicking outside of it
			 * but if the user clicks on a button or anchor, we don't want to close the flex tab
			 * because the user could be actually trying to open the flex tab through those elements
			 */

			const checkElement = (element: HTMLElement | null): boolean => {
				if (!element) {
					return false;
				}
				if (element instanceof HTMLButtonElement || element.getAttribute('role') === 'button') {
					return true;
				}
				if (element instanceof HTMLAnchorElement || element.getAttribute('role') === 'link') {
					return true;
				}
				return checkElement(element.parentElement);
			};

			if (checkElement(e.target as HTMLElement)) {
				return;
			}

			toolbox.close();
		},
		[toolbox],
	);

	useReadMessageWindowEvents();

	return (
		<>
			{room._id.includes('meeting.bot') && room._id && <MeetingBar roomId={room._id} username={user?.username} />}
			{roomLeader ? (
				<LeaderBar
					_id={roomLeader._id}
					username={roomLeader.username}
					name={roomLeader.name}
					visible={!hideLeaderHeader}
					onAvatarClick={handleOpenUserCardButtonClick}
				/>
			) : null}
			{!isLayoutEmbedded && room.t !== 'd' && <Announcement announcement={room.announcement} room={room} />}
			{showWelcomeMsg ? (
				<Box className={welcomeMsg}>
					<span className={'iconContainer'}>
						<WelcomeMsgIcon></WelcomeMsgIcon>
					</span>
					<div className={'content'}>{room.welcomeMsg || subscription.welcomeMsg}</div>
				</Box>
			) : null}

			<div className='main-content-flex'>
				<section
					className={`messages-container flex-tab-main-content ${admin ? 'admin' : ''}`}
					id={`chat-window-${room._id}`}
					aria-label={t('Channel')}
					onClick={hideFlexTab && handleCloseFlexTab}
				>
					<div className='messages-container-wrapper'>
						<div className='messages-container-main' {...fileUploadTriggerProps}>
							<DropTargetOverlay {...fileUploadOverlayProps} />
							<div className={['container-bars', (unread || uploads.length) && 'show'].filter(isTruthy).join(' ')}>
								{unread && (
									<UnreadMessagesIndicator
										count={unread.count}
										since={unread.since}
										onJumpButtonClick={handleUnreadBarJumpToButtonClick}
										onMarkAsReadButtonClick={handleMarkAsReadButtonClick}
									/>
								)}
								{/*
								{uploads.map((upload) => (
									<UploadProgressIndicator
										key={upload.id}
										id={upload.id}
										name={upload.name}
										percentage={upload.percentage}
										error={upload.error instanceof Error ? upload.error.message : undefined}
										onClose={handleUploadProgressClose}
									/>
								))}
								*/}
							</div>

							<div ref={messagesBoxRef} className={['messages-box'].filter(isTruthy).join(' ')}>
								<Watermark
									rotate={-45}
									gap={[200, 200]}
									content={user?.username || user?.name}
									style={{ position: 'static' }}
									font={{ color: 'rgba(0, 0, 0, 0.08)' }}
									zIndex={5}
								>
									<NewMessagesButton visible={hasNewMessages} onClick={handleNewMessageButtonClick} />
									<JumpToRecentMessagesBar visible={hasMoreNextMessages} onClick={handleJumpToRecentButtonClick} />
									{!canPreview ? (
										<div className='content room-not-found error-color'>
											<div>{t('You_must_join_to_view_messages_in_this_channel')}</div>
										</div>
									) : null}

									<div
										className={[
											'wrapper',
											hasMoreNextMessages && 'has-more-next',
											hideUsernames && 'hide-usernames',
											!displayAvatars && 'hide-avatar',
										]
											.filter(isTruthy)
											.join(' ')}
									>
										<MessageListErrorBoundary>
											{loadHistoryFailure ? <RetryLoadHistory rid={room._id} /> : null}
											<ScrollableContentWrapper ref={wrapperRef}>
												<ul className='messages-list' id='messages-list' aria-live='polite'>
													{!canSend ? <NotJoinedChanelLimit rid={room._id} /> : null}
													{canPreview ? (
														<>
															{hasMorePreviousMessages ? (
																<li className='load-more'>{isLoadingMoreMessages ? <LoadingMessagesIndicator /> : null}</li>
															) : null}
														</>
													) : null}

													<MessageList rid={room._id} room={room} scrollMessageList={scrollMessageList} />
													{hasMoreNextMessages ? (
														<li className='load-more'>{isLoadingMoreMessages ? <LoadingMessagesIndicator /> : null}</li>
													) : null}
												</ul>
											</ScrollableContentWrapper>
										</MessageListErrorBoundary>
									</div>
								</Watermark>
							</div>

							{!isSelected && (
								<ComposerContainer
									rid={room._id}
									subscription={subscription}
									onResize={handleComposerResize}
									onNavigateToPreviousMessage={handleNavigateToPreviousMessage}
									onNavigateToNextMessage={handleNavigateToNextMessage}
									onUploadFiles={handleUploadFiles}
									bot={subscription?.bot || room?.bot}
								/>
							)}

							{isSelected && (
								<div className='bm-forward-container'>
									<div className='bm-forward-bg'>
										<div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
											{/* <span className='bm_forward_type' style={{ fontSize: 'medium', color: 'black', marginBottom: 10 }}>
											逐条转发
										</span> */}
											<span className='bm_forward_selected_msgs' style={{ fontSize: 'middle' }}>
												{`已选择${selectedMessageCount}条消息`}
											</span>
										</div>
										<button
											className='rc-button rc-button--primary save bm-forward-close'
											style={{ backgroundColor: 'white', borderRadius: 5, borderColor: 'black', width: 'max-content' }}
											onClick={() => {
												selectedMessageStore.setIsSelecting(false);
												selectedMessageStore.clearStore();
											}}
										>
											<span style={{ color: 'black' }}>{'取消'}</span>
										</button>
										<button
											className='rc-button rc-button--primary save bm-forward-save'
											style={{ borderRadius: 5, marginLeft: 30, background: '#1d74f5' }}
											onClick={() => {
												imperativeModal.open({
													component: ForwardMessage,
													props: {
														onClose: imperativeModal.close,
														msgIds: selectedMessageStore.getSelectedMessages(),
														isMerged: false,
													},
												});
											}}
										>
											<span>{'逐条转发'}</span>
										</button>
										<button
											className='rc-button rc-button--primary save bm-forward-save'
											style={{ borderRadius: 5, marginLeft: 30, background: '#1d74f5' }}
											onClick={() => {
												imperativeModal.open({
													component: ForwardMessage,
													props: {
														onClose: imperativeModal.close,
														msgIds: selectedMessageStore.getSelectedMessages(),
														isMerged: true,
													},
												});
											}}
										>
											<span>{'合并转发'}</span>
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
					<RoomSideMenuStaffServiceButton name={room?.lowerCaseName || subscription?.lowerCaseName} rid={room._id} />
					<RoomSideMenuButton name={room?.lowerCaseName || subscription?.lowerCaseName} rid={room._id} />
				</section>
			</div>
		</>
	);
};

export default memo(RoomBody);
