import { Team } from '@rocket.chat/core-services';

export const SpotlightEnterprise = {
	mapTeams(_, teams) {
		return teams.map((t) => {
			t.isTeam = true;
			t.username = t.name;
			t.status = 'online';
			return t;
		});
	},

	async _searchTeams(_, userId, { text, options, users, mentions }) {
		if (!mentions) {
			return users;
		}

		options.limit -= users.length;

		if (options.limit <= 0) {
			return users;
		}

		const teamOptions = { ...options, projection: { name: 1, type: 1 } };
		const teams = await Team.search(userId, text, teamOptions);
		users.push(...this.mapTeams(teams));

		return users;
	},

	async _performExtraUserSearches(_, userId, searchParams) {
		return this._searchTeams(userId, searchParams);
	},
};
