import { Meteor } from 'meteor/meteor';
import { appiaMentions } from '../../../../app/ui-message/client/appia/appiaMentions';
import { fileUploadIsValidContentType } from '../../../../app/utils/client';
import { message } from '../../../components/AppiaUI';
import FileUploadModal from '../../../views/room/modals/FileUploadModal';
import { imperativeModal } from '../../imperativeModal';
import { prependReplies } from '../../utils/prependReplies';
import type { ChatAPI } from '../ChatAPI';

const FILE_MAX_SIZE = 200 * 1024 * 1024;

export const uploadFiles = async (
	chat: ChatAPI,
	files: readonly File[],
	resend?: boolean,
	reEditText?: string,
	rollBackFile?: { _id: string; name: string; type: string; url: string; size: number },
): Promise<void> => {
	const replies = chat.composer?.quotedMessages.get() ?? [];

	const msg = await prependReplies('', replies);

	const room = await chat.data.getRoom();

	const queue = rollBackFile ? [rollBackFile] : [...files];

	const uploadNextFile = (): void => {
		const file = queue.pop();
		if (!file) {
			chat.composer?.dismissAllQuotedMessages();
			return;
		}

		if (file.size && file.size > FILE_MAX_SIZE) {
			message.error('文件大小超过200M', 1);
			return;
		}

		const fileDescription = Meteor._localStorage.getItem(chat.composer?.storageID ?? '');

		imperativeModal.open({
			component: FileUploadModal,
			props: {
				resend,
				file,
				fileName: file.name,
				fileDescription: reEditText ?? fileDescription ?? '',
				showDescription: !resend,
				room,
				chat,
				onClose: (): void => {
					imperativeModal.close();
					uploadNextFile();
				},
				onSubmit: (fileName: string, description?: string, json?: unknown): void => {
					Object.defineProperty(file, 'name', {
						writable: true,
						value: fileName,
					});
					try {
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
					} catch (e) {
						console.log(e);
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
					// @ts-ignore
					const params = {
						description,
						msg,
						fileId: rollBackFile && rollBackFile?._id,
						fileName: rollBackFile && fileName,
					};

					if (description?.trim() && json) {
						params.md = json;
					}
					chat.uploads.send(file, params);
					!reEditText && chat.composer?.clear();
					appiaMentions.reset(room._id);
					imperativeModal.close();
					uploadNextFile();
				},
				invalidContentType: Boolean(file.type && !fileUploadIsValidContentType(file.type)),
			},
		});
	};
	uploadNextFile();
};
