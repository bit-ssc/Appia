import { getUnitsFromUser } from './units';

// TODO: We need to add a new index in the departmentAncestors field

export const addQueryRestrictionsToRoomsModel = (originalQuery = {}) => {
	const query = { ...originalQuery };

	const units = Promise.await(getUnitsFromUser());
	if (!Array.isArray(units)) {
		return query;
	}

	const expressions = query.$and || [];
	const condition = {
		$or: [{ departmentAncestors: { $in: units } }, { departmentId: { $in: units } }],
	};
	query.$and = [condition, ...expressions];
	return query;
};

export const addQueryRestrictionsToDepartmentsModel = async (originalQuery = {}) => {
	const query = { ...originalQuery, type: { $ne: 'u' } };

	const units = await getUnitsFromUser();
	if (Array.isArray(units)) {
		query.ancestors = { $in: units };
	}

	return query;
};
