import type { ISetting } from '@rocket.chat/core-typings';

import type { ICachedSettings } from '../CachedSettings';

type Dictionary = {
	[index: string]: any;
};

class SettingsClass {
	settings: ICachedSettings;

	find(): any[] {
		return [];
	}

	public data = new Map<string, Dictionary>();

	public upsertCalls = 0;

	public insertCalls = 0;

	private checkQueryMatch(key: string, data: Dictionary, queryValue: any): boolean {
		if (typeof queryValue === 'object') {
			if (queryValue.$exists !== undefined) {
				return (data.hasOwnProperty(key) && data[key] !== undefined) === queryValue.$exists;
			}
		}

		return queryValue === data[key];
	}

	findOne(query: Dictionary): any {
		return [...this.data.values()].find((data) => Object.entries(query).every(([key, value]) => this.checkQueryMatch(key, data, value)));
	}

	insertOne(doc: any): void {
		this.data.set(doc._id, doc);
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		this.settings.set(doc);
		this.insertCalls++;
	}

	updateOne(query: any, update: any, options?: any): void {
		const existent = this.findOne(query);

		const data = { ...existent, ...query, ...update, ...update.$set };

		if (!existent) {
			Object.assign(data, update.$setOnInsert);
		}

		if (update.$unset) {
			Object.keys(update.$unset).forEach((key) => {
				delete data[key];
			});
		}

		const modifiers = ['$set', '$setOnInsert', '$unset'];

		modifiers.forEach((key) => {
			delete data[key];
		});

		if (options?.upsert === true && !modifiers.some((key) => Object.keys(update).includes(key))) {
			throw new Error('Invalid upsert');
		}

		// console.log(query, data);
		this.data.set(query._id, data);

		// Can't import before the mock command on end of this file!
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		this.settings.set(data);

		this.upsertCalls++;
	}

	updateValueById(id: string, value: any): void {
		this.data.set(id, { ...this.data.get(id), value });

		// Can't import before the mock command on end of this file!
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		this.settings.set(this.data.get(id) as ISetting);
	}
}

export const Settings = new SettingsClass();
