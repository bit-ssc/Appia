import type { IAppiaData } from '@rocket.chat/core-typings';
import type { UpdateResult, InsertOneResult, WithId } from 'mongodb';

import type { IBaseModel } from './IBaseModel';

export interface IAppiaDataModel extends IBaseModel<IAppiaData> {
	findByName(name: string): any;

	findByDataKey(dataKey: string): any;

	updateByDataKey(dataKey: string, content: string): Promise<UpdateResult>;

	insertData(name: string, dataKey: string, content: string): Promise<InsertOneResult<WithId<IAppiaData>>>;
}
