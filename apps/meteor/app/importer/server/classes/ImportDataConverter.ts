import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ObjectId } from 'mongodb';
import type {
	IImportUser,
	IImportMessage,
	IImportMessageReaction,
	IImportChannel,
	IImportUserRecord,
	IImportChannelRecord,
	IImportMessageRecord,
	IUser,
	IUserEmail,
	IImportData,
	IImportRecordType,
	IMessage as IDBMessage,
} from '@rocket.chat/core-typings';
import { ImportData, Rooms, Users, Subscriptions } from '@rocket.chat/models';

import type { IConversionCallbacks } from '../definitions/IConversionCallbacks';
import { generateUsernameSuggestion, insertMessage, saveUserIdentity, addUserToDefaultChannels } from '../../../lib/server';
import { setUserActiveStatus } from '../../../lib/server/functions/setUserActiveStatus';
import type { Logger } from '../../../../server/lib/logger/Logger';
import { getValidRoomName } from '../../../utils/server/lib/getValidRoomName';

type IRoom = Record<string, any>;
type IMessage = Record<string, any>;
type IUserIdentification = {
	_id: string;
	username: string | undefined;
};
type IMentionedUser = {
	_id: string;
	username: string;
	name?: string;
};
type IMentionedChannel = {
	_id: string;
	name: string;
};

type IMessageReaction = {
	name: string;
	usernames: Array<string>;
};

type IMessageReactions = Record<string, IMessageReaction>;

export type IConverterOptions = {
	flagEmailsAsVerified?: boolean;
	skipExistingUsers?: boolean;
};

const guessNameFromUsername = (username: string): string =>
	username
		.replace(/\W/g, ' ')
		.replace(/\s(.)/g, (u) => u.toUpperCase())
		.replace(/^(.)/, (u) => u.toLowerCase())
		.replace(/^\w/, (u) => u.toUpperCase());

export class ImportDataConverter {
	private _userCache: Map<string, IUserIdentification>;

	// display name uses a different cache because it's only used on mentions so we don't need to load it every time we load an user
	private _userDisplayNameCache: Map<string, string>;

	private _roomCache: Map<string, string>;

	private _roomNameCache: Map<string, string>;

	private _logger: Logger;

	private _options: IConverterOptions;

	public get options(): IConverterOptions {
		return this._options;
	}

	constructor(options?: IConverterOptions) {
		this._options = options || {
			flagEmailsAsVerified: false,
			skipExistingUsers: false,
		};
		this._userCache = new Map();
		this._userDisplayNameCache = new Map();
		this._roomCache = new Map();
		this._roomNameCache = new Map();
	}

	setLogger(logger: Logger): void {
		this._logger = logger;
	}

	addUserToCache(importId: string, _id: string, username: string | undefined): IUserIdentification {
		const cache = {
			_id,
			username,
		};

		this._userCache.set(importId, cache);
		return cache;
	}

	addUserDisplayNameToCache(importId: string, name: string): string {
		this._userDisplayNameCache.set(importId, name);
		return name;
	}

	addRoomToCache(importId: string, rid: string): string {
		this._roomCache.set(importId, rid);
		return rid;
	}

	addRoomNameToCache(importId: string, name: string): string {
		this._roomNameCache.set(importId, name);
		return name;
	}

	addUserDataToCache(userData: IImportUser): void {
		if (!userData._id) {
			return;
		}
		if (!userData.importIds.length) {
			return;
		}

		this.addUserToCache(userData.importIds[0], userData._id, userData.username);
	}

	protected async addObject(type: IImportRecordType, data: IImportData, options: Record<string, any> = {}): Promise<void> {
		await ImportData.col.insertOne({
			_id: new ObjectId().toHexString(),
			data,
			dataType: type,
			...options,
		});
	}

	async addUser(data: IImportUser): Promise<void> {
		await this.addObject('user', data);
	}

	async addChannel(data: IImportChannel): Promise<void> {
		await this.addObject('channel', data);
	}

	async addMessage(data: IImportMessage, useQuickInsert = false): Promise<void> {
		await this.addObject('message', data, {
			useQuickInsert: useQuickInsert || undefined,
		});
	}

	addUserImportId(updateData: Record<string, any>, userData: IImportUser): void {
		if (userData.importIds?.length) {
			updateData.$set.importIds = userData.importIds;
		}
	}

	addUserEmails(updateData: Record<string, any>, userData: IImportUser, existingEmails: Array<IUserEmail>): void {
		if (!userData.emails?.length) {
			return;
		}

		const verifyEmails = Boolean(this.options.flagEmailsAsVerified);
		const newEmailList: Array<IUserEmail> = [];

		for (const email of userData.emails) {
			const verified = verifyEmails || existingEmails.find((ee) => ee.address === email)?.verified || false;

			newEmailList.push({
				address: email,
				verified,
			});
		}

		updateData.$set.emails = newEmailList;
	}

	addUserServices(updateData: Record<string, any>, userData: IImportUser): void {
		if (!userData.services) {
			return;
		}

		for (const serviceKey in userData.services) {
			if (!userData.services[serviceKey]) {
				continue;
			}

			const service = userData.services[serviceKey];

			for (const key in service) {
				if (!service[key]) {
					continue;
				}

				updateData.$set[`services.${serviceKey}.${key}`] = service[key];
			}
		}
	}

	addCustomFields(updateData: Record<string, any>, userData: IImportUser): void {
		if (!userData.customFields) {
			return;
		}

		const subset = (source: Record<string, any>, currentPath: string): void => {
			for (const key in source) {
				if (!source.hasOwnProperty(key)) {
					continue;
				}

				const keyPath = `${currentPath}.${key}`;
				if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
					subset(source[key], keyPath);
					continue;
				}

				updateData.$set = {
					...updateData.$set,
					...{ [keyPath]: source[key] },
				};
			}
		};

		subset(userData.customFields, 'customFields');
	}

	async updateUser(existingUser: IUser, userData: IImportUser): Promise<void> {
		const { _id } = existingUser;

		userData._id = _id;

		if (!userData.roles && !existingUser.roles) {
			userData.roles = ['user'];
		}
		if (!userData.type && !existingUser.type) {
			userData.type = 'user';
		}

		// #ToDo: #TODO: Move this to the model class
		const updateData: Record<string, any> = Object.assign(Object.create(null), {
			$set: Object.assign(Object.create(null), {
				...(userData.roles && { roles: userData.roles }),
				...(userData.type && { type: userData.type }),
				...(userData.statusText && { statusText: userData.statusText }),
				...(userData.bio && { bio: userData.bio }),
				...(userData.services?.ldap && { ldap: true }),
				...(userData.avatarUrl && { _pendingAvatarUrl: userData.avatarUrl }),
				...(userData.employeeID && { employeeID: userData.employeeID }),
				...(userData.adminDisplayName && { adminDisplayName: userData.adminDisplayName }),
				...(userData.telephoneNumber && { telephoneNumber: userData.telephoneNumber }),
				...(userData.pinyinName && { pinyinName: userData.pinyinName }),
				...(userData.employeeStatus && { employeeStatus: userData.employeeStatus }),
				...(userData.employeeType && { employeeType: userData.employeeType }),
				...(userData.workPlaceName && { workPlaceName: userData.workPlaceName }),
				...(userData.jobName && { jobName: userData.jobName }),
				...(userData.sexId && { sexId: userData.sexId }),
			}),
		});

		updateData.$set.updateFlag = 1;
		this.addCustomFields(updateData, userData);
		this.addUserServices(updateData, userData);
		this.addUserImportId(updateData, userData);
		this.addUserEmails(updateData, userData, existingUser.emails || []);

		if (Object.keys(updateData.$set).length === 0) {
			delete updateData.$set;
		}
		if (Object.keys(updateData).length > 0) {
			await Users.updateOne({ _id }, updateData);
		}

		if (userData.utcOffset) {
			await Users.setUtcOffset(_id, userData.utcOffset);
		}

		if (userData.name || userData.username) {
			await saveUserIdentity({ _id, name: userData.name, username: userData.username } as Parameters<typeof saveUserIdentity>[0]);
		}

		if (userData.importIds.length) {
			this.addUserToCache(userData.importIds[0], existingUser._id, existingUser.username || userData.username);
		}
	}

	// TODO
	async insertUser(userData: IImportUser): Promise<IUser> {
		const password = `${Date.now()}${userData.name || ''}${userData.emails.length ? userData.emails[0].toUpperCase() : ''}`;
		const userId = userData.emails.length
			? await Accounts.createUserAsync({
					email: userData.emails[0],
					password,
			  })
			: await Accounts.createUserAsync({
					username: userData.username,
					password,
					joinDefaultChannelsSilenced: true,
			  } as any);

		const user = await Users.findOneById(userId, {});
		if (!user) {
			throw new Error(`User not found: ${userId}`);
		}
		await this.updateUser(user, userData);

		await addUserToDefaultChannels(user, true);
		return user;
	}

	protected async getUsersToImport(): Promise<Array<IImportUserRecord>> {
		return ImportData.getAllUsers().toArray();
	}

	async findExistingUser(data: IImportUser): Promise<IUser | undefined> {
		if (data.emails.length) {
			const emailUser = await Users.findOneByEmailAddress(data.emails[0], {});

			if (emailUser) {
				return emailUser;
			}
		}

		// If we couldn't find one by their email address, try to find an existing user by their username
		if (data.username) {
			return Users.findOneByUsernameIgnoringCase(data.username, {});
		}
	}

	public async convertUsers({ beforeImportFn, afterImportFn }: IConversionCallbacks = {}): Promise<void> {
		const users = (await this.getUsersToImport()) as IImportUserRecord[];
		for await (const { data, _id } of users) {
			try {
				if (beforeImportFn && !(await beforeImportFn(data, 'user'))) {
					await this.skipRecord(_id);
					continue;
				}

				const emails = data.emails.filter(Boolean).map((email) => ({ address: email }));
				data.importIds = data.importIds.filter((item) => item);

				if (!data.emails.length && !data.username) {
					throw new Error('importer-user-missing-email-and-username');
				}

				let existingUser = await this.findExistingUser(data);
				if (existingUser && this._options.skipExistingUsers) {
					await this.skipRecord(_id);
					continue;
				}

				if (!data.username) {
					data.username = await generateUsernameSuggestion({
						name: data.name,
						emails,
					});
				}

				const isNewUser = !existingUser;

				if (existingUser) {
					console.log('existingUser, update:', data);
					await this.updateUser(existingUser, data);
				} else {
					if (!data.name && data.username) {
						data.name = guessNameFromUsername(data.username);
					}
					console.log('newUser, insert:', data);
					existingUser = await this.insertUser(data);
				}

				// Deleted users are 'inactive' users in Rocket.Chat
				// TODO: Check data._id if exists/required or not
				if (data.deleted && existingUser?.active) {
					console.log('inactive user:', data);
					data._id && (await setUserActiveStatus(data._id, false, true));
				} else if (data.deleted === false && existingUser?.active === false) {
					data._id && (await setUserActiveStatus(data._id, true));
				}

				if (afterImportFn) {
					await afterImportFn(data, 'user', isNewUser);
				}
			} catch (e) {
				this._logger.error(e);
				await this.saveError(_id, e instanceof Error ? e : new Error(String(e)));
			}
		}
	}

	protected async saveError(importId: string, error: Error): Promise<void> {
		this._logger.error(error);
		await ImportData.updateOne(
			{
				_id: importId,
			},
			{
				$push: {
					errors: {
						message: error.message,
						stack: error.stack,
					},
				},
			},
		);
	}

	protected async skipRecord(_id: string): Promise<void> {
		await ImportData.updateOne(
			{
				_id,
			},
			{
				$set: {
					skipped: true,
				},
			},
		);
	}

	async convertMessageReactions(importedReactions: Record<string, IImportMessageReaction>): Promise<undefined | IMessageReactions> {
		const reactions: IMessageReactions = {};

		for await (const name of Object.keys(importedReactions)) {
			if (!importedReactions.hasOwnProperty(name)) {
				continue;
			}
			const { users } = importedReactions[name];

			if (!users.length) {
				continue;
			}

			const reaction: IMessageReaction = {
				name,
				usernames: [],
			};

			for await (const importId of users) {
				const username = await this.findImportedUsername(importId);
				if (username && !reaction.usernames.includes(username)) {
					reaction.usernames.push(username);
				}
			}

			if (reaction.usernames.length) {
				reactions[name] = reaction;
			}
		}

		if (Object.keys(reactions).length > 0) {
			return reactions;
		}
	}

	async convertMessageReplies(replies: Array<string>): Promise<Array<string>> {
		const result: Array<string> = [];
		for await (const importId of replies) {
			const userId = await this.findImportedUserId(importId);
			if (userId && !result.includes(userId)) {
				result.push(userId);
			}
		}
		return result;
	}

	async convertMessageMentions(message: IImportMessage): Promise<Array<IMentionedUser> | undefined> {
		const { mentions } = message;
		if (!mentions) {
			return undefined;
		}

		const result: Array<IMentionedUser> = [];
		for await (const importId of mentions) {
			// eslint-disable-next-line no-extra-parens
			if (importId === ('all' as 'string') || importId === 'here') {
				result.push({
					_id: importId,
					username: importId,
				});
				continue;
			}

			// Loading the name will also store the remaining data on the cache if it's missing, so this won't run two queries
			const name = await this.findImportedUserDisplayName(importId);
			const data = await this.findImportedUser(importId);

			if (!data) {
				this._logger.warn(`Mentioned user not found: ${importId}`);
				continue;
			}

			if (!data.username) {
				this._logger.debug(importId);
				throw new Error('importer-message-mentioned-username-not-found');
			}

			message.msg = message.msg.replace(new RegExp(`\@${importId}`, 'gi'), `@${data.username}`);

			result.push({
				_id: data._id,
				username: data.username as 'string',
				name,
			});
		}
		return result;
	}

	async getMentionedChannelData(importId: string): Promise<IMentionedChannel | undefined> {
		// loading the name will also store the id on the cache if it's missing, so this won't run two queries
		const name = await this.findImportedRoomName(importId);
		const _id = await this.findImportedRoomId(importId);

		if (name && _id) {
			return {
				name,
				_id,
			};
		}

		// If the importId was not found, check if we have a room with that name
		const roomName = await getValidRoomName(importId.trim(), undefined, { allowDuplicates: true });
		const room = await Rooms.findOneByNonValidatedName(roomName, { projection: { name: 1 } });
		if (room?.name) {
			this.addRoomToCache(importId, room._id);
			this.addRoomNameToCache(importId, room.name);

			return {
				name: room.name,
				_id: room._id,
			};
		}
	}

	async convertMessageChannels(message: IImportMessage): Promise<IMentionedChannel[] | undefined> {
		const { channels } = message;
		if (!channels) {
			return;
		}

		const result: Array<IMentionedChannel> = [];
		for await (const importId of channels) {
			const { name, _id } = (await this.getMentionedChannelData(importId)) || {};

			if (!_id || !name) {
				this._logger.warn(`Mentioned room not found: ${importId}`);
				continue;
			}

			message.msg = message.msg.replace(new RegExp(`\#${importId}`, 'gi'), `#${name}`);

			result.push({
				_id,
				name,
			});
		}

		return result;
	}

	protected async getMessagesToImport(): Promise<Array<IImportMessageRecord>> {
		return ImportData.getAllMessages().toArray();
	}

	async convertMessages({ beforeImportFn, afterImportFn }: IConversionCallbacks = {}): Promise<void> {
		const rids: Array<string> = [];
		const messages = await this.getMessagesToImport();

		for await (const { data, _id } of messages) {
			try {
				if (beforeImportFn && !(await beforeImportFn(data, 'message'))) {
					await this.skipRecord(_id);
					continue;
				}

				if (!data.ts || isNaN(data.ts as unknown as number)) {
					throw new Error('importer-message-invalid-timestamp');
				}

				const creator = await this.findImportedUser(data.u._id);
				if (!creator) {
					this._logger.warn(`Imported user not found: ${data.u._id}`);
					throw new Error('importer-message-unknown-user');
				}

				const rid = await this.findImportedRoomId(data.rid);
				if (!rid) {
					throw new Error('importer-message-unknown-room');
				}
				if (!rids.includes(rid)) {
					rids.push(rid);
				}

				// Convert the mentions and channels first because these conversions can also modify the msg in the message object
				const mentions = data.mentions && (await this.convertMessageMentions(data));
				const channels = data.channels && (await this.convertMessageChannels(data));

				const msgObj: IMessage = {
					rid,
					u: {
						_id: creator._id,
						username: creator.username,
					},
					msg: data.msg,
					ts: data.ts,
					t: data.t || undefined,
					groupable: data.groupable,
					tmid: data.tmid,
					tlm: data.tlm,
					tcount: data.tcount,
					replies: data.replies && (await this.convertMessageReplies(data.replies)),
					editedAt: data.editedAt,
					editedBy: data.editedBy && ((await this.findImportedUser(data.editedBy)) || undefined),
					mentions,
					channels,
					_importFile: data._importFile,
					url: data.url,
					attachments: data.attachments,
					bot: data.bot,
					emoji: data.emoji,
					alias: data.alias,
				};

				if (data._id) {
					msgObj._id = data._id;
				}

				if (data.reactions) {
					msgObj.reactions = await this.convertMessageReactions(data.reactions);
				}

				try {
					await insertMessage(creator, msgObj as unknown as IDBMessage, rid, true);
				} catch (e) {
					this._logger.warn(`Failed to import message with timestamp ${String(msgObj.ts)} to room ${rid}`);
					this._logger.error(e);
				}

				if (afterImportFn) {
					await afterImportFn(data, 'message', true);
				}
			} catch (e) {
				await this.saveError(_id, e instanceof Error ? e : new Error(String(e)));
			}
		}

		for await (const rid of rids) {
			try {
				await Rooms.resetLastMessageById(rid);
			} catch (e) {
				this._logger.warn(`Failed to update last message of room ${rid}`);
				this._logger.error(e);
			}
		}
	}

	async updateRoom(room: IRoom, roomData: IImportChannel, startedByUserId: string): Promise<void> {
		roomData._id = room._id;

		// eslint-disable-next-line no-extra-parens
		if ((roomData._id as string).toUpperCase() === 'GENERAL' && roomData.name !== room.name) {
			await Meteor.runAsUser(startedByUserId, async () => {
				await Meteor.callAsync('saveRoomSettings', 'GENERAL', 'roomName', roomData.name);
			});
		}

		await this.updateRoomId(room._id, roomData);
	}

	public async findDMForImportedUsers(...users: Array<string>): Promise<IImportChannel | undefined> {
		const record = await ImportData.findDMForImportedUsers(...users);
		if (record) {
			return record.data;
		}
	}

	async findImportedRoomId(importId: string): Promise<string | null> {
		if (this._roomCache.has(importId)) {
			return this._roomCache.get(importId) as string;
		}

		const options = {
			projection: {
				_id: 1,
			},
		};

		const room = await Rooms.findOneByImportId(importId, options);
		if (room) {
			return this.addRoomToCache(importId, room._id);
		}

		return null;
	}

	async findImportedRoomName(importId: string): Promise<string | undefined> {
		if (this._roomNameCache.has(importId)) {
			return this._roomNameCache.get(importId) as string;
		}

		const options = {
			projection: {
				_id: 1,
				name: 1,
			},
		};

		const room = await Rooms.findOneByImportId(importId, options);
		if (room) {
			if (!this._roomCache.has(importId)) {
				this.addRoomToCache(importId, room._id);
			}
			if (room?.name) {
				return this.addRoomNameToCache(importId, room.name);
			}
		}
	}

	async findImportedUser(importId: string): Promise<IUserIdentification | null> {
		const options = {
			projection: {
				_id: 1,
				username: 1,
			},
		};

		if (importId === 'rocket.cat') {
			return {
				_id: 'rocket.cat',
				username: 'rocket.cat',
			};
		}

		if (this._userCache.has(importId)) {
			return this._userCache.get(importId) as IUserIdentification;
		}

		const user = await Users.findOneByImportId(importId, options);
		if (user) {
			return this.addUserToCache(importId, user._id, user.username);
		}

		return null;
	}

	async findImportedUserId(_id: string): Promise<string | undefined> {
		const data = await this.findImportedUser(_id);
		return data?._id;
	}

	async findImportedUsername(_id: string): Promise<string | undefined> {
		const data = await this.findImportedUser(_id);
		return data?.username;
	}

	async findImportedUserDisplayName(importId: string): Promise<string | undefined> {
		const options = {
			projection: {
				_id: 1,
				name: 1,
				username: 1,
			},
		};

		if (this._userDisplayNameCache.has(importId)) {
			return this._userDisplayNameCache.get(importId);
		}

		const user =
			importId === 'rocket.cat' ? await Users.findOneById('rocket.cat', options) : await Users.findOneByImportId(importId, options);
		if (user) {
			if (!this._userCache.has(importId)) {
				this.addUserToCache(importId, user._id, user.username);
			}

			if (!user.name) {
				return;
			}

			return this.addUserDisplayNameToCache(importId, user.name);
		}
	}

	async updateRoomId(_id: string, roomData: IImportChannel): Promise<void> {
		const set = {
			ts: roomData.ts,
			topic: roomData.topic,
			description: roomData.description,
		};

		const roomUpdate: { $set?: Record<string, any>; $addToSet?: Record<string, any> } = {};

		if (Object.keys(set).length > 0) {
			roomUpdate.$set = set;
		}

		if (roomData.importIds.length) {
			roomUpdate.$addToSet = {
				importIds: {
					$each: roomData.importIds,
				},
			};
		}

		if (roomUpdate.$set || roomUpdate.$addToSet) {
			await Rooms.updateOne({ _id: roomData._id }, roomUpdate);
		}
	}

	async getRoomCreatorId(roomData: IImportChannel, startedByUserId: string): Promise<string> {
		if (roomData.u) {
			const creatorId = await this.findImportedUserId(roomData.u._id);
			if (creatorId) {
				return creatorId;
			}

			if (roomData.t !== 'd') {
				return startedByUserId;
			}

			throw new Error('importer-channel-invalid-creator');
		}

		if (roomData.t === 'd') {
			for await (const member of roomData.users) {
				const userId = await this.findImportedUserId(member);
				if (userId) {
					return userId;
				}
			}
		}

		throw new Error('importer-channel-invalid-creator');
	}

	async insertRoom(roomData: IImportChannel, startedByUserId: string): Promise<void> {
		// Find the rocketchatId of the user who created this channel
		const creatorId = await this.getRoomCreatorId(roomData, startedByUserId);
		const members = await this.convertImportedIdsToUsernames(roomData.users, roomData.t !== 'd' ? creatorId : undefined);

		if (roomData.t === 'd') {
			if (members.length < roomData.users.length) {
				this._logger.warn(`One or more imported users not found: ${roomData.users}`);
				throw new Error('importer-channel-missing-users');
			}
		}

		// Create the channel
		try {
			await Meteor.runAsUser(creatorId, async () => {
				const roomInfo =
					roomData.t === 'd'
						? await Meteor.callAsync('createDirectMessage', ...members)
						: await Meteor.callAsync(roomData.t === 'p' ? 'createPrivateGroup' : 'createChannel', roomData.name, members);

				roomData._id = roomInfo.rid;
			});
		} catch (e) {
			this._logger.warn({ msg: 'Failed to create new room', name: roomData.name, members });
			this._logger.error(e);
			throw e;
		}

		await this.updateRoomId(roomData._id as 'string', roomData);
	}

	async convertImportedIdsToUsernames(importedIds: Array<string>, idToRemove: string | undefined = undefined): Promise<Array<string>> {
		return (
			await Promise.all(
				importedIds.map(async (user) => {
					if (user === 'rocket.cat') {
						return user;
					}

					if (this._userCache.has(user)) {
						const cache = this._userCache.get(user);
						if (cache) {
							return cache.username;
						}
					}

					const obj = await Users.findOneByImportId(user, { projection: { _id: 1, username: 1 } });
					if (obj) {
						this.addUserToCache(user, obj._id, obj.username);

						if (idToRemove && obj._id === idToRemove) {
							return false;
						}

						return obj.username;
					}

					return false;
				}),
			)
		).filter((user) => user) as string[];
	}

	async findExistingRoom(data: IImportChannel): Promise<IRoom | null> {
		if (data._id && data._id.toUpperCase() === 'GENERAL') {
			const room = await Rooms.findOneById('GENERAL', {});
			// Prevent the importer from trying to create a new general
			if (!room) {
				throw new Error('importer-channel-general-not-found');
			}

			return room;
		}

		if (data.t === 'd') {
			const users = await this.convertImportedIdsToUsernames(data.users);
			if (users.length !== data.users.length) {
				throw new Error('importer-channel-missing-users');
			}

			return Rooms.findDirectRoomContainingAllUsernames(users, {});
		}

		if (!data.name) {
			return null;
		}

		const roomName = await getValidRoomName(data.name.trim(), undefined, { allowDuplicates: true });
		return Rooms.findOneByNonValidatedName(roomName, {});
	}

	protected async getChannelsToImport(): Promise<Array<IImportChannelRecord>> {
		return ImportData.getAllChannels().toArray();
	}

	async convertChannels(startedByUserId: string, { beforeImportFn, afterImportFn }: IConversionCallbacks = {}): Promise<void> {
		const channels = await this.getChannelsToImport();
		for await (const { data, _id } of channels) {
			try {
				if (beforeImportFn && !(await beforeImportFn(data, 'channel'))) {
					await this.skipRecord(_id);
					continue;
				}

				if (!data.name && data.t !== 'd') {
					throw new Error('importer-channel-missing-name');
				}

				data.importIds = data.importIds.filter((item) => item);
				data.users = [...new Set(data.users)];

				if (!data.importIds.length) {
					throw new Error('importer-channel-missing-import-id');
				}

				const existingRoom = await this.findExistingRoom(data);

				if (existingRoom) {
					await this.updateRoom(existingRoom, data, startedByUserId);
				} else {
					await this.insertRoom(data, startedByUserId);
				}

				if (data.archived && data._id) {
					await this.archiveRoomById(data._id);
				}

				if (afterImportFn) {
					await afterImportFn(data, 'channel', !existingRoom);
				}
			} catch (e) {
				await this.saveError(_id, e instanceof Error ? e : new Error(String(e)));
			}
		}
	}

	async archiveRoomById(rid: string) {
		await Rooms.archiveById(rid);
		await Subscriptions.archiveByRoomId(rid);
	}

	async convertData(startedByUserId: string, callbacks: IConversionCallbacks = {}): Promise<void> {
		await this.convertUsers(callbacks);
		await this.convertChannels(startedByUserId, callbacks);
		await this.convertMessages(callbacks);

		process.nextTick(async () => {
			await this.clearSuccessfullyImportedData();
		});
	}

	public async clearImportData(): Promise<void> {
		// Using raw collection since its faster
		await ImportData.col.deleteMany({});
	}

	async clearSuccessfullyImportedData(): Promise<void> {
		await ImportData.col.deleteMany({
			errors: {
				$exists: false,
			},
		});
	}
}
