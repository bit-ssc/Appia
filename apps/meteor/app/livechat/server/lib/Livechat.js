// Note: Please don't add any new methods to this file, since its still in js and we are migrating to ts
// Please add new methods to LivechatTyped.ts

import dns from 'dns';

import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Random } from '@rocket.chat/random';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import UAParser from 'ua-parser-js';
import {
	LivechatVisitors,
	LivechatCustomField,
	Settings,
	LivechatRooms,
	LivechatInquiry,
	Subscriptions,
	Messages,
	LivechatDepartment as LivechatDepartmentRaw,
	LivechatDepartmentAgents,
	Rooms,
	Users,
} from '@rocket.chat/models';
import { Message, VideoConf, api } from '@rocket.chat/core-services';

import { QueueManager } from './QueueManager';
import { RoutingManager } from './RoutingManager';
import { Analytics } from './Analytics';
import { settings } from '../../../settings/server';
import { callbacks } from '../../../../lib/callbacks';
import { Logger } from '../../../logger/server';
import { hasRoleAsync } from '../../../authorization/server/functions/hasRole';
import { canAccessRoomAsync, roomAccessAttributes } from '../../../authorization/server';
import { hasPermissionAsync } from '../../../authorization/server/functions/hasPermission';
import * as Mailer from '../../../mailer/server/api';
import { sendMessage } from '../../../lib/server/functions/sendMessage';
import { updateMessage } from '../../../lib/server/functions/updateMessage';
import { deleteMessage } from '../../../lib/server/functions/deleteMessage';
import { FileUpload } from '../../../file-upload/server';
import { normalizeTransferredByData, parseAgentCustomFields, updateDepartmentAgents, validateEmail } from './Helper';
import { Apps, AppEvents } from '../../../../ee/server/apps';
import { businessHourManager } from '../business-hour';
import { addUserRolesAsync } from '../../../../server/lib/roles/addUserRoles';
import { removeUserFromRolesAsync } from '../../../../server/lib/roles/removeUserFromRoles';
import { trim } from '../../../../lib/utils/stringUtils';
import { Livechat as LivechatTyped } from './LivechatTyped';

const logger = new Logger('Livechat');

const dnsResolveMx = Meteor.wrapAsync(dns.resolveMx);

export const Livechat = {
	Analytics,
	historyMonitorType: 'url',

	logger,

	findGuest(token) {
		return LivechatVisitors.getVisitorByToken(token, {
			projection: {
				name: 1,
				username: 1,
				token: 1,
				visitorEmails: 1,
				department: 1,
			},
		});
	},

	async online(department, skipNoAgentSetting = false, skipFallbackCheck = false) {
		Livechat.logger.debug(`Checking online agents ${department ? `for department ${department}` : ''}`);
		if (!skipNoAgentSetting && settings.get('Livechat_accept_chats_with_no_agents')) {
			Livechat.logger.debug('Can accept without online agents: true');
			return true;
		}

		if (settings.get('Livechat_assign_new_conversation_to_bot')) {
			Livechat.logger.debug(`Fetching online bot agents for department ${department}`);
			const botAgents = await Livechat.getBotAgents(department);
			const onlineBots = botAgents.count();
			Livechat.logger.debug(`Found ${onlineBots} online`);
			if (onlineBots > 0) {
				return true;
			}
		}

		const agentsOnline = await Livechat.checkOnlineAgents(department, {}, skipFallbackCheck);
		Livechat.logger.debug(`Are online agents ${department ? `for department ${department}` : ''}?: ${agentsOnline}`);
		return agentsOnline;
	},

	async getNextAgent(department) {
		return RoutingManager.getNextAgent(department);
	},

	async getAgents(department) {
		if (department) {
			// TODO: This and all others should get the user's info as well
			return LivechatDepartmentAgents.findByDepartmentId(department);
		}
		return Users.findAgents();
	},

	async getOnlineAgents(department, agent) {
		if (agent?.agentId) {
			return Users.findOnlineAgents(agent.agentId);
		}

		if (department) {
			return LivechatDepartmentAgents.getOnlineForDepartment(department);
		}
		return Users.findOnlineAgents();
	},

	async checkOnlineAgents(department, agent, skipFallbackCheck = false) {
		if (agent?.agentId) {
			return Users.checkOnlineAgents(agent.agentId);
		}

		if (department) {
			const onlineForDep = await LivechatDepartmentAgents.checkOnlineForDepartment(department);
			if (onlineForDep || skipFallbackCheck) {
				return onlineForDep;
			}

			const dep = await LivechatDepartmentRaw.findOneById(department);
			if (!dep?.fallbackForwardDepartment) {
				return onlineForDep;
			}

			return this.checkOnlineAgents(dep?.fallbackForwardDepartment);
		}

		return Users.checkOnlineAgents();
	},

	async getBotAgents(department) {
		if (department) {
			return LivechatDepartmentAgents.getBotsForDepartment(department);
		}

		return Users.findBotAgents();
	},

	async getRequiredDepartment(onlineRequired = true) {
		const departments = await LivechatDepartmentRaw.findEnabledWithAgents();

		for await (const dept of departments) {
			if (!dept.showOnRegistration) {
				continue;
			}
			if (!onlineRequired) {
				return dept;
			}

			const onlineAgents = await LivechatDepartmentAgents.getOnlineForDepartment(dept._id);
			if (onlineAgents && onlineAgents.length) {
				return dept;
			}
		}
	},

	async getRoom(guest, message, roomInfo, agent, extraData) {
		if (!this.enabled()) {
			throw new Meteor.Error('error-omnichannel-is-disabled');
		}
		Livechat.logger.debug(`Attempting to find or create a room for visitor ${guest._id}`);
		let room = await LivechatRooms.findOneById(message.rid);
		let newRoom = false;

		if (room && !room.open) {
			Livechat.logger.debug(`Last room for visitor ${guest._id} closed. Creating new one`);
			message.rid = Random.id();
			room = null;
		}

		if (guest.department && !(await LivechatDepartmentRaw.findOneById(guest.department))) {
			await LivechatVisitors.removeDepartmentById(guest._id);
			guest = await LivechatVisitors.findOneById(guest._id);
		}

		if (room == null) {
			const defaultAgent = callbacks.run('livechat.checkDefaultAgentOnNewRoom', agent, guest);
			// if no department selected verify if there is at least one active and pick the first
			if (!defaultAgent && !guest.department) {
				const department = await this.getRequiredDepartment();
				Livechat.logger.debug(`No department or default agent selected for ${guest._id}`);

				if (department) {
					Livechat.logger.debug(`Assigning ${guest._id} to department ${department._id}`);
					guest.department = department._id;
				}
			}

			// delegate room creation to QueueManager
			Livechat.logger.debug(`Calling QueueManager to request a room for visitor ${guest._id}`);
			room = await QueueManager.requestRoom({
				guest,
				message,
				roomInfo,
				agent: defaultAgent,
				extraData,
			});
			newRoom = true;

			Livechat.logger.debug(`Room obtained for visitor ${guest._id} -> ${room._id}`);
		}

		if (!room || room.v.token !== guest.token) {
			Livechat.logger.debug(`Visitor ${guest._id} trying to access another visitor's room`);
			throw new Meteor.Error('cannot-access-room');
		}

		if (newRoom) {
			await Messages.setRoomIdByToken(guest.token, room._id);
		}

		return { room, newRoom };
	},

	async sendMessage({ guest, message, roomInfo, agent }) {
		const { room, newRoom } = await this.getRoom(guest, message, roomInfo, agent);
		if (guest.name) {
			message.alias = guest.name;
		}
		return Object.assign(sendMessage(guest, message, room), {
			newRoom,
			showConnecting: this.showConnecting(),
		});
	},

	async updateMessage({ guest, message }) {
		check(message, Match.ObjectIncluding({ _id: String }));

		const originalMessage = await Messages.findOneById(message._id);
		if (!originalMessage || !originalMessage._id) {
			return;
		}

		const editAllowed = settings.get('Message_AllowEditing');
		const editOwn = originalMessage.u && originalMessage.u._id === guest._id;

		if (!editAllowed || !editOwn) {
			throw new Meteor.Error('error-action-not-allowed', 'Message editing not allowed', {
				method: 'livechatUpdateMessage',
			});
		}

		await updateMessage(message, guest);

		return true;
	},

	async deleteMessage({ guest, message }) {
		Livechat.logger.debug(`Attempting to delete a message by visitor ${guest._id}`);
		check(message, Match.ObjectIncluding({ _id: String }));

		const msg = await Messages.findOneById(message._id);
		if (!msg || !msg._id) {
			return;
		}

		const deleteAllowed = settings.get('Message_AllowDeleting');
		const editOwn = msg.u && msg.u._id === guest._id;

		if (!deleteAllowed || !editOwn) {
			Livechat.logger.debug('Cannot delete message: not allowed');
			throw new Meteor.Error('error-action-not-allowed', 'Message deleting not allowed', {
				method: 'livechatDeleteMessage',
			});
		}

		await deleteMessage(message, guest);

		return true;
	},

	/**
	 * Returns the next visitor in the queue
	 * @param {object} options
	 * @param {string} [options.id] - The visitor's id
	 * @param {string} options.token - The visitor's token
	 * @param {string} [options.name] - The visitor's name
	 * @param {string} [options.email] - The visitor's email
	 * @param {string} [options.department] - The visitor's department
	 * @param {object} [options.phone] - The visitor's phone
	 * @param {string} [options.username] - The visitor's username
	 * @param {string} [options.connectionData] - The visitor's connection data
	 * @param {string} [options.status] - The visitor's status
	 */
	async registerGuest({ id, token, name, email, department, phone, username, connectionData, status = 'online' } = {}) {
		check(token, String);
		check(id, Match.Maybe(String));

		Livechat.logger.debug(`New incoming conversation: id: ${id} | token: ${token}`);

		let userId;
		const updateUser = {
			$set: {
				token,
				status,
				...(phone?.number ? { phone: [{ phoneNumber: phone.number }] } : {}),
				...(name ? { name } : {}),
			},
		};

		if (email) {
			email = email.trim().toLowerCase();
			validateEmail(email);
			updateUser.$set.visitorEmails = [{ address: email }];
		}

		if (department) {
			Livechat.logger.debug(`Attempt to find a department with id/name ${department}`);
			const dep = await LivechatDepartmentRaw.findOneByIdOrName(department);
			if (!dep) {
				Livechat.logger.debug('Invalid department provided');
				throw new Meteor.Error('error-invalid-department', 'The provided department is invalid', {
					method: 'registerGuest',
				});
			}
			Livechat.logger.debug(`Assigning visitor ${token} to department ${dep._id}`);
			updateUser.$set.department = dep._id;
		}

		const user = await LivechatVisitors.getVisitorByToken(token, { projection: { _id: 1 } });
		let existingUser = null;

		if (user) {
			Livechat.logger.debug('Found matching user by token');
			userId = user._id;
		} else if (phone?.number && (existingUser = await LivechatVisitors.findOneVisitorByPhone(phone.number))) {
			Livechat.logger.debug('Found matching user by phone number');
			userId = existingUser._id;
			// Don't change token when matching by phone number, use current visitor token
			updateUser.$set.token = existingUser.token;
		} else if (email && (existingUser = await LivechatVisitors.findOneGuestByEmailAddress(email))) {
			Livechat.logger.debug('Found matching user by email');
			userId = existingUser._id;
		} else {
			Livechat.logger.debug(`No matches found. Attempting to create new user with token ${token}`);
			if (!username) {
				username = await LivechatVisitors.getNextVisitorUsername();
			}

			const userData = {
				username,
				status,
				ts: new Date(),
				...(id && { _id: id }),
			};

			if (settings.get('Livechat_Allow_collect_and_store_HTTP_header_informations')) {
				Livechat.logger.debug(`Saving connection data for visitor ${token}`);
				const connection = this.connection || connectionData;
				if (connection && connection.httpHeaders) {
					userData.userAgent = connection.httpHeaders['user-agent'];
					userData.ip = connection.httpHeaders['x-real-ip'] || connection.httpHeaders['x-forwarded-for'] || connection.clientAddress;
					userData.host = connection.httpHeaders.host;
				}
			}

			userId = (await LivechatVisitors.insertOne(userData)).insertedId;
		}

		await LivechatVisitors.updateById(userId, updateUser);

		return userId;
	},

	async setDepartmentForGuest({ token, department } = {}) {
		check(token, String);
		check(department, String);

		Livechat.logger.debug(`Switching departments for user with token ${token} (to ${department})`);

		const updateUser = {
			$set: {
				department,
			},
		};

		const dep = await LivechatDepartmentRaw.findOneById(department);
		if (!dep) {
			throw new Meteor.Error('invalid-department', 'Provided department does not exists', {
				method: 'setDepartmentForGuest',
			});
		}

		const user = await LivechatVisitors.getVisitorByToken(token, { projection: { _id: 1 } });
		if (user) {
			return LivechatVisitors.updateById(user._id, updateUser);
		}
		return false;
	},

	async saveGuest(guestData, userId) {
		const { _id, name, email, phone, livechatData = {} } = guestData;
		Livechat.logger.debug(`Saving data for visitor ${_id}`);
		const updateData = {};

		if (name) {
			updateData.name = name;
		}
		if (email) {
			updateData.email = email;
		}
		if (phone) {
			updateData.phone = phone;
		}

		const customFields = {};

		if ((!userId || (await hasPermissionAsync(userId, 'edit-livechat-room-customfields'))) && Object.keys(livechatData).length) {
			Livechat.logger.debug(`Saving custom fields for visitor ${_id}`);
			const fields = LivechatCustomField.findByScope('visitor');
			for await (const field of fields) {
				if (!livechatData.hasOwnProperty(field._id)) {
					continue;
				}
				const value = trim(livechatData[field._id]);
				if (value !== '' && field.regexp !== undefined && field.regexp !== '') {
					const regexp = new RegExp(field.regexp);
					if (!regexp.test(value)) {
						throw new Meteor.Error(TAPi18n.__('error-invalid-custom-field-value', { field: field.label }));
					}
				}
				customFields[field._id] = value;
			}
			updateData.livechatData = customFields;
			Livechat.logger.debug(`About to update ${Object.keys(customFields).length} custom fields for visitor ${_id}`);
		}
		const ret = await LivechatVisitors.saveGuestById(_id, updateData);

		Meteor.defer(() => {
			Apps.triggerEvent(AppEvents.IPostLivechatGuestSaved, _id);
			callbacks.run('livechat.saveGuest', updateData);
		});

		return ret;
	},

	async removeRoom(rid) {
		Livechat.logger.debug(`Deleting room ${rid}`);
		check(rid, String);
		const room = await LivechatRooms.findOneById(rid);
		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'livechat:removeRoom',
			});
		}

		const result = await Promise.allSettled([
			Messages.removeByRoomId(rid),
			Subscriptions.removeByRoomId(rid),
			LivechatInquiry.removeByRoomId(rid),
			LivechatRooms.removeById(rid),
		]);

		const errors = result.filter((r) => r.status === 'rejected').map((r) => r.reason);
		if (errors.length > 0) {
			this.logger.error(`Error removing room ${rid}: ${errors.join(', ')}`);
			throw new Meteor.Error('error-removing-room', 'Error removing room', {
				method: 'livechat:removeRoom',
				errors,
			});
		}
	},

	async setCustomFields({ token, key, value, overwrite } = {}) {
		check(token, String);
		check(key, String);
		check(value, String);
		check(overwrite, Boolean);
		Livechat.logger.debug(`Setting custom fields data for visitor with token ${token}`);

		const customField = await LivechatCustomField.findOneById(key);
		if (!customField) {
			throw new Meteor.Error('invalid-custom-field');
		}

		if (customField.regexp !== undefined && customField.regexp !== '') {
			const regexp = new RegExp(customField.regexp);
			if (!regexp.test(value)) {
				throw new Meteor.Error(TAPi18n.__('error-invalid-custom-field-value', { field: key }));
			}
		}

		let result;
		if (customField.scope === 'room') {
			result = await LivechatRooms.updateDataByToken(token, key, value, overwrite);
		} else {
			result = await LivechatVisitors.updateLivechatDataByToken(token, key, value, overwrite);
		}

		if (result) {
			return result.modifiedCount;
		}

		return 0;
	},

	enabled() {
		return settings.get('Livechat_enabled');
	},

	async getInitSettings() {
		const rcSettings = {};

		await Settings.findNotHiddenPublic([
			'Livechat_title',
			'Livechat_title_color',
			'Livechat_enable_message_character_limit',
			'Livechat_message_character_limit',
			'Message_MaxAllowedSize',
			'Livechat_enabled',
			'Livechat_registration_form',
			'Livechat_allow_switching_departments',
			'Livechat_offline_title',
			'Livechat_offline_title_color',
			'Livechat_offline_message',
			'Livechat_offline_success_message',
			'Livechat_offline_form_unavailable',
			'Livechat_display_offline_form',
			'Omnichannel_call_provider',
			'Language',
			'Livechat_enable_transcript',
			'Livechat_transcript_message',
			'Livechat_fileupload_enabled',
			'FileUpload_Enabled',
			'Livechat_conversation_finished_message',
			'Livechat_conversation_finished_text',
			'Livechat_name_field_registration_form',
			'Livechat_email_field_registration_form',
			'Livechat_registration_form_message',
			'Livechat_force_accept_data_processing_consent',
			'Livechat_data_processing_consent_text',
			'Livechat_show_agent_info',
			'Livechat_clear_local_storage_when_chat_ended',
		]).forEach((setting) => {
			rcSettings[setting._id] = setting.value;
		});

		rcSettings.Livechat_history_monitor_type = settings.get('Livechat_history_monitor_type');

		rcSettings.Livechat_Show_Connecting = this.showConnecting();

		return rcSettings;
	},

	async saveRoomInfo(roomData, guestData, userId) {
		Livechat.logger.debug(`Saving room information on room ${roomData._id}`);
		const { livechatData = {} } = roomData;
		const customFields = {};

		if ((!userId || (await hasPermissionAsync(userId, 'edit-livechat-room-customfields'))) && Object.keys(livechatData).length) {
			Livechat.logger.debug(`Updating custom fields on room ${roomData._id}`);
			const fields = LivechatCustomField.findByScope('room');
			for await (const field of fields) {
				if (!livechatData.hasOwnProperty(field._id)) {
					continue;
				}
				const value = trim(livechatData[field._id]);
				if (value !== '' && field.regexp !== undefined && field.regexp !== '') {
					const regexp = new RegExp(field.regexp);
					if (!regexp.test(value)) {
						throw new Meteor.Error(TAPi18n.__('error-invalid-custom-field-value', { field: field.label }));
					}
				}
				customFields[field._id] = value;
			}
			roomData.livechatData = customFields;
			Livechat.logger.debug(`About to update ${Object.keys(customFields).length} custom fields on room ${roomData._id}`);
		}

		if (!(await LivechatRooms.saveRoomById(roomData))) {
			Livechat.logger.debug(`Failed to save room information on room ${roomData._id}`);
			return false;
		}

		Meteor.defer(() => {
			Apps.triggerEvent(AppEvents.IPostLivechatRoomSaved, roomData._id);
		});
		callbacks.runAsync('livechat.saveRoom', roomData);

		if (guestData?.name?.trim().length) {
			const { _id: rid } = roomData;
			const { name } = guestData;
			return (
				(await Rooms.setFnameById(rid, name)) &&
				(await LivechatInquiry.setNameByRoomId(rid, name)) &&
				// This one needs to be the last since the agent may not have the subscription
				// when the conversation is in the queue, then the result will be 0(zero)
				Subscriptions.updateDisplayNameByRoomId(rid, name)
			);
		}
	},

	async closeOpenChats(userId, comment) {
		Livechat.logger.debug(`Closing open chats for user ${userId}`);
		const user = await Users.findOneById(userId);

		const openChats = LivechatRooms.findOpenByAgent(userId);
		const promises = [];
		await openChats.forEach((room) => {
			promises.push(LivechatTyped.closeRoom({ user, room, comment }));
		});

		await Promise.all(promises);
	},

	async forwardOpenChats(userId) {
		Livechat.logger.debug(`Transferring open chats for user ${userId}`);
		for await (const room of LivechatRooms.findOpenByAgent(userId)) {
			const guest = await LivechatVisitors.findOneById(room.v._id);
			const user = await Users.findOneById(userId);
			const { _id, username, name } = user;
			const transferredBy = normalizeTransferredByData({ _id, username, name }, room);
			await this.transfer(room, guest, {
				roomId: room._id,
				transferredBy,
				departmentId: guest.department,
			});
		}
	},

	async savePageHistory(token, roomId, pageInfo) {
		Livechat.logger.debug(`Saving page movement history for visitor with token ${token}`);
		if (pageInfo.change !== Livechat.historyMonitorType) {
			return;
		}
		const user = await Users.findOneById('rocket.cat');

		const pageTitle = pageInfo.title;
		const pageUrl = pageInfo.location.href;
		const extraData = {
			navigation: {
				page: pageInfo,
				token,
			},
		};

		if (!roomId) {
			// keep history of unregistered visitors for 1 month
			const keepHistoryMiliseconds = 2592000000;
			extraData.expireAt = new Date().getTime() + keepHistoryMiliseconds;
		}

		if (!settings.get('Livechat_Visitor_navigation_as_a_message')) {
			extraData._hidden = true;
		}

		return Message.saveSystemMessage('livechat_navigation_history', roomId, `${pageTitle} - ${pageUrl}`, user, extraData);
	},

	async saveTransferHistory(room, transferData) {
		Livechat.logger.debug(`Saving transfer history for room ${room._id}`);
		const { departmentId: previousDepartment } = room;
		const { department: nextDepartment, transferredBy, transferredTo, scope, comment } = transferData;

		check(
			transferredBy,
			Match.ObjectIncluding({
				_id: String,
				username: String,
				name: Match.Maybe(String),
				type: String,
			}),
		);

		const { _id, username } = transferredBy;
		const scopeData = scope || (nextDepartment ? 'department' : 'agent');
		Livechat.logger.debug(`Storing new chat transfer of ${room._id} [Transfered by: ${_id} to ${scopeData}]`);

		const transfer = {
			transferData: {
				transferredBy,
				ts: new Date(),
				scope: scopeData,
				comment,
				...(previousDepartment && { previousDepartment }),
				...(nextDepartment && { nextDepartment }),
				...(transferredTo && { transferredTo }),
			},
		};

		const type = 'livechat_transfer_history';
		const transferMessage = {
			t: type,
			rid: room._id,
			ts: new Date(),
			msg: '',
			u: {
				_id,
				username,
			},
			groupable: false,
		};

		Object.assign(transferMessage, transfer);

		await sendMessage(transferredBy, transferMessage, room);
	},

	async transfer(room, guest, transferData) {
		Livechat.logger.debug(`Transfering room ${room._id} [Transfered by: ${transferData?.transferredBy?._id}]`);
		if (room.onHold) {
			Livechat.logger.debug('Cannot transfer. Room is on hold');
			throw new Error('error-room-onHold');
		}

		if (transferData.departmentId) {
			transferData.department = await LivechatDepartmentRaw.findOneById(transferData.departmentId, {
				projection: { name: 1 },
			});
			Livechat.logger.debug(`Transfering room ${room._id} to department ${transferData.department?._id}`);
		}

		return RoutingManager.transferRoom(room, guest, transferData);
	},

	async returnRoomAsInquiry(rid, departmentId, overrideTransferData = {}) {
		Livechat.logger.debug(`Transfering room ${rid} to ${departmentId ? 'department' : ''} queue`);
		const room = await LivechatRooms.findOneById(rid);
		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', {
				method: 'livechat:returnRoomAsInquiry',
			});
		}

		if (!room.open) {
			throw new Meteor.Error('room-closed', 'Room closed', {
				method: 'livechat:returnRoomAsInquiry',
			});
		}

		if (room.onHold) {
			throw new Meteor.Error('error-room-onHold', 'Room On Hold', {
				method: 'livechat:returnRoomAsInquiry',
			});
		}

		if (!room.servedBy) {
			return false;
		}

		const user = await Users.findOneById(room.servedBy._id);
		if (!user || !user._id) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'livechat:returnRoomAsInquiry',
			});
		}

		// find inquiry corresponding to room
		const inquiry = await LivechatInquiry.findOne({ rid });
		if (!inquiry) {
			return false;
		}

		const transferredBy = normalizeTransferredByData(user, room);
		Livechat.logger.debug(`Transfering room ${room._id} by user ${transferredBy._id}`);
		const transferData = { roomId: rid, scope: 'queue', departmentId, transferredBy, ...overrideTransferData };
		try {
			await this.saveTransferHistory(room, transferData);
			await RoutingManager.unassignAgent(inquiry, departmentId);
		} catch (e) {
			this.logger.error(e);
			throw new Meteor.Error('error-returning-inquiry', 'Error returning inquiry to the queue', {
				method: 'livechat:returnRoomAsInquiry',
			});
		}

		callbacks.runAsync('livechat:afterReturnRoomAsInquiry', { room });

		return true;
	},

	async getLivechatRoomGuestInfo(room) {
		const visitor = await LivechatVisitors.findOneById(room.v._id);
		const agent = await Users.findOneById(room.servedBy && room.servedBy._id);

		const ua = new UAParser();
		ua.setUA(visitor.userAgent);

		const postData = {
			_id: room._id,
			label: room.fname || room.label, // using same field for compatibility
			topic: room.topic,
			createdAt: room.ts,
			lastMessageAt: room.lm,
			tags: room.tags,
			customFields: room.livechatData,
			visitor: {
				_id: visitor._id,
				token: visitor.token,
				name: visitor.name,
				username: visitor.username,
				email: null,
				phone: null,
				department: visitor.department,
				ip: visitor.ip,
				os: ua.getOS().name && `${ua.getOS().name} ${ua.getOS().version}`,
				browser: ua.getBrowser().name && `${ua.getBrowser().name} ${ua.getBrowser().version}`,
				customFields: visitor.livechatData,
			},
		};

		if (agent) {
			const customFields = parseAgentCustomFields(agent.customFields);

			postData.agent = {
				_id: agent._id,
				username: agent.username,
				name: agent.name,
				email: null,
				...(customFields && { customFields }),
			};

			if (agent.emails && agent.emails.length > 0) {
				postData.agent.email = agent.emails[0].address;
			}
		}

		if (room.crmData) {
			postData.crmData = room.crmData;
		}

		if (visitor.visitorEmails && visitor.visitorEmails.length > 0) {
			postData.visitor.email = visitor.visitorEmails;
		}
		if (visitor.phone && visitor.phone.length > 0) {
			postData.visitor.phone = visitor.phone;
		}

		return postData;
	},

	async addAgent(username) {
		check(username, String);

		const user = await Users.findOneByUsername(username, { projection: { _id: 1, username: 1 } });

		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'livechat:addAgent' });
		}

		if (await addUserRolesAsync(user._id, ['livechat-agent'])) {
			await Users.setOperator(user._id, true);
			await this.setUserStatusLivechat(user._id, user.status !== 'offline' ? 'available' : 'not-available');
			return user;
		}

		return false;
	},

	async addManager(username) {
		check(username, String);

		const user = await Users.findOneByUsername(username, { projection: { _id: 1, username: 1 } });

		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'livechat:addManager',
			});
		}

		if (await addUserRolesAsync(user._id, ['livechat-manager'])) {
			return user;
		}

		return false;
	},

	async removeAgent(username) {
		check(username, String);

		const user = await Users.findOneByUsername(username, { projection: { _id: 1 } });

		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'livechat:removeAgent',
			});
		}

		const { _id } = user;

		if (await removeUserFromRolesAsync(_id, ['livechat-agent'])) {
			await Users.setOperator(_id, false);
			await Users.removeLivechatData(_id);
			await this.setUserStatusLivechat(_id, 'not-available');

			await Promise.all([
				LivechatDepartmentAgents.removeByAgentId(_id),
				LivechatVisitors.removeContactManagerByUsername(username),
				Users.unsetExtension(_id),
			]);
			return true;
		}

		return false;
	},

	async removeManager(username) {
		check(username, String);

		const user = await Users.findOneByUsername(username, { projection: { _id: 1 } });

		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'livechat:removeManager',
			});
		}

		return removeUserFromRolesAsync(user._id, ['livechat-manager']);
	},

	async removeGuest(_id) {
		check(_id, String);
		const guest = await LivechatVisitors.findOneById(_id, { projection: { _id: 1 } });
		if (!guest) {
			throw new Meteor.Error('error-invalid-guest', 'Invalid guest', {
				method: 'livechat:removeGuest',
			});
		}

		await this.cleanGuestHistory(_id);
		return LivechatVisitors.removeById(_id);
	},

	async setUserStatusLivechat(userId, status) {
		const user = await Users.setLivechatStatus(userId, status);
		callbacks.runAsync('livechat.setUserStatusLivechat', { userId, status });
		return user;
	},

	async setUserStatusLivechatIf(userId, status, condition, fields) {
		const user = await Users.setLivechatStatusIf(userId, status, condition, fields);
		callbacks.runAsync('livechat.setUserStatusLivechat', { userId, status });
		return user;
	},

	async cleanGuestHistory(_id) {
		const guest = await LivechatVisitors.findOneById(_id);
		if (!guest) {
			throw new Meteor.Error('error-invalid-guest', 'Invalid guest', {
				method: 'livechat:cleanGuestHistory',
			});
		}

		const { token } = guest;
		check(token, String);

		const cursor = LivechatRooms.findByVisitorToken(token);
		for await (const room of cursor) {
			await FileUpload.removeFilesByRoomId(room._id);
			await Messages.removeByRoomId(room._id);
		}

		await Subscriptions.removeByVisitorToken(token);
		await LivechatRooms.removeByVisitorToken(token);
		await LivechatInquiry.removeByVisitorToken(token);
	},

	async saveDepartmentAgents(_id, departmentAgents) {
		check(_id, String);
		check(departmentAgents, {
			upsert: Match.Maybe([
				Match.ObjectIncluding({
					agentId: String,
					username: String,
					count: Match.Maybe(Match.Integer),
					order: Match.Maybe(Match.Integer),
				}),
			]),
			remove: Match.Maybe([
				Match.ObjectIncluding({
					agentId: String,
					username: Match.Maybe(String),
					count: Match.Maybe(Match.Integer),
					order: Match.Maybe(Match.Integer),
				}),
			]),
		});

		const department = await LivechatDepartmentRaw.findOneById(_id);
		if (!department) {
			throw new Meteor.Error('error-department-not-found', 'Department not found', {
				method: 'livechat:saveDepartmentAgents',
			});
		}

		return updateDepartmentAgents(_id, departmentAgents, department.enabled);
	},

	async saveAgentInfo(_id, agentData, agentDepartments) {
		check(_id, Match.Maybe(String));
		check(agentData, Object);
		check(agentDepartments, [String]);

		const user = await Users.findOneById(_id);
		if (!user || !(await hasRoleAsync(_id, 'livechat-agent'))) {
			throw new Meteor.Error('error-user-is-not-agent', 'User is not a livechat agent', {
				method: 'livechat:saveAgentInfo',
			});
		}

		await Users.setLivechatData(_id, agentData);
		await LivechatDepartmentRaw.saveDepartmentsByAgent(user, agentDepartments);

		return true;
	},

	/*
	 * @deprecated - Use the equivalent from DepartmentHelpers class
	 */
	async removeDepartment(_id) {
		check(_id, String);

		const departmentRemovalEnabled = settings.get('Omnichannel_enable_department_removal');

		if (!departmentRemovalEnabled) {
			throw new Meteor.Error('department-removal-disabled', 'Department removal is disabled', {
				method: 'livechat:removeDepartment',
			});
		}

		const department = await LivechatDepartmentRaw.findOneById(_id, { projection: { _id: 1 } });

		if (!department) {
			throw new Meteor.Error('department-not-found', 'Department not found', {
				method: 'livechat:removeDepartment',
			});
		}
		const ret = (await LivechatDepartmentRaw.removeById(_id)).deletedCount;
		const agentsIds = (await LivechatDepartmentAgents.findByDepartmentId(_id).toArray()).map((agent) => agent.agentId);
		await LivechatDepartmentAgents.removeByDepartmentId(_id);
		await LivechatDepartmentRaw.unsetFallbackDepartmentByDepartmentId(_id);
		if (ret) {
			Meteor.defer(() => {
				callbacks.run('livechat.afterRemoveDepartment', { department, agentsIds });
			});
		}
		return ret;
	},

	async unarchiveDepartment(_id) {
		check(_id, String);

		const department = await LivechatDepartmentRaw.findOneById(_id, { projection: { _id: 1 } });

		if (!department) {
			throw new Meteor.Error('department-not-found', 'Department not found', {
				method: 'livechat:removeDepartment',
			});
		}

		return LivechatDepartmentRaw.unarchiveDepartment(_id);
	},

	async archiveDepartment(_id) {
		check(_id, String);

		const department = await LivechatDepartmentRaw.findOneById(_id, { projection: { _id: 1 } });

		if (!department) {
			throw new Meteor.Error('department-not-found', 'Department not found', {
				method: 'livechat:removeDepartment',
			});
		}

		return LivechatDepartmentRaw.archiveDepartment(_id);
	},

	showConnecting() {
		const { showConnecting } = RoutingManager.getConfig();
		return showConnecting;
	},

	async sendEmail(from, to, replyTo, subject, html) {
		return Mailer.send({
			to,
			from,
			replyTo,
			subject,
			html,
		});
	},

	async getRoomMessages({ rid }) {
		check(rid, String);

		const room = await Rooms.findOneById(rid, { projection: { t: 1 } });
		if (room?.t !== 'l') {
			throw new Meteor.Error('invalid-room');
		}

		const ignoredMessageTypes = [
			'livechat_navigation_history',
			'livechat_transcript_history',
			'command',
			'livechat-close',
			'livechat-started',
			'livechat_video_call',
		];

		return Messages.findVisibleByRoomIdNotContainingTypes(rid, ignoredMessageTypes, {
			sort: { ts: 1 },
		}).toArray();
	},

	async requestTranscript({ rid, email, subject, user }) {
		check(rid, String);
		check(email, String);
		check(subject, String);
		check(
			user,
			Match.ObjectIncluding({
				_id: String,
				username: String,
				utcOffset: Number,
				name: Match.Maybe(String),
			}),
		);

		const room = await LivechatRooms.findOneById(rid, { projection: { _id: 1, open: 1, transcriptRequest: 1 } });

		if (!room || !room.open) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room');
		}

		if (room.transcriptRequest) {
			throw new Meteor.Error('error-transcript-already-requested', 'Transcript already requested');
		}

		const { _id, username, name, utcOffset } = user;
		const transcriptRequest = {
			requestedAt: new Date(),
			requestedBy: {
				_id,
				username,
				name,
				utcOffset,
			},
			email,
			subject,
		};

		await LivechatRooms.setEmailTranscriptRequestedByRoomId(rid, transcriptRequest);
		return true;
	},

	async notifyGuestStatusChanged(token, status) {
		await LivechatInquiry.updateVisitorStatus(token, status);
		await LivechatRooms.updateVisitorStatus(token, status);
	},

	async sendOfflineMessage(data = {}) {
		if (!settings.get('Livechat_display_offline_form')) {
			return false;
		}

		const { message, name, email, department, host } = data;
		const emailMessage = `${message}`.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2');

		let html = '<h1>New livechat message</h1>';
		if (host && host !== '') {
			html = html.concat(`<p><strong>Sent from:</strong><a href='${host}'> ${host}</a></p>`);
		}
		html = html.concat(`
			<p><strong>Visitor name:</strong> ${name}</p>
			<p><strong>Visitor email:</strong> ${email}</p>
			<p><strong>Message:</strong><br>${emailMessage}</p>`);

		let fromEmail = settings.get('From_Email').match(/\b[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,4}\b/i);

		if (fromEmail) {
			fromEmail = fromEmail[0];
		} else {
			fromEmail = settings.get('From_Email');
		}

		if (settings.get('Livechat_validate_offline_email')) {
			const emailDomain = email.substr(email.lastIndexOf('@') + 1);

			try {
				dnsResolveMx(emailDomain);
			} catch (e) {
				throw new Meteor.Error('error-invalid-email-address', 'Invalid email address', {
					method: 'livechat:sendOfflineMessage',
				});
			}
		}

		let emailTo = settings.get('Livechat_offline_email');
		if (department && department !== '') {
			const dep = await LivechatDepartmentRaw.findOneByIdOrName(department);
			emailTo = dep.email || emailTo;
		}

		const from = `${name} - ${email} <${fromEmail}>`;
		const replyTo = `${name} <${email}>`;
		const subject = `Livechat offline message from ${name}: ${`${emailMessage}`.substring(0, 20)}`;
		await this.sendEmail(from, emailTo, replyTo, subject, html);

		Meteor.defer(() => {
			callbacks.run('livechat.offlineMessage', data);
		});

		return true;
	},

	async notifyAgentStatusChanged(userId, status) {
		callbacks.runAsync('livechat.agentStatusChanged', { userId, status });
		if (!settings.get('Livechat_show_agent_info')) {
			return;
		}

		await LivechatRooms.findOpenByAgent(userId).forEach((room) => {
			void api.broadcast('omnichannel.room', room._id, {
				type: 'agentStatus',
				status,
			});
		});
	},

	async allowAgentChangeServiceStatus(statusLivechat, agentId) {
		if (statusLivechat !== 'available') {
			return true;
		}

		return businessHourManager.allowAgentChangeServiceStatus(agentId);
	},

	notifyRoomVisitorChange(roomId, visitor) {
		void api.broadcast('omnichannel.room', roomId, {
			type: 'visitorData',
			visitor,
		});
	},

	async changeRoomVisitor(userId, roomId, visitor) {
		const user = await Users.findOneById(userId);
		if (!user) {
			throw new Error('error-user-not-found');
		}

		if (!(await hasPermissionAsync(userId, 'change-livechat-room-visitor'))) {
			throw new Error('error-not-authorized');
		}

		const room = await LivechatRooms.findOneById(roomId, { ...roomAccessAttributes, _id: 1, t: 1 });

		if (!room) {
			throw new Meteor.Error('invalid-room');
		}

		if (!(await canAccessRoomAsync(room, user))) {
			throw new Error('error-not-allowed');
		}

		await LivechatRooms.changeVisitorByRoomId(room._id, visitor);

		Livechat.notifyRoomVisitorChange(room._id, visitor);

		return LivechatRooms.findOneById(roomId);
	},
	async updateLastChat(contactId, lastChat) {
		const updateUser = {
			$set: {
				lastChat,
			},
		};
		await LivechatVisitors.updateById(contactId, updateUser);
	},
	async updateCallStatus(callId, rid, status, user) {
		await Rooms.setCallStatus(rid, status);
		if (status === 'ended' || status === 'declined') {
			if (await VideoConf.declineLivechatCall(callId)) {
				return;
			}

			return updateMessage({ _id: callId, msg: status, actionLinks: [], webRtcCallEndTs: new Date() }, user);
		}
	},
};

settings.watch('Livechat_history_monitor_type', (value) => {
	Livechat.historyMonitorType = value;
});
