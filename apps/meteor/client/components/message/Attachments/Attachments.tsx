import type { FileProp, MessageAttachmentBase } from '@rocket.chat/core-typings';
import type { FC } from 'react';
import React from 'react';

import Item from './Item';
import { useBlockRendered } from '../hooks/useBlockRendered';

const Attachments: FC<{ attachments: Array<MessageAttachmentBase>; file?: FileProp }> = ({ attachments = null, file }): any => {
	const { className, ref } = useBlockRendered<HTMLDivElement>();
	return (
		<>
			<div className={className} ref={ref} />
			{attachments?.map((attachment, index) => (
				<Item key={index} file={file} attachment={attachment} />
			))}
		</>
	);
};

export default Attachments;
