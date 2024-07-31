import type { IAppiaLog } from '@rocket.chat/core-typings';
import type { UpdateResult, InsertOneResult, WithId } from 'mongodb';

import type { IBaseModel } from './IBaseModel';

export interface IAppiaLogModel extends IBaseModel<IAppiaLog> {
	findByName(name: string): any;

	findUserByDataKey(dataKey: string): any;

	updateByDataKey(dataKey: string, content: string): Promise<UpdateResult>;

	insertData(
		name: string,
		platform: string,
		module: string,
		level: string,
		tag: string,
		user_info: string,
		content: string,
	): Promise<InsertOneResult<WithId<IAppiaLog>>>;
}
