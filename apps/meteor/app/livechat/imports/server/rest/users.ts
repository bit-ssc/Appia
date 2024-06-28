import { check } from 'meteor/check';
import _ from 'underscore';
import { isLivechatUsersManagerGETProps, isPOSTLivechatUsersTypeProps } from '@rocket.chat/rest-typings';
import { Users } from '@rocket.chat/models';

import { API } from '../../../../api/server';
import { Livechat } from '../../../server/lib/Livechat';
import { findAgents, findManagers } from '../../../server/api/lib/users';
import { hasAtLeastOnePermissionAsync } from '../../../../authorization/server/functions/hasPermission';
import { getPaginationItems } from '../../../../api/server/helpers/getPaginationItems';

API.v1.addRoute(
	'livechat/users/:type',
	{
		authRequired: true,
		permissionsRequired: {
			GET: {
				permissions: ['manage-livechat-agents'],
				operation: 'hasAll',
			},
			POST: { permissions: ['view-livechat-manager'], operation: 'hasAll' },
		},
		validateParams: {
			GET: isLivechatUsersManagerGETProps,
			POST: isPOSTLivechatUsersTypeProps,
		},
	},
	{
		async get() {
			check(this.urlParams, {
				type: String,
			});
			const { offset, count } = await getPaginationItems(this.queryParams);
			const { sort } = await this.parseJsonQuery();
			const { text } = this.queryParams;

			if (this.urlParams.type === 'agent') {
				if (!(await hasAtLeastOnePermissionAsync(this.userId, ['transfer-livechat-guest', 'edit-omnichannel-contact']))) {
					return API.v1.unauthorized();
				}

				return API.v1.success(
					await findAgents({
						text,
						pagination: {
							offset,
							count,
							sort,
						},
					}),
				);
			}
			if (this.urlParams.type === 'manager') {
				if (!(await hasAtLeastOnePermissionAsync(this.userId, ['view-livechat-manager']))) {
					return API.v1.unauthorized();
				}

				return API.v1.success(
					await findManagers({
						text,
						pagination: {
							offset,
							count,
							sort,
						},
					}),
				);
			}
			throw new Error('Invalid type');
		},
		async post() {
			if (this.urlParams.type === 'agent') {
				const user = await Livechat.addAgent(this.bodyParams.username);
				if (user) {
					return API.v1.success({ user });
				}
			} else if (this.urlParams.type === 'manager') {
				const user = await Livechat.addManager(this.bodyParams.username);
				if (user) {
					return API.v1.success({ user });
				}
			} else {
				throw new Error('Invalid type');
			}

			return API.v1.failure();
		},
	},
);

API.v1.addRoute(
	'livechat/users/:type/:_id',
	{ authRequired: true, permissionsRequired: ['view-livechat-manager'] },
	{
		async get() {
			const user = await Users.findOneById(this.urlParams._id);

			if (!user) {
				return API.v1.failure('User not found');
			}

			let role;

			if (this.urlParams.type === 'agent') {
				role = 'livechat-agent';
			} else if (this.urlParams.type === 'manager') {
				role = 'livechat-manager';
			} else {
				throw new Error('Invalid type');
			}

			if (user.roles.indexOf(role) !== -1) {
				return API.v1.success({
					user: _.pick(user, '_id', 'username', 'name', 'status', 'statusLivechat', 'emails', 'livechat'),
				});
			}

			return API.v1.success({
				user: null,
			});
		},
		async delete() {
			const user = await Users.findOneById(this.urlParams._id);

			if (!user) {
				return API.v1.failure();
			}

			if (this.urlParams.type === 'agent') {
				if (await Livechat.removeAgent(user.username)) {
					return API.v1.success();
				}
			} else if (this.urlParams.type === 'manager') {
				if (await Livechat.removeManager(user.username)) {
					return API.v1.success();
				}
			} else {
				throw new Error('Invalid type');
			}

			return API.v1.failure();
		},
	},
);
