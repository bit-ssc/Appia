import { Box } from '@rocket.chat/fuselage';
import { useToastMessageDispatch } from '@rocket.chat/ui-contexts';
import React, { useCallback } from 'react';

import { notJoinedChanelLimitStyle } from './appia-style';
import { useMessages } from '../../MessageList/hooks/useMessages';
import { useChat } from '../../contexts/ChatContext';

export default function ({ rid }) {
	const chat = useChat();
	const dispatchToastMessage = useToastMessageDispatch();
	const messages = useMessages({ rid, canSendLimit: true });

	const onJoin = useCallback(async () => {
		try {
			await chat?.data?.joinRoom();
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
			throw error;
		}
	}, [chat]);

	if (messages.length <= 10) {
		return null;
	}

	return (
		<Box className={notJoinedChanelLimitStyle}>
			<svg width='21' height='21' viewBox='0 0 21 21' fill='none' xmlns='http://www.w3.org/2000/svg'>
				<path
					d='M14.5737 10.5485C14.5737 10.5632 14.573 10.5779 14.5722 10.5925C14.5707 10.6234 14.5692 10.655 14.567 10.6858C14.5647 10.7188 14.5617 10.7519 14.5587 10.7849C14.5572 10.8003 14.5557 10.815 14.5542 10.8304C14.3053 13.2196 11.9529 14.5235 10.9521 14.9736C10.7436 15.0676 10.5053 14.9186 10.5053 14.6939C10.5053 14.5309 10.3756 14.398 10.2099 14.387C8.08082 14.2372 6.4053 12.4861 6.43529 10.3576C6.46603 8.21222 8.25474 6.46185 10.4475 6.43174C12.722 6.40091 14.576 8.19533 14.576 10.4141C14.576 10.4589 14.5752 10.5037 14.5737 10.5485ZM10.506 4.29297C7.04102 4.29297 4.25 7.02352 4.25 10.4141C4.25 13.6961 6.88959 16.3752 10.2054 16.5287C10.3733 16.5368 10.506 16.6711 10.506 16.8356V17.246C10.506 17.4678 10.7377 17.6168 10.9453 17.5287C12.333 16.9413 16.5454 14.8282 16.7538 10.7306C16.7538 10.7284 16.7538 10.7269 16.7538 10.7247C16.756 10.6799 16.7575 10.6351 16.759 10.5896C16.759 10.5793 16.759 10.5698 16.7598 10.5595C16.7605 10.5111 16.762 10.4626 16.762 10.4134C16.762 7.0338 13.9605 4.29297 10.506 4.29297Z'
					fill='#C9CDD4'
				/>
				<path
					d='M10.2023 10.5584C10.1213 10.4828 10.0703 10.3756 10.0703 10.2574V7.96882C10.0703 7.73975 10.2615 7.55252 10.4954 7.55252C10.7293 7.55252 10.9204 7.73975 10.9204 7.96882V10.0848L12.473 11.6039C12.6387 11.7655 12.6387 12.0305 12.473 12.192C12.3073 12.3536 12.0367 12.3536 11.8718 12.192L10.218 10.5738C10.2128 10.5687 10.2075 10.5628 10.2023 10.5577V10.5584Z'
					fill='#C9CDD4'
				/>
			</svg>
			最多可预览10条信息，<span onClick={onJoin}>加入频道</span> 可查看更多
		</Box>
	);
}
