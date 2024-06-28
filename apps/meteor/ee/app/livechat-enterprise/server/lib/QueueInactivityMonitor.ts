import type { Db } from 'mongodb';
import { Agenda } from '@rocket.chat/agenda';
import { MongoInternals } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import type { IUser, IOmnichannelRoom } from '@rocket.chat/core-typings';
import { LivechatRooms, LivechatInquiry as LivechatInquiryRaw, Users } from '@rocket.chat/models';

import { settings } from '../../../../../app/settings/server';
import { Logger } from '../../../../../app/logger/server';
import { Livechat } from '../../../../../app/livechat/server/lib/LivechatTyped';

const SCHEDULER_NAME = 'omnichannel_queue_inactivity_monitor';

class OmnichannelQueueInactivityMonitorClass {
	scheduler: Agenda;

	running: boolean;

	logger: Logger;

	_name: string;

	user: IUser;

	message: string;

	_db: Db;

	bindedCloseRoom: any;

	constructor() {
		this._db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;
		this.running = false;
		this._name = 'Omnichannel-Queue-Inactivity-Monitor';
		this.logger = new Logger('QueueInactivityMonitor');
		this.scheduler = new Agenda({
			mongo: (MongoInternals.defaultRemoteCollectionDriver().mongo as any).client.db(),
			db: { collection: SCHEDULER_NAME },
			defaultConcurrency: 1,
		});
		this.createIndex();
		const language = settings.get<string>('Language') || 'en';
		this.message = TAPi18n.__('Closed_automatically_chat_queued_too_long', { lng: language });
		this.bindedCloseRoom = this.closeRoom.bind(this);
	}

	private async getRocketCatUser(): Promise<IUser | null> {
		return Users.findOneById('rocket.cat');
	}

	getName(inquiryId: string): string {
		return `${this._name}-${inquiryId}`;
	}

	createIndex(): void {
		void this._db.collection(SCHEDULER_NAME).createIndex(
			{
				'data.inquiryId': 1,
			},
			{ unique: true },
		);
	}

	async start(): Promise<void> {
		if (this.running) {
			return;
		}

		await this.scheduler.start();
		this.running = true;
	}

	async scheduleInquiry(inquiryId: string, time: Date): Promise<void> {
		await this.stopInquiry(inquiryId);
		this.logger.debug(`Scheduling automatic close of inquiry ${inquiryId} at ${time}`);
		const name = this.getName(inquiryId);
		this.scheduler.define(name, this.bindedCloseRoom);

		const job = this.scheduler.create(name, { inquiryId });
		job.schedule(time);
		job.unique({ 'data.inquiryId': inquiryId });
		await job.save();
	}

	async stop(): Promise<void> {
		if (!this.running) {
			return;
		}
		await this.scheduler.cancel({});
	}

	async stopInquiry(inquiryId: string): Promise<void> {
		const name = this.getName(inquiryId);
		await this.scheduler.cancel({ name });
	}

	async closeRoomAction(room: IOmnichannelRoom): Promise<void> {
		const comment = this.message;
		return Livechat.closeRoom({
			comment,
			room,
			user: await this.getRocketCatUser(),
		});
	}

	async closeRoom({ attrs: { data } }: any = {}): Promise<void> {
		const { inquiryId } = data;
		const inquiry = await LivechatInquiryRaw.findOneById(inquiryId);
		this.logger.debug(`Processing inquiry item ${inquiryId}`);
		if (!inquiry || inquiry.status !== 'queued') {
			this.logger.debug(`Skipping inquiry ${inquiryId}. Invalid or not queued anymore`);
			return;
		}

		const room = await LivechatRooms.findOneById(inquiry.rid);
		if (!room) {
			this.logger.error(`Error: unable to find room ${inquiry.rid} for inquiry ${inquiryId} to close in queue inactivity monitor`);
			return;
		}

		await Promise.all([this.closeRoomAction(room), this.stopInquiry(inquiryId)]);

		this.logger.debug(`Running successful. Closed inquiry ${inquiry._id} because of inactivity`);
	}
}

export const OmnichannelQueueInactivityMonitor = new OmnichannelQueueInactivityMonitorClass();

Meteor.startup(async () => {
	void OmnichannelQueueInactivityMonitor.start();
});
