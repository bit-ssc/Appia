import type { ILivechatTag } from '@rocket.chat/core-typings';
import type { ILivechatTagModel } from '@rocket.chat/model-typings';
import type { Db, DeleteResult, FindOptions, IndexDescription } from 'mongodb';

import { BaseRaw } from '../../../../server/models/raw/BaseRaw';

export class LivechatTagRaw extends BaseRaw<ILivechatTag> implements ILivechatTagModel {
	constructor(db: Db) {
		super(db, 'livechat_tag');
	}

	protected modelIndexes(): IndexDescription[] {
		return [
			{
				key: {
					name: 1,
				},
				unique: true,
			},
		];
	}

	findOneById(_id: string, options?: FindOptions<ILivechatTag>): Promise<ILivechatTag | null> {
		const query = { _id };

		return this.findOne(query, options);
	}

	async createOrUpdateTag(
		_id: string,
		{ name, description }: { name: string; description: string },
		departments: string[] = [],
	): Promise<ILivechatTag> {
		const record = {
			name,
			description,
			numDepartments: departments.length,
			departments,
		};

		if (_id) {
			await this.updateOne({ _id }, { $set: record });
		} else {
			_id = (await this.insertOne(record)).insertedId;
		}

		return Object.assign(record, { _id });
	}

	// REMOVE
	removeById(_id: string): Promise<DeleteResult> {
		const query = { _id };

		return this.deleteOne(query);
	}
}
