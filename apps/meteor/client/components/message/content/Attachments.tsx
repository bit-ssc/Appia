import type { MessageAttachmentBase } from '@rocket.chat/core-typings';
import type { ReactElement } from 'react';
import React from 'react';

import AttachmentsItem from './attachments/AttachmentsItem';

type AttachmentsProps = {
	attachments: MessageAttachmentBase[];
	collapsed?: boolean;
	mentions?: {
		type: 'user' | 'team';
		_id: string;
		username?: string;
		name?: string;
	}[];
};

const Attachments = ({ attachments, collapsed, mentions }: AttachmentsProps): ReactElement => {
	return (
		<>
			{attachments?.map((attachment, index) => (
				<AttachmentsItem key={index} attachment={{ ...attachment, collapsed, mentions }} />
			))}
		</>
	);
};

export default Attachments;
