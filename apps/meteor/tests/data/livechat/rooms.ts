import faker from '@faker-js/faker';
import type {
	IInquiry,
	ILivechatAgent,
	ILivechatDepartment,
	ILivechatVisitor,
	IMessage,
	IOmnichannelRoom,
} from '@rocket.chat/core-typings';
import { api, credentials, methodCall, request } from '../api-data';
import { updatePermission } from '../permissions.helper';
import { adminUsername } from '../user';
import { getRandomVisitorToken } from './users';
import type { DummyResponse } from './utils';

export const createLivechatRoom = async (visitorToken: string, extraRoomParams?: Record<string, string>): Promise<IOmnichannelRoom> => {
	const urlParams = new URLSearchParams();
	urlParams.append('token', visitorToken);
	if (extraRoomParams) {
		for (const [key, value] of Object.entries(extraRoomParams)) {
			urlParams.append(key, value);
		}
	}

	const response = await request
		.get(api(`livechat/room?${urlParams.toString()}`))
		.set(credentials)
		.expect(200);

	return response.body.room;
};

export const createVisitor = (department?: string): Promise<ILivechatVisitor> =>
	new Promise((resolve, reject) => {
		const token = getRandomVisitorToken();
		const email = `${token}@${token}.com`;
		const phone = `${Math.floor(Math.random() * 10000000000)}`;
		request.get(api(`livechat/visitor/${token}`)).end((err: Error, res: DummyResponse<ILivechatVisitor>) => {
			if (!err && res && res.body && res.body.visitor) {
				return resolve(res.body.visitor);
			}
			request
				.post(api('livechat/visitor'))
				.set(credentials)
				.send({
					visitor: {
						name: `Visitor ${Date.now()}`,
						email,
						token,
						phone,
						customFields: [{ key: 'address', value: 'Rocket.Chat street', overwrite: true }],
						...(department ? { department } : {}),
					},
				})
				.end((err: Error, res: DummyResponse<ILivechatVisitor>) => {
					if (err) {
						return reject(err);
					}
					resolve(res.body.visitor);
				});
		});
	});

export const takeInquiry = (roomId: string, agentCredentials?: object): Promise<IOmnichannelRoom> => {
	return new Promise((resolve, reject) => {
		request
			.post(methodCall(`livechat:takeInquiry`))
			.set(agentCredentials || credentials)
			.send({
				message: JSON.stringify({
					method: 'livechat:takeInquiry',
					params: [roomId, { clientAction: true }],
					id: '101',
					msg: 'method',
				}),
			})
			.end((err: Error, res: DummyResponse<IOmnichannelRoom, 'unwrapped'>) => {
				if (err) {
					return reject(err);
				}
				resolve(res.body);
			});
	});
};

export const fetchInquiry = (roomId: string): Promise<IInquiry> => {
	return new Promise((resolve, reject) => {
		request
			.get(api(`livechat/inquiries.getOne?roomId=${roomId}`))
			.set(credentials)
			.end((err: Error, res: DummyResponse<IInquiry>) => {
				if (err) {
					return reject(err);
				}
				resolve(res.body.inquiry);
			});
	});
};

export const createDepartment = (agents?: { agentId: string }[], name?: string): Promise<ILivechatDepartment> => {
	return new Promise((resolve, reject) => {
		request
			.post(api('livechat/department'))
			.set(credentials)
			.send({
				department: {
					name: name || `Department ${Date.now()}`,
					enabled: true,
					showOnOfflineForm: true,
					showOnRegistration: true,
					email: 'a@b.com',
				},
				agents,
			})
			.end((err: Error, res: DummyResponse<ILivechatDepartment>) => {
				if (err) {
					return reject(err);
				}
				resolve(res.body.department);
			});
	});
};

export const deleteDepartment = (departmentId: string): Promise<unknown> => {
	return new Promise((resolve, reject) => {
		request
			.delete(api(`livechat/department/${departmentId}`))
			.set(credentials)
			.send()
			.expect(200)
			.end((err: Error, res: DummyResponse<ILivechatAgent>) => {
				if (err) {
					return reject(err);
				}
				resolve(res.body);
			});
	});
};

export const createAgent = (overrideUsername?: string): Promise<ILivechatAgent> =>
	new Promise((resolve, reject) => {
		request
			.post(api('livechat/users/agent'))
			.set(credentials)
			.send({
				username: overrideUsername || adminUsername,
			})
			.end((err: Error, res: DummyResponse<ILivechatAgent>) => {
				if (err) {
					return reject(err);
				}
				resolve(res.body.user);
			});
	});

export const createManager = (): Promise<ILivechatAgent> =>
	new Promise((resolve, reject) => {
		request
			.post(api('livechat/users/manager'))
			.set(credentials)
			.send({
				username: adminUsername,
			})
			.end((err: Error, res: DummyResponse<ILivechatAgent>) => {
				if (err) {
					return reject(err);
				}
				resolve(res.body.user);
			});
	});

export const makeAgentAvailable = async (overrideCredentials?: { 'X-Auth-Token': string; 'X-User-Id': string }): Promise<void> => {
	await updatePermission('view-l-room', ['livechat-agent', 'livechat-manager', 'admin']);
	await request
		.post(api('users.setStatus'))
		.set(overrideCredentials || credentials)
		.send({
			message: '',
			status: 'online',
		})
		.expect(200);

	await request
		.post(api('livechat/agent.status'))
		.set(overrideCredentials || credentials)
		.send({
			status: 'available',
		})
		.expect(200);
};

export const makeAgentUnavailable = async (overrideCredentials?: { 'X-Auth-Token': string; 'X-User-Id': string }): Promise<void> => {
	await request
		.post(api('users.setStatus'))
		.set(overrideCredentials || credentials)
		.send({ message: '', status: 'offline' })
		.expect(200);
	await request
		.post(api('livechat/agent.status'))
		.set(overrideCredentials || credentials)
		.send({
			status: 'not-available',
		})
		.expect(200);
};

export const getLivechatRoomInfo = (roomId: string): Promise<IOmnichannelRoom> => {
	return new Promise((resolve /* , reject*/) => {
		request
			.get(api('channels.info'))
			.set(credentials)
			.query({
				roomId,
			})
			.end((_err: Error, res: DummyResponse<IOmnichannelRoom>) => {
				resolve(res.body.channel);
			});
	});
};

export const sendMessage = (roomId: string, message: string, visitorToken: string): Promise<IMessage> => {
	return new Promise((resolve, reject) => {
		request
			.post(api('livechat/message'))
			.set(credentials)
			.send({
				rid: roomId,
				msg: message,
				token: visitorToken,
			})
			.end((err: Error, res: DummyResponse<IMessage>) => {
				if (err) {
					return reject(err);
				}
				resolve(res.body.message);
			});
	});
};

// Sends a message using sendMessage method from agent
export const sendAgentMessage = (roomId: string): Promise<IMessage> => {
	return new Promise((resolve, reject) => {
		request
			.post(methodCall('sendMessage'))
			.set(credentials)
			.send({
				message: JSON.stringify({
					method: 'sendMessage',
					params: [{ rid: roomId, msg: faker.lorem.sentence() }],
					id: 'id',
					msg: 'method',
				}),
			})
			.end((err: Error, res: DummyResponse<IMessage, 'wrapped'>) => {
				if (err) {
					return reject(err);
				}
				resolve(res.body.result);
			});
	});
};

export const fetchMessages = (roomId: string, visitorToken: string): Promise<IMessage[]> => {
	return new Promise((resolve, reject) => {
		request
			.get(api(`livechat/messages.history/${roomId}`))
			.set(credentials)
			.query({
				token: visitorToken,
			})
			.end((err: Error, res: DummyResponse<IMessage[]>) => {
				if (err) {
					return reject(err);
				}
				resolve(res.body.messages);
			});
	});
};

export const closeOmnichanelRoom = async (roomId: string): Promise<void> => {
	await request.post(api('livechat/room.closeByUser')).set(credentials).send({ rid: roomId }).expect(200);
};

export const bulkCreateLivechatRooms = async (
	amount: number,
	department?: string,
	resolveRoomExtraParams?: (index: number) => Record<string, string> | undefined,
): Promise<IOmnichannelRoom[]> => {
	const rooms: IOmnichannelRoom[] = [];

	for (let i = 0; i < amount; i++) {
		const visitor = await createVisitor(department);
		const extraRoomParams = resolveRoomExtraParams ? resolveRoomExtraParams(i) : {};

		const room = await createLivechatRoom(visitor.token, extraRoomParams);

		rooms.push(room);
	}

	return rooms;
};

export const startANewLivechatRoomAndTakeIt = async (): Promise<{ room: IOmnichannelRoom; visitor: ILivechatVisitor }> => {
	const visitor = await createVisitor();
	const room = await createLivechatRoom(visitor.token);
	const { _id: roomId } = room;
	const inq = await fetchInquiry(roomId);
	await takeInquiry(inq._id);
	await sendMessage(roomId, 'test message', visitor.token);

	return { room, visitor };
};
