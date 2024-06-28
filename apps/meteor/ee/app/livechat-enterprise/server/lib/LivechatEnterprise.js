import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import {
	LivechatInquiry,
	Users,
	LivechatRooms,
	LivechatDepartment as LivechatDepartmentRaw,
	OmnichannelServiceLevelAgreements,
	LivechatTag,
	LivechatUnitMonitors,
	LivechatUnit,
} from '@rocket.chat/models';
import { Message } from '@rocket.chat/core-services';

import { hasLicense } from '../../../license/server/license';
import { updateDepartmentAgents } from '../../../../../app/livechat/server/lib/Helper';
import { addUserRolesAsync } from '../../../../../server/lib/roles/addUserRoles';
import { removeUserFromRolesAsync } from '../../../../../server/lib/roles/removeUserFromRoles';
import { processWaitingQueue, updateSLAInquiries } from './Helper';
import { removeSLAFromRooms } from './SlaHelper';
import { RoutingManager } from '../../../../../app/livechat/server/lib/RoutingManager';
import { settings } from '../../../../../app/settings/server';
import { logger, queueLogger } from './logger';
import { callbacks } from '../../../../../lib/callbacks';
import { AutoCloseOnHoldScheduler } from './AutoCloseOnHoldScheduler';
import { getInquirySortMechanismSetting } from '../../../../../app/livechat/server/lib/settings';

export const LivechatEnterprise = {
	async addMonitor(username) {
		check(username, String);

		const user = await Users.findOneByUsername(username, { projection: { _id: 1, username: 1 } });

		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'livechat:addMonitor',
			});
		}

		if (await addUserRolesAsync(user._id, ['livechat-monitor'])) {
			return user;
		}

		return false;
	},

	async removeMonitor(username) {
		check(username, String);

		const user = await Users.findOneByUsername(username, { projection: { _id: 1 } });

		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'livechat:removeMonitor',
			});
		}

		const removeRoleResult = await removeUserFromRolesAsync(user._id, ['livechat-monitor']);
		if (!removeRoleResult) {
			return false;
		}

		// remove this monitor from any unit it is assigned to
		await LivechatUnitMonitors.removeByMonitorId(user._id);

		return true;
	},

	async removeUnit(_id) {
		check(_id, String);

		const unit = await LivechatUnit.findOneById(_id, { projection: { _id: 1 } });

		if (!unit) {
			throw new Meteor.Error('unit-not-found', 'Unit not found', { method: 'livechat:removeUnit' });
		}

		return LivechatUnit.removeById(_id);
	},

	async saveUnit(_id, unitData, unitMonitors, unitDepartments) {
		check(_id, Match.Maybe(String));

		check(unitData, {
			name: String,
			visibility: String,
			enabled: Match.Optional(Boolean),
			description: Match.Optional(String),
			email: Match.Optional(String),
			showOnOfflineForm: Match.Optional(Boolean),
		});

		check(unitMonitors, [
			Match.ObjectIncluding({
				monitorId: String,
				username: String,
			}),
		]);

		check(unitDepartments, [
			Match.ObjectIncluding({
				departmentId: String,
			}),
		]);

		let ancestors = [];
		if (_id) {
			const unit = await LivechatUnit.findOneById(_id);
			if (!unit) {
				throw new Meteor.Error('error-unit-not-found', 'Unit not found', {
					method: 'livechat:saveUnit',
				});
			}

			ancestors = unit.ancestors;
		}

		return LivechatUnit.createOrUpdateUnit(_id, unitData, ancestors, unitMonitors, unitDepartments);
	},

	async removeTag(_id) {
		check(_id, String);

		const tag = await LivechatTag.findOneById(_id, { projection: { _id: 1 } });

		if (!tag) {
			throw new Meteor.Error('tag-not-found', 'Tag not found', { method: 'livechat:removeTag' });
		}

		return LivechatTag.removeById(_id);
	},

	async saveTag(_id, tagData, tagDepartments) {
		check(_id, Match.Maybe(String));

		check(tagData, {
			name: String,
			description: Match.Optional(String),
		});

		check(tagDepartments, [String]);

		return LivechatTag.createOrUpdateTag(_id, tagData, tagDepartments);
	},

	async saveSLA(_id, slaData) {
		const oldSLA = _id && (await OmnichannelServiceLevelAgreements.findOneById(_id, { projection: { dueTimeInMinutes: 1 } }));
		const exists = await OmnichannelServiceLevelAgreements.findDuplicate(_id, slaData.name, slaData.dueTimeInMinutes);
		if (exists) {
			throw new Error('error-duplicated-sla');
		}

		const sla = await OmnichannelServiceLevelAgreements.createOrUpdatePriority(slaData, _id);
		if (!oldSLA) {
			return sla;
		}

		const { dueTimeInMinutes: oldDueTimeInMinutes } = oldSLA;
		const { dueTimeInMinutes } = sla;

		if (oldDueTimeInMinutes !== dueTimeInMinutes) {
			await updateSLAInquiries(sla);
		}

		return sla;
	},

	async removeSLA(_id) {
		const sla = await OmnichannelServiceLevelAgreements.findOneById(_id, { projection: { _id: 1 } });
		if (!sla) {
			throw new Error(`SLA with id ${_id} not found`);
		}

		const removedResult = await OmnichannelServiceLevelAgreements.removeById(_id);
		if (!removedResult || removedResult.deletedCount !== 1) {
			throw new Error(`Error removing SLA with id ${_id}`);
		}

		await removeSLAFromRooms(_id);
	},

	async placeRoomOnHold(room, comment, onHoldBy) {
		logger.debug(`Attempting to place room ${room._id} on hold by user ${onHoldBy?._id}`);
		const { _id: roomId, onHold } = room;
		if (!roomId || onHold) {
			logger.debug(`Room ${roomId} invalid or already on hold. Skipping`);
			return false;
		}
		await LivechatRooms.setOnHoldByRoomId(roomId);

		await Message.saveSystemMessage('omnichannel_placed_chat_on_hold', roomId, '', onHoldBy, { comment });

		await callbacks.run('livechat:afterOnHold', room);

		logger.debug(`Room ${room._id} set on hold succesfully`);
		return true;
	},

	async releaseOnHoldChat(room) {
		const { _id: roomId, onHold } = room;
		if (!roomId || !onHold) {
			return;
		}

		await AutoCloseOnHoldScheduler.unscheduleRoom(roomId);
		await LivechatRooms.unsetOnHoldAndPredictedVisitorAbandonmentByRoomId(roomId);
	},

	/**
	 * @param {string|null} _id - The department id
	 * @param {Partial<import('@rocket.chat/core-typings').ILivechatDepartment>} departmentData
	 * @param {{upsert?: { agentId: string; count?: number; order?: number; }[], remove?: { agentId: string; count?: number; order?: number; }}} [departmentAgents] - The department agents
	 */
	async saveDepartment(_id, departmentData, departmentAgents) {
		check(_id, Match.Maybe(String));

		const department = _id && (await LivechatDepartmentRaw.findOneById(_id, { projection: { _id: 1, archived: 1 } }));

		if (!hasLicense('livechat-enterprise')) {
			const totalDepartments = await LivechatDepartmentRaw.countTotal();
			if (!department && totalDepartments >= 1) {
				throw new Meteor.Error('error-max-departments-number-reached', 'Maximum number of departments reached', {
					method: 'livechat:saveDepartment',
				});
			}
		}

		if (department?.archived && departmentData.enabled) {
			throw new Meteor.Error('error-archived-department-cant-be-enabled', 'Archived departments cant be enabled', {
				method: 'livechat:saveDepartment',
			});
		}

		const defaultValidations = {
			enabled: Boolean,
			name: String,
			description: Match.Optional(String),
			showOnRegistration: Boolean,
			email: String,
			showOnOfflineForm: Boolean,
			requestTagBeforeClosingChat: Match.Optional(Boolean),
			chatClosingTags: Match.Optional([String]),
			fallbackForwardDepartment: Match.Optional(String),
			departmentsAllowedToForward: Match.Optional([String]),
		};

		// The Livechat Form department support addition/custom fields, so those fields need to be added before validating
		Object.keys(departmentData).forEach((field) => {
			if (!defaultValidations.hasOwnProperty(field)) {
				defaultValidations[field] = Match.OneOf(String, Match.Integer, Boolean);
			}
		});

		check(departmentData, defaultValidations);
		check(
			departmentAgents,
			Match.Maybe({
				upsert: Match.Maybe(Array),
				remove: Match.Maybe(Array),
			}),
		);

		const { requestTagBeforeClosingChat, chatClosingTags, fallbackForwardDepartment } = departmentData;
		if (requestTagBeforeClosingChat && (!chatClosingTags || chatClosingTags.length === 0)) {
			throw new Meteor.Error(
				'error-validating-department-chat-closing-tags',
				'At least one closing tag is required when the department requires tag(s) on closing conversations.',
				{ method: 'livechat:saveDepartment' },
			);
		}

		if (_id && !department) {
			throw new Meteor.Error('error-department-not-found', 'Department not found', {
				method: 'livechat:saveDepartment',
			});
		}

		if (fallbackForwardDepartment === _id) {
			throw new Meteor.Error(
				'error-fallback-department-circular',
				'Cannot save department. Circular reference between fallback department and department',
			);
		}

		if (fallbackForwardDepartment && !(await LivechatDepartmentRaw.findOneById(fallbackForwardDepartment))) {
			throw new Meteor.Error('error-fallback-department-not-found', 'Fallback department not found', { method: 'livechat:saveDepartment' });
		}

		const departmentDB = await LivechatDepartmentRaw.createOrUpdateDepartment(_id, departmentData);
		if (departmentDB && departmentAgents) {
			await updateDepartmentAgents(departmentDB._id, departmentAgents, departmentDB.enabled);
		}

		return departmentDB;
	},

	async isDepartmentCreationAvailable() {
		return hasLicense('livechat-enterprise') || (await LivechatDepartmentRaw.countTotal()) === 0;
	},
};

const DEFAULT_RACE_TIMEOUT = 5000;
let queueDelayTimeout = DEFAULT_RACE_TIMEOUT;

const queueWorker = {
	running: false,
	queues: [],
	async start() {
		queueLogger.debug('Starting queue');
		if (this.running) {
			queueLogger.debug('Queue already running');
			return;
		}

		const activeQueues = await this.getActiveQueues();
		queueLogger.debug(`Active queues: ${activeQueues.length}`);

		this.running = true;
		return this.execute();
	},
	async stop() {
		queueLogger.debug('Stopping queue');
		await LivechatInquiry.unlockAll();

		this.running = false;
	},
	async getActiveQueues() {
		// undefined = public queue(without department)
		return [undefined].concat(await LivechatInquiry.getDistinctQueuedDepartments());
	},
	async nextQueue() {
		if (!this.queues.length) {
			queueLogger.debug('No more registered queues. Refreshing');
			this.queues = await this.getActiveQueues();
		}

		return this.queues.shift();
	},
	async execute() {
		if (!this.running) {
			queueLogger.debug('Queue stopped. Cannot execute');
			return;
		}

		const queue = await this.nextQueue();
		queueLogger.debug(`Executing queue ${queue || 'Public'} with timeout of ${queueDelayTimeout}`);

		setTimeout(this.checkQueue.bind(this, queue), queueDelayTimeout);
	},

	async checkQueue(queue) {
		queueLogger.debug(`Processing items for queue ${queue || 'Public'}`);
		try {
			const nextInquiry = await LivechatInquiry.findNextAndLock(getInquirySortMechanismSetting(), queue);
			if (!nextInquiry) {
				queueLogger.debug(`No more items for queue ${queue || 'Public'}`);
				return;
			}

			const result = await processWaitingQueue(queue, nextInquiry);

			if (!result) {
				await LivechatInquiry.unlock(nextInquiry._id);
			}
		} catch (e) {
			queueLogger.error({
				msg: `Error processing queue ${queue || 'public'}`,
				err: e,
			});
		} finally {
			this.execute();
		}
	},
};

let omnichannelIsEnabled = false;
function shouldQueueStart() {
	if (!omnichannelIsEnabled) {
		queueWorker.stop();
		return;
	}

	const routingSupportsAutoAssign = RoutingManager.getConfig().autoAssignAgent;
	queueLogger.debug(
		`Routing method ${RoutingManager.methodName} supports auto assignment: ${routingSupportsAutoAssign}. ${
			routingSupportsAutoAssign ? 'Starting' : 'Stopping'
		} queue`,
	);

	routingSupportsAutoAssign ? queueWorker.start() : queueWorker.stop();
}

RoutingManager.startQueue = shouldQueueStart;

settings.watch('Livechat_enabled', (enabled) => {
	omnichannelIsEnabled = enabled;
	omnichannelIsEnabled && RoutingManager.isMethodSet() ? shouldQueueStart() : queueWorker.stop();
});

settings.watch('Omnichannel_queue_delay_timeout', (timeout) => {
	queueDelayTimeout = timeout < 1 ? DEFAULT_RACE_TIMEOUT : timeout * 1000;
});
