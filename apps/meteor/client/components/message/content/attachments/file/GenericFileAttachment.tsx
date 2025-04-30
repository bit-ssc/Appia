import type { MessageAttachmentBase } from '@rocket.chat/core-typings';
import {
	MessageGenericPreview,
	MessageGenericPreviewContent,
	// MessageGenericPreviewIcon,
	MessageGenericPreviewTitle,
	MessageGenericPreviewDescription,
	Box,
	MessageToolboxWrapper,
} from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetModal, useLayout } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { useCallback, useState, useEffect } from 'react';

import { MessageSetting } from '../../../../../../app/models/client';
import { DeploymentUnitIcon } from '../../../../AppiaIcon';
import FileIcon from '../../../../FileIcon';
// import { getFileExtension } from '../../../../../../lib/utils/getFileExtension';
import MarkdownText from '../../../../MarkdownText';
import { useMediaUrl } from '../../../Attachments/context/AttachmentContext';
import MessageCollapsible from '../../../MessageCollapsible';
import MessageContentBody from '../../../MessageContentBody';
import { useMessageContent } from '../../../hooks/useMessage';
import AttachmentSize from '../structure/AttachmentSize';

const SummaryButton = ({ summary, setShowDocumentSummary, _id }) => {
	const toggleImageSummary = useCallback(async () => {
		setShowDocumentSummary((value) => {
			MessageSetting.setMessageSettingById(_id, { showDocumentSummary: !value });

			return !value;
		});
	}, [_id]);

	if (!summary) {
		return null;
	}

	return (
		<MessageToolboxWrapper>
			<Box
				fontSize='16px'
				lineHeight='1'
				position='absolute'
				style={{
					bottom: '0',
					right: '0',
					cursor: 'pointer',
					background: 'rgba(0, 0, 0, 0.3)',
					color: '#fff',
					width: '24px',
					padding: '3px 0',
					borderRadius: '8px',
					textAlign: 'center',
				}}
				onClick={(e) => {
					e.stopPropagation();
					toggleImageSummary();
				}}
			>
				<DeploymentUnitIcon />
			</Box>
		</MessageToolboxWrapper>
	);
};

const Summary: React.FC<{
	summary: string | null | undefined;
	showDocumentSummary: boolean | null;
	setShowDocumentSummary: React.Dispatch<boolean>;
	_id: string;
}> = ({ summary, showDocumentSummary, _id }) => {
	if (!summary || showDocumentSummary === null) {
		return null;
	}

	return (
		<Box p='8px 0 0' onClick={(e) => e.stopPropagation()}>
			{showDocumentSummary && (
				<Box fontSize='12px' lineHeight='20px' color='#86909C' style={{ whiteSpace: 'break-spaces' }}>
					{summary}
				</Box>
			)}
		</Box>
	);
};

const useShowDocumentSummary = () => {
	// 从全局布局设置中获取默认值
	const { showDocumentSummary: userShowDocumentSummary } = useLayout();
	// 本地状态管理
	const [showDocumentSummary, setShowDocumentSummary] = useState<boolean | null>(null);
	// 获取消息上下文
	const { message } = useMessageContent();
	const { _id, rid } = message || {};

	useEffect(() => {
		if (_id) {
			MessageSetting.getMessageSettingById(_id).then((res) => {
				// 使用消息特定设置，如果没有则使用用户全局设置
				setShowDocumentSummary(res?.showDocumentSummary ?? userShowDocumentSummary);
			});
		}
	}, [userShowDocumentSummary, _id]); // 修正依赖项

	return [showDocumentSummary, setShowDocumentSummary, _id, rid] as const;
};

export const GenericFileAttachment: FC<MessageAttachmentBase> = ({
	baseUrl,
	title,
	description,
	descriptionMd,
	title_link: link,
	title_link_download: hasDownload,
	size,
	// format,
	collapsed,
	mentions,
	appiaSummary,
}) => {
	const getURL = useMediaUrl(baseUrl);

	const [showDocumentSummary, setShowDocumentSummary, _id, rid] = useShowDocumentSummary();

	const onClick = () => {
		if (link) {
			const url = getURL(link);
			window.location.href = url;
		}
	};

	return (
		<>
			{descriptionMd ? <MessageContentBody md={descriptionMd} mentions={mentions} /> : <MarkdownText parseEmoji content={description} />}
			<MessageCollapsible title={title} hasDownload={hasDownload} link={link} isCollapsed={collapsed}>
				<div className={'message-file-todo'} onClick={onClick} style={{ cursor: 'pointer' }}>
					<MessageGenericPreview style={{ maxWidth: '100%', width: '368px', position: 'relative' }}>
						<MessageGenericPreviewContent
							thumb={<FileIcon fileName={title} fontSize={40} style={{ margin: '10px 0 10px 10px', flexShrink: 0 }} />}
						>
							<MessageGenericPreviewTitle externalUrl={undefined} data-qa-type='attachment-title-link' download={hasDownload}>
								{title}
							</MessageGenericPreviewTitle>
							{size && (
								<MessageGenericPreviewDescription>
									<AttachmentSize size={size} wrapper={false} />
								</MessageGenericPreviewDescription>
							)}
						</MessageGenericPreviewContent>
						<SummaryButton summary={appiaSummary} setShowDocumentSummary={setShowDocumentSummary} _id={_id} />
					</MessageGenericPreview>

					<Summary
						summary={appiaSummary}
						showDocumentSummary={showDocumentSummary}
						setShowDocumentSummary={setShowDocumentSummary}
						_id={_id}
					/>
				</div>
			</MessageCollapsible>
		</>
	);
};
