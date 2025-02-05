import type { IAppiaRecord } from '@rocket.chat/core-typings';
import type { UpdateResult } from 'mongodb';

import type { IBaseModel } from './IBaseModel';

export interface IAppiaRecordModel extends IBaseModel<IAppiaRecord> {
	findByName(name: string): any;

	findUserByDataKey(dataKey: string): any;

	insertData(name: string, module: string, tag: string, user_info: string, content: string): Promise<UpdateResult>;
}
