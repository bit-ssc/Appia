import type { IRoom, IMessage, MessageTypesValues } from '@rocket.chat/core-typings';
import { useStableArray } from '@rocket.chat/fuselage-hooks';
import { useSetting } from '@rocket.chat/ui-contexts';
import type { Mongo } from 'meteor/mongo';
import { useCallback, useMemo } from 'react';

import { ChatMessage } from '../../../../../app/models/client';
import { useReactiveValue } from '../../../../hooks/useReactiveValue';
import { roomCoordinator } from '../../../../lib/rooms/roomCoordinator';
import { useRoom } from '../../contexts/RoomContext';

const mergeHideSysMessages = (
	sysMesArray1: Array<MessageTypesValues>,
	sysMesArray2: Array<MessageTypesValues>,
): Array<MessageTypesValues> => {
	return Array.from(new Set([...sysMesArray1, ...sysMesArray2]));
};

export const useMessages = ({ rid, canSendLimit = false }: { rid: IRoom['_id']; canSendLimit?: boolean }): IMessage[] => {
	const hideSysMesSetting = useSetting<MessageTypesValues[]>('Hide_System_Messages') ?? [];
	const room = useRoom();
	const hideRoomSysMes: Array<MessageTypesValues> = Array.isArray(room.sysMes) ? room.sysMes : [];
	const canSend = useReactiveValue(useCallback(() => roomCoordinator.verifyCanSendMessage(rid), [rid]));

	const hideSysMessages = useStableArray(mergeHideSysMessages(hideSysMesSetting, hideRoomSysMes));

	const query: Mongo.Query<IMessage> = useMemo(
		() => ({
			rid,
			_hidden: { $ne: true },
			surveyStatus: { $ne: true },
			t: { $nin: hideSysMessages },
			$or: [{ tmid: { $exists: false } }, { tshow: { $eq: true } }],
		}),
		[rid, hideSysMessages],
	);

	return useReactiveValue(
		useCallback(() => {
			if (canSendLimit || canSend) {
				return ChatMessage.find(query, {
					sort: {
						ts: 1,
					},
				}).fetch();
			}

			return ChatMessage.find(query, {
				sort: {
					ts: -1,
				},
				limit: 10,
			})
				.fetch()
				.reverse();
		}, [query, canSend, canSendLimit]),
	);
};
