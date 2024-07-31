import type { WriteStream } from 'fs';
import fs from 'fs';
import { unlink, rename, writeFile } from 'fs/promises';
import stream from 'stream';
import type * as http from 'http';
import type * as https from 'https';
import { Buffer } from 'buffer';
import URL from 'url';

import { Meteor } from 'meteor/meteor';
import type { WritableStreamBuffer } from 'stream-buffers';
import streamBuffers from 'stream-buffers';
import sharp from 'sharp';
import { Cookies } from 'meteor/ostrio:cookies';
import { Match } from 'meteor/check';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import { Users, Avatars, UserDataFiles, Uploads, Settings, Subscriptions, Messages, Rooms } from '@rocket.chat/models';
import filesize from 'filesize';
import { AppsEngineException } from '@rocket.chat/apps-engine/definition/exceptions';
import { hashLoginToken } from '@rocket.chat/account-utils';
import type { IUpload } from '@rocket.chat/core-typings';
import type { NextFunction } from 'connect';
import type { OptionalId } from 'mongodb';

import { UploadFS } from '../../../../server/ufs';
import { settings } from '../../../settings/server';
import { mime } from '../../../utils/lib/mimeTypes';
import { canAccessRoomAsync } from '../../../authorization/server/functions/canAccessRoom';
import { fileUploadIsValidContentType } from '../../../utils/lib/fileUploadRestrictions';
import { isValidJWT, generateJWT } from '../../../utils/server/lib/JWTHelper';
import { AppEvents, Apps } from '../../../../ee/server/apps';
import { streamToBuffer } from './streamToBuffer';
import { SystemLogger } from '../../../../server/lib/logger/system';
import { roomCoordinator } from '../../../../server/lib/rooms/roomCoordinator';
import type { Store, StoreOptions } from '../../../../server/ufs/ufs-store';
import { ufsComplete } from '../../../../server/ufs/ufs-methods';

const cookie = new Cookies();
let maxFileSize = 0;

settings.watch('FileUpload_MaxFileSize', async function (value: string) {
	try {
		maxFileSize = parseInt(value);
	} catch (e) {
		maxFileSize = (await Settings.findOneById('FileUpload_MaxFileSize'))?.packageValue as number;
	}
});

const handlers: Record<string, FileUploadClass> = {};

const defaults: Record<string, () => Partial<StoreOptions>> = {
	Uploads() {
		return {
			collection: Uploads,
			filter: new UploadFS.Filter({
				onCheck: FileUpload.validateFileUpload,
			}),
			getPath(file: IUpload) {
				return `${settings.get('uniqueID')}/uploads/${file.rid}/${file.userId}/${file._id}`;
			},
			onValidate: FileUpload.uploadsOnValidate,
			async onRead(_fileId: string, file: IUpload, req: http.IncomingMessage, res: http.ServerResponse) {
				// Deprecated: Remove support to usf path
				if (!(await FileUpload.requestCanAccessFiles(req, file))) {
					res.writeHead(403);
					return false;
				}

				res.setHeader('content-disposition', `attachment; filename="${encodeURIComponent(file.name || '')}"`);
				return true;
			},
		};
	},

	Avatars() {
		return {
			collection: Avatars,
			filter: new UploadFS.Filter({
				onCheck: FileUpload.validateAvatarUpload,
			}),
			getPath(file: IUpload) {
				const avatarFile = file.rid ? `room-${file.rid}` : file.userId;
				return `${settings.get('uniqueID')}/avatars/${avatarFile}`;
			},
			onValidate: FileUpload.avatarsOnValidate,
			onFinishUpload: FileUpload.avatarsOnFinishUpload,
		};
	},

	UserDataFiles() {
		return {
			collection: UserDataFiles,
			getPath(file: IUpload) {
				return `${settings.get('uniqueID')}/uploads/userData/${file.userId}`;
			},
			onValidate: FileUpload.uploadsOnValidate,
			async onRead(_fileId: string, file: IUpload, req: http.IncomingMessage, res: http.ServerResponse) {
				if (!(await FileUpload.requestCanAccessFiles(req))) {
					res.writeHead(403);
					return false;
				}

				res.setHeader('content-disposition', `attachment; filename="${encodeURIComponent(file.name || '')}"`);
				return true;
			},
		};
	},
};

export const FileUpload = {
	handlers,

	getPath(path = '') {
		return `/file-upload/${path}`;
	},

	getProxyPath(path = '') {
		return `/file-proxy/${path}`;
	},

	configureUploadsStore(store: string, name: string, options: any) {
		const type = name.split(':').pop();
		if (!type || !(type in FileUpload.defaults)) {
			throw new Error('Store type undefined');
		}
		const stores = UploadFS.getStores();
		delete stores[name];

		return new UploadFS.store[store](
			Object.assign(
				{
					name,
				},
				options,
				FileUpload.defaults[type](),
			),
		);
	},

	async validateFileUpload(file: IUpload, content?: Buffer) {
		console.log('validateFileUpload file:', file);
		if (!Match.test(file.rid, String)) {
			return false;
		}

		// livechat users can upload files but they don't have an userId
		const user = (file.userId && (await Users.findOne(file.userId))) || undefined;
		console.log('validateFileUpload user:', user);

		const room = await Rooms.findOneById(file.rid);
		console.log(`validateFileUpload:`, room);
		if (!room) {
			return false;
		}
		const directMessageAllowed = settings.get('FileUpload_Enabled_Direct');
		const fileUploadAllowed = settings.get('FileUpload_Enabled');
		if (user?.type !== 'app' && (await canAccessRoomAsync(room, user, file)) !== true) {
			console.log('validateFileUpload canAccessRoomAsync.');
			return false;
		}
		const language = user?.language || 'en';
		if (!fileUploadAllowed) {
			const reason = TAPi18n.__('FileUpload_Disabled', { lng: language });
			throw new Meteor.Error('error-file-upload-disabled', reason);
		}

		if (!directMessageAllowed && room.t === 'd') {
			const reason = TAPi18n.__('File_not_allowed_direct_messages', { lng: language });
			throw new Meteor.Error('error-direct-message-file-upload-not-allowed', reason);
		}

		// -1 maxFileSize means there is no limit
		if (maxFileSize > -1 && (file.size || 0) > maxFileSize) {
			const reason = TAPi18n.__(
				'File_exceeds_allowed_size_of_bytes',
				{
					size: filesize(maxFileSize),
				},
				language,
			);
			throw new Meteor.Error('error-file-too-large', reason);
		}

		if (!fileUploadIsValidContentType(file.type)) {
			const reason = TAPi18n.__('File_type_is_not_accepted', { lng: language });
			throw new Meteor.Error('error-invalid-file-type', reason);
		}

		// App IPreFileUpload event hook
		try {
			await Apps.triggerEvent(AppEvents.IPreFileUpload, { file, content: content || Buffer.from([]) });
		} catch (error: any) {
			if (error.name === AppsEngineException.name) {
				throw new Meteor.Error('error-app-prevented', error.message);
			}

			throw error;
		}

		return true;
	},

	async validateAvatarUpload(file: IUpload) {
		if (!Match.test(file.rid, String) && !Match.test(file.userId, String)) {
			return false;
		}

		const user = file.uid ? await Users.findOne(file.uid, { projection: { language: 1 } }) : null;
		const language = user?.language || 'en';

		// accept only images
		if (!/^image\//.test(file.type || '')) {
			const reason = TAPi18n.__('File_type_is_not_accepted', { lng: language });
			throw new Meteor.Error('error-invalid-file-type', reason);
		}

		// -1 maxFileSize means there is no limit
		if (maxFileSize > -1 && (file.size || 0) > maxFileSize) {
			const reason = TAPi18n.__(
				'File_exceeds_allowed_size_of_bytes',
				{
					size: filesize(maxFileSize),
				},
				language,
			);
			throw new Meteor.Error('error-file-too-large', reason);
		}

		return true;
	},

	defaults,

	async avatarsOnValidate(this: Store, file: IUpload) {
		if (settings.get('Accounts_AvatarResize') !== true) {
			return;
		}

		const tempFilePath = UploadFS.getTempFilePath(file._id);

		const height = settings.get('Accounts_AvatarSize') as number;
		const width = height as number;

		const s = sharp(tempFilePath);
		if (settings.get('FileUpload_RotateImages') === true) {
			s.rotate();
		}

		const metadata = await s.metadata();
		// if (!metadata) {
		// 	metadata = {};
		// }

		const { data, info } = await s
			.resize({
				width,
				height,
				fit: metadata.hasAlpha ? sharp.fit.contain : sharp.fit.cover,
				background: { r: 255, g: 255, b: 255, alpha: metadata.hasAlpha ? 0 : 1 },
			})
			// Use buffer to get the result in memory then replace the existing file
			// There is no option to override a file using this library
			//
			// BY THE SHARP DOCUMENTATION:
			// toBuffer: Write output to a Buffer. JPEG, PNG, WebP, TIFF and RAW output are supported.
			// By default, the format will match the input image, except GIF and SVG input which become PNG output.
			.toBuffer({ resolveWithObject: true });

		try {
			await writeFile(tempFilePath, data);
		} catch (err: any) {
			SystemLogger.error(err);
		}

		await this.getCollection().updateOne(
			{ _id: file._id },
			{
				$set: {
					size: info.size,
					...(['gif', 'svg'].includes(metadata.format || '') ? { type: 'image/png' } : {}),
				},
			},
		);
	},

	async resizeImagePreview(fileParam: IUpload) {
		let file = await Uploads.findOneById(fileParam._id);
		if (!file) {
			return;
		}
		file = FileUpload.addExtensionTo(file);
		const image = await FileUpload.getStore('Uploads')._store.getReadStream(file._id, file);

		const transformer = sharp().resize({ width: 32, height: 32, fit: 'inside' }).jpeg().blur();
		const result = transformer.toBuffer().then((out) => out.toString('base64'));
		image.pipe(transformer);
		return result;
	},

	async extractMetadata(file: IUpload) {
		return sharp(FileUpload.getBufferSync(file)).metadata();
	},

	async createImageThumbnail(fileParam: IUpload) {
		if (!settings.get('Message_Attachments_Thumbnails_Enabled')) {
			return;
		}

		const width = settings.get('Message_Attachments_Thumbnails_Width') as number;
		const height = settings.get('Message_Attachments_Thumbnails_Height') as number;

		if (fileParam.identify?.size && fileParam.identify.size.height < height && fileParam.identify?.size.width < width) {
			return;
		}

		let file = await Uploads.findOneById(fileParam._id);
		if (!file) {
			return;
		}

		file = FileUpload.addExtensionTo(file);
		const store = FileUpload.getStore('Uploads');
		const image = await store._store.getReadStream(file._id, file);

		const transformer = sharp().resize({ width, height, fit: 'inside' });

		const result = transformer.toBuffer({ resolveWithObject: true }).then(({ data, info: { width, height } }) => ({ data, width, height }));
		image.pipe(transformer);

		return result;
	},

	async uploadImageThumbnail(file: IUpload, buffer: Buffer, rid: string, userId: string) {
		const store = FileUpload.getStore('Uploads');
		const details = {
			name: `thumb-${file.name}`,
			size: buffer.length,
			type: file.type,
			originalFileId: file._id,
			typeGroup: 'thumb',
			uploadedAt: new Date(),
			_updatedAt: new Date(),
			rid,
			userId,
		};

		return store.insert(details, buffer);
	},

	async uploadsOnValidate(this: Store, file: IUpload) {
		if (!file.type || !/^image\/((x-windows-)?bmp|p?jpeg|png|gif|webp)$/.test(file.type)) {
			return;
		}

		const tmpFile = UploadFS.getTempFilePath(file._id);

		const s = sharp(tmpFile);
		const metadata = await s.metadata();
		// if (err != null) {
		// 	SystemLogger.error(err);
		// 	return fut.return();
		// }

		const rotated = typeof metadata.orientation !== 'undefined' && metadata.orientation !== 1;
		const width = rotated ? metadata.height : metadata.width;
		const height = rotated ? metadata.width : metadata.height;

		const identify = {
			format: metadata.format,
			size:
				width != null && height != null
					? {
							width,
							height,
					  }
					: undefined,
		};

		const reorientation = async () => {
			if (!rotated || settings.get('FileUpload_RotateImages') !== true) {
				return;
			}

			await s.rotate().toFile(`${tmpFile}.tmp`);

			await unlink(tmpFile);

			await rename(`${tmpFile}.tmp`, tmpFile);
			// SystemLogger.error(err);
		};

		await reorientation();

		const { size } = await fs.lstatSync(tmpFile);
		await this.getCollection().updateOne(
			{ _id: file._id },
			{
				$set: { size, identify },
			},
		);
	},

	async avatarsOnFinishUpload(file: IUpload) {
		if (file.rid) {
			return;
		}

		if (!file.userId) {
			throw new Meteor.Error('error-not-allowed', 'Change avatar is not allowed');
		}

		// update file record to match user's username
		const user = await Users.findOneById(file.userId);
		if (!user?.username) {
			throw new Meteor.Error('error-not-allowed', 'Change avatar is not allowed');
		}
		const oldAvatar = await Avatars.findOneByName(user.username);
		if (oldAvatar) {
			await Avatars.deleteFile(oldAvatar._id);
		}
		await Avatars.updateFileNameById(file._id, user.username);
		// console.log('upload finished ->', file);
	},

	async requestCanAccessFiles({ headers = {}, url }: http.IncomingMessage, file?: IUpload) {
		if (!url || !settings.get('FileUpload_ProtectFiles')) {
			return true;
		}

		const { query } = URL.parse(url, true);
		// eslint-disable-next-line @typescript-eslint/naming-convention
		let { rc_uid, rc_token, rc_rid, rc_room_type } = query as Record<string, string | undefined>;
		const { token } = query;

		if (!rc_uid && headers.cookie) {
			rc_uid = cookie.get('rc_uid', headers.cookie);
			rc_token = cookie.get('rc_token', headers.cookie);
			rc_rid = cookie.get('rc_rid', headers.cookie);
			rc_room_type = cookie.get('rc_room_type', headers.cookie);
		}

		const isAuthorizedByRoom = async () =>
			rc_room_type &&
			roomCoordinator
				.getRoomDirectives(rc_room_type)
				.canAccessUploadedFile({ rc_uid: rc_uid || '', rc_rid: rc_rid || '', rc_token: rc_token || '' });

		const isAuthorizedByJWT = () =>
			settings.get('FileUpload_Enable_json_web_token_for_files') &&
			token &&
			isValidJWT(token as string, settings.get('FileUpload_json_web_token_secret_for_files'));

		if ((await isAuthorizedByRoom()) || isAuthorizedByJWT()) {
			return true;
		}

		const uid = rc_uid || (headers['x-user-id'] as string);
		const authToken = rc_token || (headers['x-auth-token'] as string);

		const user = uid && authToken && (await Users.findOneByIdAndLoginToken(uid, hashLoginToken(authToken), { projection: { _id: 1 } }));

		if (!user) {
			return false;
		}

		if (!settings.get('FileUpload_Restrict_to_room_members') || !file?.rid) {
			return true;
		}

		const subscription = await Subscriptions.findOneByRoomIdAndUserId(file.rid, user._id, { projection: { _id: 1 } });

		if (subscription) {
			return true;
		}

		return false;
	},

	addExtensionTo(file: IUpload) {
		if (mime.lookup(file.name || '') === file.type) {
			return file;
		}

		// This file type can be pretty much anything, so it's better if we don't mess with the file extension
		if (file.type !== 'application/octet-stream') {
			const ext = mime.extension(file.type || '');
			if (ext && new RegExp(`\\.${ext}$`, 'i').test(file.name || '') === false) {
				file.name = `${file.name}.${ext}`;
			}
		}

		return file;
	},

	getStore(modelName: string) {
		const storageType = settings.get('FileUpload_Storage_Type');
		const handlerName = `${storageType}:${modelName}`;

		return this.getStoreByName(handlerName);
	},

	getStoreByName(handlerName?: string) {
		if (!handlerName) {
			SystemLogger.error(`Empty Upload handler does not exists`);
			throw new Error(`Empty Upload handler does not exists`);
		}

		if (this.handlers[handlerName] == null) {
			SystemLogger.error(`Upload handler "${handlerName}" does not exists`);
		}
		return this.handlers[handlerName];
	},

	get(file: IUpload, req: http.IncomingMessage, res: http.ServerResponse, next: NextFunction) {
		const store = this.getStoreByName(file.store);
		if (store?.get) {
			return store.get(file, req, res, next);
		}
		res.writeHead(404);
		res.end();
	},

	getBuffer(file: IUpload, cb: (err?: Error, data?: false | Buffer) => void) {
		const store = this.getStoreByName(file.store);

		if (!store?.get) {
			cb(new Error('Store is invalid'), undefined);
		}

		const buffer = new streamBuffers.WritableStreamBuffer({
			initialSize: file.size,
		});

		buffer.on('finish', () => {
			cb(undefined, buffer.getContents());
		});

		void store.copy?.(file, buffer);
	},

	getBufferSync: Meteor.wrapAsync((file: IUpload, cb: (err?: Error, data?: false | Buffer) => void) => FileUpload.getBuffer(file, cb)),

	async copy(file: IUpload, targetFile: string) {
		const store = this.getStoreByName(file.store);
		const out = fs.createWriteStream(targetFile);

		file = FileUpload.addExtensionTo(file);

		if (store.copy) {
			await store.copy(file, out);
			return true;
		}

		return false;
	},

	redirectToFile(fileUrl: string, _req: http.IncomingMessage, res: http.ServerResponse) {
		res.removeHeader('Content-Length');
		res.removeHeader('Cache-Control');
		res.setHeader('Location', fileUrl);
		res.writeHead(302);
		res.end();
	},

	proxyFile(
		fileName: string,
		fileUrl: string,
		forceDownload: boolean,
		request: typeof http | typeof https,
		_req: http.IncomingMessage,
		res: http.ServerResponse,
	) {
		res.setHeader('Content-Disposition', `${forceDownload ? 'attachment' : 'inline'}; filename="${encodeURI(fileName)}"`);

		request.get(fileUrl, (fileRes) => fileRes.pipe(res));
	},

	generateJWTToFileUrls({ rid, userId, fileId }: { rid: string; userId: string; fileId: string }) {
		if (!settings.get('FileUpload_ProtectFiles') || !settings.get('FileUpload_Enable_json_web_token_for_files')) {
			return;
		}
		return generateJWT(
			{
				rid,
				userId,
				fileId,
			},
			settings.get('FileUpload_json_web_token_secret_for_files'),
		);
	},

	async removeFilesByRoomId(rid: string) {
		if (typeof rid !== 'string' || rid.trim().length === 0) {
			return;
		}
		const cursor = Messages.find(
			{
				rid,
				'file._id': {
					$exists: true,
				},
			},
			{
				projection: {
					'file._id': 1,
				},
			},
		);

		for await (const document of cursor) {
			if (document.file) {
				await FileUpload.getStore('Uploads').deleteById(document.file._id);
			}
		}
	},
};

type FileUploadClassOptions = {
	name: string;
	model?: typeof Avatars | typeof Uploads | typeof UserDataFiles;
	store?: Store;
	get: (file: IUpload, req: http.IncomingMessage, res: http.ServerResponse, next: NextFunction) => Promise<void>;
	insert?: () => Promise<IUpload>;
	getStore?: () => Store;
	copy?: (file: IUpload, out: WriteStream | WritableStreamBuffer) => Promise<void>;
};

export class FileUploadClass {
	public name: FileUploadClassOptions['name'];

	public model: typeof Avatars | typeof Uploads | typeof UserDataFiles;

	public _store: Store;

	public get: FileUploadClassOptions['get'];

	public copy: FileUploadClassOptions['copy'];

	constructor({ name, model, store, get, insert, getStore, copy }: FileUploadClassOptions) {
		this.name = name;
		this.model = model || this.getModelFromName();
		this._store = store || UploadFS.getStore(name);
		this.get = get;
		this.copy = copy;

		if (insert) {
			this.insert = insert;
		}

		if (getStore) {
			this.getStore = getStore;
		}

		FileUpload.handlers[name] = this;
	}

	getStore() {
		return this._store;
	}

	get store() {
		return this.getStore();
	}

	set store(store) {
		this._store = store;
	}

	getModelFromName(): typeof this.model {
		const modelsAvailable: Record<string, typeof this.model> = {
			Avatars,
			Uploads,
			UserDataFiles,
		};
		const modelName = this.name.split(':')[1];
		if (!modelsAvailable[modelName]) {
			throw new Error('Invalid Model for FileUpload');
		}
		return modelsAvailable[modelName];
	}

	async delete(fileId: string) {
		try {
			// TODO: Remove this method
			if (this.store?.delete) {
				await this.store.delete(fileId);
			}

			return this.model.deleteFile(fileId);
		} catch (err: unknown) {
			console.log(`store delete error. fileId:${fileId}`);
		}
	}

	async deleteById(fileId: string) {
		const file = await this.model.findOneById(fileId);

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		if (!file) {
			return;
		}

		const store = FileUpload.getStoreByName(file.store);

		return store.delete(file._id);
	}

	async deleteByName(fileName: string) {
		const file = await this.model.findOneByName(fileName);

		if (!file) {
			return;
		}

		const store = FileUpload.getStoreByName(file.store);

		return store.delete(file._id);
	}

	async deleteByRoomId(rid: string) {
		const file = await this.model.findOneByRoomId(rid);

		if (!file) {
			return;
		}

		const store = FileUpload.getStoreByName(file.store);

		return store.delete(file._id);
	}

	async _doInsert(fileData: OptionalId<IUpload>, streamOrBuffer: ReadableStream | stream | Buffer): Promise<IUpload> {
		const fileId = await this.store.create(fileData);
		const tmpFile = UploadFS.getTempFilePath(fileId);

		try {
			if (streamOrBuffer instanceof stream) {
				streamOrBuffer.pipe(fs.createWriteStream(tmpFile));
			} else if (streamOrBuffer instanceof Buffer) {
				fs.writeFileSync(tmpFile, streamOrBuffer);
			} else {
				throw new Error('Invalid file type');
			}

			const file = await ufsComplete(fileId, this.name);

			return file;
		} catch (e: any) {
			throw e;
		}
	}

	async insert(fileData: OptionalId<IUpload>, streamOrBuffer: ReadableStream | stream.Readable | Buffer) {
		if (streamOrBuffer instanceof stream) {
			streamOrBuffer = await streamToBuffer(streamOrBuffer);
		}

		if (streamOrBuffer instanceof Uint8Array) {
			// Services compat :)
			streamOrBuffer = Buffer.from(streamOrBuffer);
		}

		// Check if the fileData matches store filter
		const filter = this.store.getFilter();
		if (filter?.check) {
			await filter.check(fileData, streamOrBuffer);
		}
		const uploadedFile = await this._doInsert(fileData, streamOrBuffer);
		return uploadedFile;
	}
}
