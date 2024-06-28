import { useDebouncedValue, useLocalStorage, useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetModal, useCurrentRoute, useRoute } from '@rocket.chat/ui-contexts';
import type { FC, MouseEvent } from 'react';
import React, { memo, useCallback, useMemo, useState } from 'react';

import { useRecordList } from '../../../../../../client/hooks/lists/useRecordList';
import { AsyncStatePhase } from '../../../../../../client/lib/asyncState';
import { useChat } from '../../../../../../client/views/room/contexts/ChatContext';
import { useRoom } from '../../../../../../client/views/room/contexts/RoomContext';
import { useCannedResponseFilterOptions } from '../../../hooks/useCannedResponseFilterOptions';
import { useCannedResponseList } from '../../../hooks/useCannedResponseList';
import CreateCannedResponse from '../../CannedResponse/modals';
import CannedResponseList from './CannedResponseList';

export const WrapCannedResponseList: FC<{ tabBar: any }> = ({ tabBar }) => {
	const room = useRoom();
	const [name] = useCurrentRoute();
	const channelRoute = useRoute(name || '');
	const setModal = useSetModal();

	const options = useCannedResponseFilterOptions() as [string, string][];

	const [text, setText] = useState('');
	const [type, setType] = useLocalStorage('canned-response-list-type', 'all');

	const handleTextChange = useCallback((event) => {
		setText(event.currentTarget.value);
	}, []);

	const debouncedText = useDebouncedValue(text, 400);

	const { cannedList, loadMoreItems, reload } = useCannedResponseList(
		useMemo(() => ({ filter: debouncedText, type }), [debouncedText, type]),
	);
	const { phase, items, itemCount } = useRecordList(cannedList);

	const onClickItem = useMutableCallback((data) => {
		const { _id: context } = data;

		channelRoute?.push({
			id: room._id,
			tab: 'canned-responses',
			context,
		});
	});

	const composer = useChat()?.composer;

	const onClickUse = (e: MouseEvent<HTMLOrSVGElement>, text: string): void => {
		e.preventDefault();
		e.stopPropagation();

		composer?.setText(text);
		composer?.focus();
	};

	const onClickCreate = (): void => {
		setModal(<CreateCannedResponse reloadCannedList={reload} />);
	};

	return (
		<CannedResponseList
			loadMoreItems={loadMoreItems}
			cannedItems={items}
			itemCount={itemCount}
			onClose={tabBar.close}
			loading={phase === AsyncStatePhase.LOADING}
			options={options}
			text={text}
			setText={handleTextChange}
			type={type}
			setType={setType}
			onClickUse={onClickUse}
			onClickItem={onClickItem}
			onClickCreate={onClickCreate}
			reload={reload}
		/>
	);
};

export default memo(WrapCannedResponseList);
