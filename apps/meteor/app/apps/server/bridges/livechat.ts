import { Random } from '@rocket.chat/random';
import { LivechatBridge } from '@rocket.chat/apps-engine/server/bridges/LivechatBridge';
import type {
	ILivechatMessage,
	IVisitor,
	ILivechatRoom,
	ILivechatTransferData,
	IDepartment,
} from '@rocket.chat/apps-engine/definition/livechat';
import type { IUser } from '@rocket.chat/apps-engine/definition/users';
import type { IMessage } from '@rocket.chat/apps-engine/definition/messages';
import type { IExtraRoomParams } from '@rocket.chat/apps-engine/definition/accessors/ILivechatCreator';
import { OmnichannelSourceType } from '@rocket.chat/core-typings';
import { LivechatVisitors, LivechatRooms, LivechatDepartment, Users } from '@rocket.chat/models';

import { getRoom } from '../../../livechat/server/api/lib/livechat';
import { Livechat } from '../../../livechat/server/lib/Livechat';
import type { AppServerOrchestrator } from '../../../../ee/server/apps/orchestrator';
import { Livechat as LivechatTyped } from '../../../livechat/server/lib/LivechatTyped';

export class AppLivechatBridge extends LivechatBridge {
	// eslint-disable-next-line no-empty-function
	constructor(private readonly orch: AppServerOrchestrator) {
		super();
	}

	protected isOnline(departmentId?: string): boolean {
		// Depends on apps engine separation to microservices
		return Promise.await(Livechat.online(departmentId));
	}

	protected async isOnlineAsync(departmentId?: string): Promise<boolean> {
		return Livechat.online(departmentId);
	}

	protected async createMessage(message: ILivechatMessage, appId: string): Promise<string> {
		this.orch.debugLog(`The App ${appId} is creating a new message.`);

		if (!message.token) {
			throw new Error('Invalid token for livechat message');
		}

		const msg = await Livechat.sendMessage({
			guest: this.orch.getConverters()?.get('visitors').convertAppVisitor(message.visitor),
			message: await this.orch.getConverters()?.get('messages').convertAppMessage(message),
			agent: undefined,
			roomInfo: {
				source: {
					type: OmnichannelSourceType.APP,
					id: appId,
					alias: this.orch.getManager()?.getOneById(appId)?.getNameSlug(),
				},
			},
		});

		return msg._id;
	}

	protected async getMessageById(messageId: string, appId: string): Promise<ILivechatMessage> {
		this.orch.debugLog(`The App ${appId} is getting the message: "${messageId}"`);

		return this.orch.getConverters()?.get('messages').convertById(messageId);
	}

	protected async updateMessage(message: ILivechatMessage, appId: string): Promise<void> {
		this.orch.debugLog(`The App ${appId} is updating a message.`);

		const data = {
			guest: message.visitor,
			message: await this.orch.getConverters()?.get('messages').convertAppMessage(message),
		};

		await Livechat.updateMessage(data);
	}

	protected async createRoom(visitor: IVisitor, agent: IUser, appId: string, extraParams?: IExtraRoomParams): Promise<ILivechatRoom> {
		this.orch.debugLog(`The App ${appId} is creating a livechat room.`);

		const { source } = extraParams || {};
		// `source` will likely have the properties below, so we tell TS it's alright
		const { sidebarIcon, defaultIcon, label } = (source || {}) as {
			sidebarIcon?: string;
			defaultIcon?: string;
			label?: string;
		};

		let agentRoom;
		if (agent?.id) {
			const user = await Users.getAgentInfo(agent.id);
			agentRoom = Object.assign({}, { agentId: user?._id, username: user?.username });
		}

		const result = await getRoom({
			guest: this.orch.getConverters()?.get('visitors').convertAppVisitor(visitor),
			agent: agentRoom,
			rid: Random.id(),
			roomInfo: {
				source: {
					type: OmnichannelSourceType.APP,
					id: appId,
					alias: this.orch.getManager()?.getOneById(appId)?.getName(),
					label,
					sidebarIcon,
					defaultIcon,
				},
			},
			extraParams: undefined,
		});

		return this.orch.getConverters()?.get('rooms').convertRoom(result.room);
	}

	protected async closeRoom(room: ILivechatRoom, comment: string, closer: IUser | undefined, appId: string): Promise<boolean> {
		this.orch.debugLog(`The App ${appId} is closing a livechat room.`);

		const user = closer && this.orch.getConverters()?.get('users').convertToRocketChat(closer);
		const visitor = this.orch.getConverters()?.get('visitors').convertAppVisitor(room.visitor);

		const closeData: any = {
			room: await this.orch.getConverters()?.get('rooms').convertAppRoom(room),
			comment,
			...(user && { user }),
			...(visitor && { visitor }),
		};

		await LivechatTyped.closeRoom(closeData);

		return true;
	}

	protected async findRooms(visitor: IVisitor, departmentId: string | null, appId: string): Promise<Array<ILivechatRoom>> {
		this.orch.debugLog(`The App ${appId} is looking for livechat visitors.`);

		if (!visitor) {
			return [];
		}

		let result;

		if (departmentId) {
			result = await LivechatRooms.findOpenByVisitorTokenAndDepartmentId(visitor.token, departmentId, {}).toArray();
		} else {
			result = await LivechatRooms.findOpenByVisitorToken(visitor.token, {}).toArray();
		}

		return Promise.all((result as unknown as ILivechatRoom[]).map((room) => this.orch.getConverters()?.get('rooms').convertRoom(room)));
	}

	protected async createVisitor(visitor: IVisitor, appId: string): Promise<string> {
		this.orch.debugLog(`The App ${appId} is creating a livechat visitor.`);

		const registerData = {
			department: visitor.department,
			username: visitor.username,
			name: visitor.name,
			token: visitor.token,
			email: '',
			connectionData: undefined,
			phone: {},
			id: visitor.id,
		};

		if (visitor.visitorEmails?.length) {
			registerData.email = visitor.visitorEmails[0].address;
		}

		if (visitor.phone?.length) {
			(registerData as any).phone = { number: visitor.phone[0].phoneNumber };
		}

		return Livechat.registerGuest(registerData);
	}

	protected async transferVisitor(visitor: IVisitor, transferData: ILivechatTransferData, appId: string): Promise<boolean> {
		this.orch.debugLog(`The App ${appId} is transfering a livechat.`);

		if (!visitor) {
			throw new Error('Invalid visitor, cannot transfer');
		}

		const { targetAgent, targetDepartment: departmentId, currentRoom } = transferData;

		const appUser = await Users.findOneByAppId(appId, {});
		if (!appUser) {
			throw new Error('Invalid app user, cannot transfer');
		}
		const { _id, username, name, type } = appUser;
		const transferredBy = {
			_id,
			username,
			name,
			type,
		};

		let userId;
		let transferredTo;

		if (targetAgent?.id) {
			transferredTo = await Users.findOneAgentById(targetAgent.id, {
				projection: { _id: 1, username: 1, name: 1 },
			});
			if (!transferredTo) {
				throw new Error('Invalid target agent, cannot transfer');
			}

			userId = transferredTo._id;
		}

		return Livechat.transfer(
			await this.orch.getConverters()?.get('rooms').convertAppRoom(currentRoom),
			this.orch.getConverters()?.get('visitors').convertAppVisitor(visitor),
			{ userId, departmentId, transferredBy, transferredTo },
		);
	}

	protected async findVisitors(query: object, appId: string): Promise<Array<IVisitor>> {
		this.orch.debugLog(`The App ${appId} is looking for livechat visitors.`);

		if (this.orch.isDebugging()) {
			console.warn('The method AppLivechatBridge.findVisitors is deprecated. Please consider using its alternatives');
		}

		return Promise.all(
			(await LivechatVisitors.find(query).toArray()).map(
				async (visitor) => visitor && this.orch.getConverters()?.get('visitors').convertVisitor(visitor),
			),
		);
	}

	protected async findVisitorById(id: string, appId: string): Promise<IVisitor | undefined> {
		this.orch.debugLog(`The App ${appId} is looking for livechat visitors.`);

		return this.orch.getConverters()?.get('visitors').convertById(id);
	}

	protected async findVisitorByEmail(email: string, appId: string): Promise<IVisitor | undefined> {
		this.orch.debugLog(`The App ${appId} is looking for livechat visitors.`);

		return this.orch
			.getConverters()
			?.get('visitors')
			.convertVisitor(await LivechatVisitors.findOneGuestByEmailAddress(email));
	}

	protected async findVisitorByToken(token: string, appId: string): Promise<IVisitor | undefined> {
		this.orch.debugLog(`The App ${appId} is looking for livechat visitors.`);

		return this.orch
			.getConverters()
			?.get('visitors')
			.convertVisitor(await LivechatVisitors.getVisitorByToken(token, {}));
	}

	protected async findVisitorByPhoneNumber(phoneNumber: string, appId: string): Promise<IVisitor | undefined> {
		this.orch.debugLog(`The App ${appId} is looking for livechat visitors.`);

		return this.orch
			.getConverters()
			?.get('visitors')
			.convertVisitor(await LivechatVisitors.findOneVisitorByPhone(phoneNumber));
	}

	protected async findDepartmentByIdOrName(value: string, appId: string): Promise<IDepartment | undefined> {
		this.orch.debugLog(`The App ${appId} is looking for livechat departments.`);

		return this.orch
			.getConverters()
			?.get('departments')
			.convertDepartment(await LivechatDepartment.findOneByIdOrName(value, {}));
	}

	protected async findDepartmentsEnabledWithAgents(appId: string): Promise<Array<IDepartment>> {
		this.orch.debugLog(`The App ${appId} is looking for livechat departments.`);

		const converter = this.orch.getConverters()?.get('departments');
		const boundConverter = converter.convertDepartment.bind(converter);

		return Promise.all((await LivechatDepartment.findEnabledWithAgents().toArray()).map(boundConverter));
	}

	protected async _fetchLivechatRoomMessages(appId: string, roomId: string): Promise<Array<IMessage>> {
		this.orch.debugLog(`The App ${appId} is getting the transcript for livechat room ${roomId}.`);
		const messageConverter = this.orch.getConverters()?.get('messages');

		if (!messageConverter) {
			throw new Error('Could not get the message converter to process livechat room messages');
		}

		const boundMessageConverter = messageConverter.convertMessage.bind(messageConverter);

		return (await Livechat.getRoomMessages({ rid: roomId })).map(boundMessageConverter);
	}

	protected async setCustomFields(
		data: { token: IVisitor['token']; key: string; value: string; overwrite: boolean },
		appId: string,
	): Promise<number> {
		this.orch.debugLog(`The App ${appId} is setting livechat visitor's custom fields.`);

		return Livechat.setCustomFields(data);
	}
}
