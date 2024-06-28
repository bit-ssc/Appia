import type { MessageAttachmentBase } from '@rocket.chat/core-typings';
import { isFileAttachment, isQuoteAttachment } from '@rocket.chat/core-typings';
import type { ReactElement } from 'react';
import React, { memo } from 'react';

import DefaultAttachment from './DefaultAttachment';
import { FileAttachment } from './FileAttachment';
import { QuoteAttachment } from './QuoteAttachment';

type AttachmentsItemProps = {
	attachment: MessageAttachmentBase;
	mentions?: {
		type: 'user' | 'team';
		_id: string;
		username?: string;
		name?: string;
	}[];
};

const AttachmentsItem = ({ attachment, mentions }: AttachmentsItemProps): ReactElement => {
	if (isFileAttachment(attachment)) {
		return <FileAttachment {...attachment} />;
	}

	if (isQuoteAttachment(attachment)) {
		return <QuoteAttachment attachment={attachment} />;
	}

	return <DefaultAttachment {...(attachment as any)} />;
};

export default memo(AttachmentsItem);
