import type { IRoom } from '@rocket.chat/core-typings';
import type { ChannelMention, UserMention } from '@rocket.chat/gazzodown';
import { MarkupInteractionContext } from '@rocket.chat/gazzodown';
import { escapeRegExp } from '@rocket.chat/string-helpers';
import { RouterContext, useLayout, useUserPreference } from '@rocket.chat/ui-contexts';
import type { UIEvent } from 'react';
import React, { useContext, useCallback, memo, useMemo } from 'react';

import { useMessageListHighlights } from './message/list/MessageListContext';
import { detectEmoji } from '../lib/utils/detectEmoji';
import { fireGlobalEvent } from '../lib/utils/fireGlobalEvent';
import { useChat } from '../views/room/contexts/ChatContext';
import { useGoToRoom } from '../views/room/hooks/useGoToRoom';

type GazzodownTextProps = {
	children: JSX.Element;
	mentions?: {
		type: 'user' | 'team';
		_id: string;
		username?: string;
		name?: string;
	}[];
	channels?: Pick<IRoom, '_id' | 'name'>[];
	searchText?: string;
};

const GazzodownText = ({ mentions, channels, searchText, children }: GazzodownTextProps) => {
	const highlights = useMessageListHighlights();
	const highlightRegex = useMemo(() => {
		if (!highlights?.length) {
			return;
		}

		const alternatives = highlights.map(({ highlight }) => escapeRegExp(highlight)).join('|');
		const expression = `(?=^|\\b|[\\s\\n\\r\\t.,،'\\\"\\+!?:-])(${alternatives})(?=$|\\b|[\\s\\n\\r\\t.,،'\\\"\\+!?:-])`;

		return (): RegExp => new RegExp(expression, 'gmi');
	}, [highlights]);

	const markRegex = useMemo(() => {
		if (!searchText) {
			return;
		}

		return (): RegExp => new RegExp(`(${searchText})(?![^<]*>)`, 'gi');
	}, [searchText]);

	const convertAsciiToEmoji = useUserPreference<boolean>('convertAsciiEmoji', true);

	const chat = useChat();

	const resolveUserMention = useCallback(
		(mention: string) => {
			if (mention === 'all' || mention === 'here') {
				return undefined;
			}

			const filterUser = ({ username, type }: UserMention) => (!type || type === 'user') && username === mention;
			const filterTeam = ({ name, type }: UserMention) => type === 'team' && name === mention;

			return mentions?.find((mention) => filterUser(mention) || filterTeam(mention));
		},
		[mentions],
	);

	const onUserMentionClick = useCallback(
		({ username }: UserMention) => {
			if (!username || username.includes(':')) {
				return;
			}

			return (event: UIEvent): void => {
				event.stopPropagation();
				chat?.userCard.open(username)(event);
			};
		},
		[chat?.userCard],
	);

	const goToRoom = useGoToRoom();
	const router = useContext(RouterContext);

	const { isEmbedded } = useLayout();

	const resolveChannelMention = useCallback((mention: string) => channels?.find(({ name }) => name === mention), [channels]);

	const onChannelMentionClick = useCallback(
		({ _id: rid }: ChannelMention) =>
			(event: UIEvent): void => {
				if (isEmbedded) {
					fireGlobalEvent('click-mention-link', {
						path: router.getRoutePath('channel', { name: rid }),
						channel: rid,
					});
				}

				event.stopPropagation();
				goToRoom(rid);
			},
		[isEmbedded, goToRoom, router],
	);

	return (
		<MarkupInteractionContext.Provider
			value={{
				detectEmoji,
				highlightRegex,
				markRegex,
				convertAsciiToEmoji,
				resolveUserMention,
				onUserMentionClick,
				resolveChannelMention,
				onChannelMentionClick,
			}}
		>
			{children}
		</MarkupInteractionContext.Provider>
	);
};

export default memo(GazzodownText);
