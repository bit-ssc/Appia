import { CachedCollection } from '../../../ui-cached-collection/client';

interface IMessageSetting {
	showImageSummary?: boolean;
	showDocumentSummary?: boolean;
}
class CachedMessageSetting extends CachedCollection<IMessageSetting> {
	constructor() {
		super({ name: 'message-settings', checkUpdatedAt: false });
	}

	async init() {
		await this.loadFromCache();
	}
}

const instance = new CachedMessageSetting();

export const MessageSetting = Object.assign(instance.collection, {
	async setMessageSettingById(this: typeof instance.collection, _id: string, value: Record<string, unknown>) {
		const res = this.upsert({ _id }, { $set: value });
		instance.updatedAt = new Date();
		await instance.save();
		return res;
	},

	async getMessageSettingById(this: typeof instance.collection, _id: string) {
		return this.findOne({ _id });
	},
});
