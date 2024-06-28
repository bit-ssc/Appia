import { MessageFooterCallout } from '@rocket.chat/ui-composer';
import { useTranslation, useUserId } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import { ComposerOmnichannelInquiry } from './ComposerOmnichannelInquiry';
import { ComposerOmnichannelJoin } from './ComposerOmnichannelJoin';
import { ComposerOmnichannelOnHold } from './ComposerOmnichannelOnHold';
import { useOmnichannelRoom, useUserIsSubscribed } from '../../../../contexts/RoomContext';
import type { ComposerMessageProps } from '../ComposerMessage';
import ComposerMessage from '../ComposerMessage';

const ComposerOmnichannel = (props: ComposerMessageProps): ReactElement => {
	const { servedBy, queuedAt, open, onHold } = useOmnichannelRoom();
	const userId = useUserId();

	const isSubscribed = useUserIsSubscribed();

	const t = useTranslation();

	const isInquired = !servedBy && queuedAt;

	const isSameAgent = servedBy?._id === userId;

	if (!open) {
		return (
			<footer className='rc-message-box footer'>
				<MessageFooterCallout>{t('This_conversation_is_already_closed')}</MessageFooterCallout>
			</footer>
		);
	}

	if (onHold) {
		return <ComposerOmnichannelOnHold />;
	}

	if (isInquired) {
		return <ComposerOmnichannelInquiry />;
	}

	if (!isSubscribed && !isSameAgent) {
		return <ComposerOmnichannelJoin />;
	}

	return (
		<footer className='rc-message-box footer'>
			<ComposerMessage {...props} />
		</footer>
	);
};

export default ComposerOmnichannel;
