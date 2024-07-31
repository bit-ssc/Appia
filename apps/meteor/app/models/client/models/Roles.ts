import type { IRole, IRoom, IUser } from '@rocket.chat/core-typings';
import { Mongo } from 'meteor/mongo';
import { ReactiveVar } from 'meteor/reactive-var';

import { ChatSubscription } from './ChatSubscription';
import { Users } from './Users';
import type { MinimongoCollection } from '../../../../client/definitions/MinimongoCollection';

class RolesCollection extends Mongo.Collection<IRole> implements MinimongoCollection<IRole> {
	ready = new ReactiveVar(false);

	constructor() {
		super(null);
	}

	findUsersInRole(roleId: IRole['_id'], scope: IRoom['_id'], options: any) {
		const role = this.findOne(roleId);
		const roleScope = role?.scope || 'Users';

		switch (roleScope) {
			case 'Subscriptions':
				return ChatSubscription.findUsersInRoles(roleId, scope, options);

			case 'Users':
				return Users.findUsersInRoles(roleId, scope, options);

			default:
				return undefined;
		}
	}

	isUserInRoles(userId: IUser['_id'], roles: IRole['_id'][] | IRole['_id'], scope?: string, ignoreSubscriptions = false) {
		roles = Array.isArray(roles) ? roles : [roles];
		return roles.some((roleId) => {
			const role = this.findOne(roleId);
			const roleScope = ignoreSubscriptions ? 'Users' : role?.scope || 'Users';

			switch (roleScope) {
				case 'Subscriptions':
					return ChatSubscription.isUserInRole(userId, roleId, scope);

				case 'Users':
					return Users.isUserInRole(userId, roleId);

				default:
					return false;
			}
		});
	}

	public declare _collection: MinimongoCollection<IRole>['_collection'];

	public declare queries: MinimongoCollection<IRole>['queries'];
}

/** @deprecated */
export const Roles = new RolesCollection();
