import { api, MeteorError } from '@rocket.chat/core-services';
import { Roles } from '@rocket.chat/models';
import type { IRole } from '@rocket.chat/core-typings';

import { isValidRoleScope } from '../../../../lib/roles/isValidRoleScope';

type InsertRoleOptions = {
	broadcastUpdate?: boolean;
};

export const insertRoleAsync = async (roleData: Omit<IRole, '_id'>, options: InsertRoleOptions = {}): Promise<IRole> => {
	const { name, scope, description, mandatory2fa } = roleData;

	if (await Roles.findOneByName(name)) {
		throw new MeteorError('error-duplicate-role-names-not-allowed', 'Role name already exists');
	}

	if (!isValidRoleScope(scope)) {
		throw new MeteorError('error-invalid-scope', 'Invalid scope');
	}

	const result = await Roles.createWithRandomId(name, scope, description, false, mandatory2fa);

	const roleId = result.insertedId;

	if (options.broadcastUpdate) {
		void api.broadcast('user.roleUpdate', {
			type: 'changed',
			_id: roleId,
		});
	}

	const newRole = await Roles.findOneById(roleId);
	if (!newRole) {
		throw new MeteorError('error-role-not-found', 'Role not found');
	}

	return newRole;
};
