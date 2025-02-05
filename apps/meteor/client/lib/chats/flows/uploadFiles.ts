import { isRoomFederated } from '@rocket.chat/core-typings';

import { fileUploadIsValidContentType } from '../../../../app/utils/client';
import FileUploadModal from '../../../views/room/modals/FileUploadModal';
import { imperativeModal } from '../../imperativeModal';
import { prependReplies } from '../../utils/prependReplies';
import type { ChatAPI } from '../ChatAPI';

export const uploadFiles = async (chat: ChatAPI, files: readonly File[], resend?: boolean): Promise<void> => {
	const replies = chat.composer?.quotedMessages.get() ?? [];

	const msg = await prependReplies('', replies);

	const room = await chat.data.getRoom();

	const queue = [...files];

	const uploadNextFile = (): void => {
		const file = queue.pop();
		if (!file) {
			chat.composer?.dismissAllQuotedMessages();
			return;
		}

		imperativeModal.open({
			component: FileUploadModal,
			props: {
				resend,
				file,
				fileName: file.name,
				fileDescription: chat.composer?.text ?? '',
				showDescription: !resend,
				room,
				onClose: (): void => {
					imperativeModal.close();
					uploadNextFile();
				},
				onSubmit: (fileName: string, description?: string): void => {
					Object.defineProperty(file, 'name', {
						writable: true,
						value: fileName,
					});
					if (file?.type?.startsWith('image/')) {
						Object.defineProperty(file, 'image_url', {
							value: URL.createObjectURL(file),
						});
					}
					if (file?.type?.startsWith('video/')) {
						Object.defineProperty(file, 'video_url', {
							value: URL.createObjectURL(file),
						});
					}
					if (!file?.type) {
						const extension = fileName?.split('.')?.pop()?.toLowerCase();
						const mimeTypes = {
							py: 'text/x-python-script',
							// 可以根据需要添加更多的文件扩展名和MIME类型对应关系
						};

						// 如果文件扩展名在 mimeTypes 对象中有对应的MIME类型，则使用该MIME类型
						// 否则，可以选择设置为 'application/octet-stream' 或其他通用MIME类型
						// @ts-ignore
						file.type = mimeTypes[extension as string] || 'application/octet-stream';
					}
					chat.uploads.send(file, {
						description,
						msg,
					});
					chat.composer?.clear();
					imperativeModal.close();
					uploadNextFile();
				},
				invalidContentType: Boolean(file.type && !fileUploadIsValidContentType(file.type)),
			},
		});
	};

	uploadNextFile();
};
