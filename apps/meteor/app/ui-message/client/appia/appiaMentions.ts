const KEY = 'appia_mentions_';
const CHANNEL_KEY = 'appia_channel_mentions_';

interface IMention {
	n: string;
	u: string;
}

interface IChannelMention {
	n: string;
	f: string;
}

export const appiaMentions = {
	reset: (rid: string): void => {
		localStorage.removeItem(`${KEY}${rid}`);
	},
	get: (rid: string): IMention[] => {
		try {
			const data = localStorage.getItem(`${KEY}${rid}`);

			if (data) {
				return JSON.parse(data);
			}
		} catch (e) {
			console.log(e);
		}

		return [];
	},
	set: (rid: string, username: string, name: string): void => {
		const data = appiaMentions.get(rid);

		if (!data.find((m) => m.u === username)) {
			data.push({
				n: name,
				u: username,
			});

			localStorage.setItem(`${KEY}${rid}`, JSON.stringify(data));
		}
	},
};

export const appiaChannelMentions = {
	reset: (rid: string): void => {
		localStorage.removeItem(`${CHANNEL_KEY}${rid}`);
	},
	get: (rid: string): IChannelMention[] => {
		try {
			const data = localStorage.getItem(`${CHANNEL_KEY}${rid}`);

			if (data) {
				return JSON.parse(data);
			}
		} catch (e) {
			console.log(e);
		}

		return [];
	},
	set: (rid: string, name: string, fname: string): void => {
		const data = appiaChannelMentions.get(rid);

		if (!data.find((m) => m.n === name)) {
			data.push({
				n: name,
				f: fname,
			});

			localStorage.setItem(`${CHANNEL_KEY}${rid}`, JSON.stringify(data));
		}
	},
};
