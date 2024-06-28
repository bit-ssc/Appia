import { isOmnichannelRoom, isRoomFederated, isVoipRoom } from '@rocket.chat/core-typings';
import type { ReactElement } from 'react';
import React, { memo } from 'react';

import ComposerAnonymous from './ComposerAnonymous';
import ComposerBlocked from './ComposerBlocked';
import ComposerFederation from './ComposerFederation';
import ComposerJoinWithPassword from './ComposerJoinWithPassword';
import type { ComposerMessageProps } from './ComposerMessage';
import ComposerMessage from './ComposerMessage';
import ComposerOmnichannel from './ComposerOmnichannel';
import ComposerReadOnly from './ComposerReadOnly';
import ComposerVoIP from './ComposerVoIP';
import { useMessageComposerIsAnonymous } from './hooks/useMessageComposerIsAnonymous';
import { useMessageComposerIsBlocked } from './hooks/useMessageComposerIsBlocked';
import { useMessageComposerIsReadOnly } from './hooks/useMessageComposerIsReadOnly';
import { useRoom } from '../../../contexts/RoomContext';

const ComposerContainer = ({ children, ...props }: ComposerMessageProps): ReactElement => {
	const room = useRoom();

	const mustJoinWithCode = !props.subscription && room.joinCodeRequired;

	const isAnonymous = useMessageComposerIsAnonymous();

	const isBlockedOrBlocker = useMessageComposerIsBlocked({ subscription: props.subscription });

	const isReadOnly = useMessageComposerIsReadOnly(props.rid, props.subscription);

	if (isReadOnly) {
		return <ComposerReadOnly />;
	}

	const isOmnichannel = isOmnichannelRoom(room);

	const isFederation = isRoomFederated(room);

	const isVoip = isVoipRoom(room);

	if (isOmnichannel) {
		return <ComposerOmnichannel {...props} />;
	}

	if (isVoip) {
		return <ComposerVoIP />;
	}

	if (isFederation) {
		return <ComposerFederation room={room} {...props} />;
	}

	if (isAnonymous) {
		return (
			<footer className='rc-message-box footer'>
				<ComposerAnonymous />
			</footer>
		);
	}

	if (mustJoinWithCode) {
		return (
			<footer className='rc-message-box footer'>
				<ComposerJoinWithPassword />
			</footer>
		);
	}

	if (isBlockedOrBlocker) {
		return (
			<footer className='rc-message-box footer'>
				<ComposerBlocked />
			</footer>
		);
	}

	return (
		<footer className='rc-message-box footer'>
			{children}
			<ComposerMessage readOnly={room.ro} {...props} />
		</footer>
	);
};

export default memo(ComposerContainer);
