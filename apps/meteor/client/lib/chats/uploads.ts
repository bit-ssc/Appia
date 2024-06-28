import type { IMessage, IRoom } from '@rocket.chat/core-typings';
import { Emitter } from '@rocket.chat/emitter';
import { Random } from '@rocket.chat/random';

import type { UploadsAPI } from './ChatAPI';
import type { Upload } from './Upload';
import { UserAction, USER_ACTIVITIES } from '../../../app/ui/client/lib/UserAction';
import { APIClient } from '../../../app/utils/client';
import { getErrorMessage } from '../errorHandling';

let uploads: readonly Upload[] = [];

const emitter = new Emitter<{ update: void; [x: `cancelling-${Upload['id']}`]: void }>();

const updateUploads = (update: (uploads: readonly Upload[]) => readonly Upload[]): void => {
	uploads = update(uploads);
	emitter.emit('update');
};

const get = (): readonly Upload[] => uploads;

const subscribe = (callback: () => void): (() => void) => emitter.on('update', callback);

const cancel = (id: Upload['id']): void => {
	emitter.emit(`cancelling-${id}`);
};

const wipeFailedOnes = (): void => {
	updateUploads((uploads) => uploads.filter((upload) => !upload.error));
};

const send = async (
	file: File & { messageId?: string },
	{
		description,
		msg,
		rid,
		tmid,
	}: {
		description?: string;
		msg?: string;
		rid: string;
		tmid?: string;
	},
): Promise<void> => {
	const id = file.messageId ?? Random.id();
	const ts = new Date();
	let online = navigator.onLine;
	// @ts-ignore
	let timeoutId = null;
	msg = description || msg;
	description = '';
	updateUploads((uploads) => [
		...uploads,
		{
			id,
			name: file.name,
			percentage: 0,
			file,
			description,
			ts,
		},
	]);

	try {
		await new Promise((resolve, reject) => {
			const xhr = APIClient.upload(
				`/v1/rooms.upload/${rid}`,
				{
					msg,
					tmid,
					file,
					description,
					messageId: id,
					ts,
				},
				{
					load: (event) => {
						resolve(event);
					},
					progress: (event) => {
						if (!event.lengthComputable) {
							return;
						}
						const progress = (event.loaded / event.total) * 100;
						if (progress === 100) {
							return;
						}

						updateUploads((uploads) =>
							uploads.map((upload) => {
								if (upload.id !== id) {
									return upload;
								}

								return {
									...upload,
									percentage: Math.round(progress) || 0,
								};
							}),
						);
					},
					error: (event) => {
						updateUploads((uploads) =>
							uploads.map((upload) => {
								if (upload.id !== id) {
									return upload;
								}

								return {
									...upload,
									percentage: 0,
									error: new Error(xhr.responseText),
								};
							}),
						);
						reject(event);
					},
				},
			);

			// 监听readystatechange事件来处理响应
			xhr.onreadystatechange = () => {
				// 检查请求是否完成
				if (xhr.readyState === XMLHttpRequest.DONE) {
					// 请求完成后，检查状态码
					if (xhr.status !== 200) {
						updateUploads((uploads) =>
							uploads.map((upload) => {
								if (upload.id !== id) {
									return upload;
								}
								return {
									...upload,
									error: new Error(xhr.responseText),
								};
							}),
						);
					} else {
						// 请求成功，处理响应
						updateUploads((uploads) =>
							uploads.map((upload) => {
								if (upload.id !== id) {
									return upload;
								}
								return {
									...upload,
									statusCode: 200,
								};
							}),
						);
						updateUploads((uploads) => uploads.filter((upload) => upload.id !== id));
						console.log('File uploaded successfully.', uploads);
						if (!uploads.length) {
							UserAction.stop(rid, USER_ACTIVITIES.USER_UPLOADING, { tmid });
						}
					}
				}
			};

			window.addEventListener('offline', () => {
				online = false;
				timeoutId = setTimeout(() => {
					if (!online) {
						updateUploads((uploads) =>
							uploads.map((upload) => {
								if (upload.id !== id) {
									return upload;
								}
								return {
									...upload,
									error: new Error('网络断开连接'),
								};
							}),
						);
						xhr.abort();
					}
				}, 10000);
			});

			window.addEventListener('online', () => {
				online = true;
				// @ts-ignore
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
			});

			if (uploads.length) {
				UserAction.performContinuously(rid, USER_ACTIVITIES.USER_UPLOADING, { tmid });
			}

			emitter.once(`cancelling-${id}`, () => {
				xhr.abort();
				updateUploads((uploads) => uploads.filter((upload) => upload.id !== id));
			});
		});
	} catch (error: unknown) {
		updateUploads((uploads) =>
			uploads.map((upload) => {
				if (upload.id !== id) {
					return upload;
				}

				return {
					...upload,
					percentage: 0,
					error: new Error(getErrorMessage(error)),
				};
			}),
		);
	} finally {
		if (!uploads.length) {
			UserAction.stop(rid, USER_ACTIVITIES.USER_UPLOADING, { tmid });
		}
	}
};

export const createUploadsAPI = ({ rid, tmid }: { rid: IRoom['_id']; tmid?: IMessage['_id'] }): UploadsAPI => ({
	get,
	subscribe,
	wipeFailedOnes,
	cancel,
	send: (file: File, { description, msg }: { description?: string; msg?: string }): Promise<void> =>
		send(file, { description, msg, rid, tmid }),
});
