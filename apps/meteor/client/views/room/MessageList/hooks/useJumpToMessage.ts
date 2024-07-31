import type { IMessage } from '@rocket.chat/core-typings';
import { RouterContext } from '@rocket.chat/ui-contexts';
import type { RefObject } from 'react';
import { useContext, useLayoutEffect } from 'react';

import { useMessageListJumpToMessageParam, useMessageListScroll } from '../../../../components/message/list/MessageListContext';
import { setHighlightMessage, clearHighlightMessage } from '../providers/messageHighlightSubscription';

// this is an arbitrary value so that there's a gap between the header and the message;
const SCROLL_EXTRA_OFFSET = 60;

export const useJumpToMessage = (messageId: IMessage['_id'], messageRef: RefObject<HTMLDivElement>): void => {
	const jumpToMessageParam = useMessageListJumpToMessageParam();
	const scroll = useMessageListScroll();
	const router = useContext(RouterContext);

	useLayoutEffect(() => {
		if (jumpToMessageParam !== messageId || !messageRef.current || !scroll) {
			return;
		}

		setTimeout(() => {
			scroll((wrapper) => {
				if (!wrapper || !messageRef.current) {
					return;
				}
				const containerRect = wrapper.getBoundingClientRect();
				const messageRect = messageRef.current.getBoundingClientRect();

				const offset = messageRect.top - containerRect.top;
				const scrollPosition = wrapper.scrollTop;
				const newScrollPosition = scrollPosition + offset - SCROLL_EXTRA_OFFSET;

				return { top: newScrollPosition, behavior: 'smooth' };
			});

			router.setQueryString(({ msg: _, ...params }) => params);

			setHighlightMessage(messageId);
			setTimeout(clearHighlightMessage, 2000);
		}, 500);
	}, [messageId, jumpToMessageParam, messageRef, scroll, router]);
};
