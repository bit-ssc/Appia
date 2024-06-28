import { useSetting, useRoute } from '@rocket.chat/ui-contexts';
import { Random } from 'meteor/random';
import React from 'react';

import { roomCoordinator } from '../../../lib/rooms/roomCoordinator';
import { call } from '../../../lib/utils/call';
import { callWithErrorHandling } from '../../../lib/utils/callWithErrorHandling';
import { renderMessageBody } from '../../../lib/utils/renderMessageBody';
import type { IAppiaContentProps, IMentionType } from './IAppia';
// import { openRoom } from '../../../ui-utils/client';

import './appia.css';

const MentionType: React.FC<IAppiaContentProps> = ({ msg, user = {} }) => {
	const expired = useSetting('Udesk_Buttons_Expired') as number;
	const directRoute = useRoute('direct');

	try {
		const data = JSON.parse(msg.msgData as string) as IMentionType;

		const onClick = async () => {
			try {
				const name = data?.name;

				if (name) {
					const type = 'd';

					try {
						if (data.type === 1 && data.source === user.username && msg.ts.getTime() + (expired || 360) * 60 * 1000 > Date.now()) {
							if (data.askContent) {
								const room = roomCoordinator.getRoomDirectives(type)?.findRoom(name) || (await call('getRoomByTypeAndName', type, name));
								await callWithErrorHandling('sendMessage', { _id: Random.id(), rid: room._id, msg: data.askContent });
							}
						}
					} catch (e) {
						console.log(e);
					}

					directRoute.push({
						rid: name,
					});
				}
			} catch (e) {
				console.error(e);
			}
		};

		return (
			<>
				{data.content && <div style={{ padding: '0 0 5px' }}>{data.content}</div>}
				<button
					type='button'
					onClick={onClick}
					className='rcx-box rcx-box--full appia-mention-wrapper rcx-box--animated rcx-button--small rcx-button--primary rcx-button'
				>
					{data.buttonText}
				</button>
			</>
		);
	} catch (e) {
		return <div>{renderMessageBody(msg)}</div>;
	}
};

export default MentionType;
