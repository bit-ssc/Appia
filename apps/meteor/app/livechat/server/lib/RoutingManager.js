import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { LivechatInquiry, LivechatRooms, Subscriptions, Rooms, Users } from '@rocket.chat/models';
import { Message } from '@rocket.chat/core-services';

import {
	createLivechatSubscription,
	dispatchAgentDelegated,
	dispatchInquiryQueued,
	forwardRoomToAgent,
	forwardRoomToDepartment,
	removeAgentFromSubscription,
	updateChatDepartment,
	allowAgentSkipQueue,
} from './Helper';
import { callbacks } from '../../../../lib/callbacks';
import { Logger } from '../../../../server/lib/logger/Logger';
import { Apps, AppEvents } from '../../../../ee/server/apps';

const logger = new Logger('RoutingManager');

export const RoutingManager = {
	methodName: null,
	methods: {},

	startQueue() {
		// todo: move to eventemitter or middleware
		// queue shouldn't start on CE
	},

	isMethodSet() {
		return !!this.methodName;
	},

	setMethodNameAndStartQueue(name) {
		logger.debug(`Changing default routing method from ${this.methodName} to ${name}`);
		if (!this.methods[name]) {
			logger.warn(`Cannot change routing method to ${name}. Selected Routing method does not exists. Defaulting to Manual_Selection`);
			this.methodName = 'Manual_Selection';
		} else {
			this.methodName = name;
		}

		this.startQueue();
	},

	registerMethod(name, Method) {
		logger.debug(`Registering new routing method with name ${name}`);
		this.methods[name] = new Method();
	},

	getMethod() {
		if (!this.methods[this.methodName]) {
			throw new Meteor.Error('error-routing-method-not-available');
		}
		return this.methods[this.methodName];
	},

	getConfig() {
		return this.getMethod().config || {};
	},

	async getNextAgent(department, ignoreAgentId) {
		logger.debug(`Getting next available agent with method ${this.methodName}`);
		return this.getMethod().getNextAgent(department, ignoreAgentId);
	},

	async delegateInquiry(inquiry, agent, options = {}) {
		const { department, rid } = inquiry;
		logger.debug(`Attempting to delegate inquiry ${inquiry._id}`);
		if (!agent || (agent.username && !(await Users.findOneOnlineAgentByUserList(agent.username)) && !(await allowAgentSkipQueue(agent)))) {
			logger.debug(`Agent offline or invalid. Using routing method to get next agent for inquiry ${inquiry._id}`);
			agent = await this.getNextAgent(department);
			logger.debug(`Routing method returned agent ${agent && agent.agentId} for inquiry ${inquiry._id}`);
		}

		if (!agent) {
			logger.debug(`No agents available. Unable to delegate inquiry ${inquiry._id}`);
			return LivechatRooms.findOneById(rid);
		}

		logger.debug(`Inquiry ${inquiry._id} will be taken by agent ${agent.agentId}`);
		return this.takeInquiry(inquiry, agent, options);
	},

	async assignAgent(inquiry, agent) {
		check(
			agent,
			Match.ObjectIncluding({
				agentId: String,
				username: String,
			}),
		);

		logger.debug(`Assigning agent ${agent.agentId} to inquiry ${inquiry._id}`);

		const { rid, name, v, department } = inquiry;
		if (!(await createLivechatSubscription(rid, name, v, agent, department))) {
			logger.debug(`Cannot assign agent to inquiry ${inquiry._id}: Cannot create subscription`);
			throw new Meteor.Error('error-creating-subscription', 'Error creating subscription');
		}

		await LivechatRooms.changeAgentByRoomId(rid, agent);
		await Rooms.incUsersCountById(rid);

		const user = await Users.findOneById(agent.agentId);
		const room = await LivechatRooms.findOneById(rid);

		await Message.saveSystemMessage('command', rid, 'connected', user);

		await dispatchAgentDelegated(rid, agent.agentId);
		logger.debug(`Agent ${agent.agentId} assigned to inquriy ${inquiry._id}. Instances notified`);

		Apps.getBridges().getListenerBridge().livechatEvent(AppEvents.IPostLivechatAgentAssigned, { room, user });
		return inquiry;
	},

	async unassignAgent(inquiry, departmentId) {
		const { rid, department } = inquiry;
		const room = await LivechatRooms.findOneById(rid);

		logger.debug(`Removing assignations of inquiry ${inquiry._id}`);
		if (!room || !room.open) {
			logger.debug(`Cannot unassign agent from inquiry ${inquiry._id}: Room already closed`);
			return false;
		}

		if (departmentId && departmentId !== department) {
			logger.debug(`Switching department for inquiry ${inquiry._id} [Current: ${department} | Next: ${departmentId}]`);
			await updateChatDepartment({
				rid,
				newDepartmentId: departmentId,
				oldDepartmentId: department,
			});
			// Fake the department to delegate the inquiry;
			inquiry.department = departmentId;
		}

		const { servedBy } = room;

		if (servedBy) {
			logger.debug(`Unassigning current agent for inquiry ${inquiry._id}`);
			await LivechatRooms.removeAgentByRoomId(rid);
			await this.removeAllRoomSubscriptions(room);
			await dispatchAgentDelegated(rid, null);
		}

		await dispatchInquiryQueued(inquiry);
		return true;
	},

	async takeInquiry(inquiry, agent, options = { clientAction: false }) {
		check(
			agent,
			Match.ObjectIncluding({
				agentId: String,
				username: String,
			}),
		);

		check(
			inquiry,
			Match.ObjectIncluding({
				_id: String,
				rid: String,
				status: String,
			}),
		);

		logger.debug(`Attempting to take Inquiry ${inquiry._id} [Agent ${agent.agentId}] `);

		const { _id, rid } = inquiry;
		const room = await LivechatRooms.findOneById(rid);
		if (!room || !room.open) {
			logger.debug(`Cannot take Inquiry ${inquiry._id}: Room is closed`);
			return room;
		}

		if (room.servedBy && room.servedBy._id === agent.agentId && !room.onHold) {
			logger.debug(`Cannot take Inquiry ${inquiry._id}: Already taken by agent ${room.servedBy._id}`);
			return room;
		}

		try {
			await callbacks.run('livechat.checkAgentBeforeTakeInquiry', {
				agent,
				inquiry,
				options,
			});
		} catch (e) {
			if (options.clientAction && !options.forwardingToDepartment) {
				throw e;
			}
			agent = null;
		}

		if (!agent) {
			logger.debug(`Cannot take Inquiry ${inquiry._id}: Precondition failed for agent`);
			return callbacks.run('livechat.onAgentAssignmentFailed', { inquiry, room, options });
		}

		await LivechatInquiry.takeInquiry(_id);
		const inq = await this.assignAgent(inquiry, agent);
		logger.debug(`Inquiry ${inquiry._id} taken by agent ${agent.agentId}`);

		callbacks.runAsync('livechat.afterTakeInquiry', inq, agent);

		return LivechatRooms.findOneById(rid);
	},

	async transferRoom(room, guest, transferData) {
		logger.debug(`Transfering room ${room._id} by ${transferData.transferredBy._id}`);
		if (transferData.departmentId) {
			logger.debug(`Transfering room ${room._id} to department ${transferData.departmentId}`);
			return forwardRoomToDepartment(room, guest, transferData);
		}

		if (transferData.userId) {
			logger.debug(`Transfering room ${room._id} to user ${transferData.userId}`);
			return forwardRoomToAgent(room, transferData);
		}

		logger.debug(`Unable to transfer room ${room._id}: No target provided`);
		return false;
	},

	async delegateAgent(agent, inquiry) {
		logger.debug(`Delegating Inquiry ${inquiry._id}`);
		const defaultAgent = callbacks.run('livechat.beforeDelegateAgent', agent, {
			department: inquiry?.department,
		});

		if (defaultAgent) {
			logger.debug(`Delegating Inquiry ${inquiry._id} to agent ${defaultAgent.username}`);
			await LivechatInquiry.setDefaultAgentById(inquiry._id, defaultAgent);
		}

		logger.debug(`Queueing inquiry ${inquiry._id}`);
		await dispatchInquiryQueued(inquiry, defaultAgent);
		return defaultAgent;
	},

	async removeAllRoomSubscriptions(room, ignoreUser) {
		const { _id: roomId } = room;

		const subscriptions = await Subscriptions.findByRoomId(roomId).toArray();
		subscriptions?.forEach(({ u }) => {
			if (ignoreUser && ignoreUser._id === u._id) {
				return;
			}
			removeAgentFromSubscription(roomId, u);
		});
	},
};
