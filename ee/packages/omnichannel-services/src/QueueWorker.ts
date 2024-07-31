import type { Db } from 'mongodb';
import type { Actions, ValidResult, Work } from 'mongo-message-queue';
import MessageQueue from 'mongo-message-queue';
import { ServiceClass, api, License } from '@rocket.chat/core-services';
import type { IQueueWorkerService, HealthAggResult } from '@rocket.chat/core-services';

import type { Logger } from '../../../../apps/meteor/server/lib/logger/Logger';

export class QueueWorker extends ServiceClass implements IQueueWorkerService {
	protected name = 'queue-worker';

	protected retryCount = 5;

	// Default delay is 5 seconds
	protected retryDelay = 5000;

	protected queue: MessageQueue;

	private logger: Logger;

	private shouldWork = true;

	constructor(private readonly db: Db, loggerClass: typeof Logger) {
		super();

		// eslint-disable-next-line new-cap
		this.logger = new loggerClass('QueueWorker');
		this.queue = new MessageQueue();

		this.onEvent('license.module', ({ module, valid }) => {
			if (module === 'scalability') {
				this.shouldWork = valid;
			}
		});
	}

	async started(): Promise<void> {
		try {
			this.shouldWork = await License.hasLicense('scalability');
		} catch (e: unknown) {
			// ignore
		}
	}

	isServiceNotFoundMessage(message: string): boolean {
		return message.includes('is not found');
	}

	isServiceRetryError(message: string): boolean {
		return message.includes('retry');
	}

	async created(): Promise<void> {
		this.logger.info('Starting queue worker');
		this.queue.databasePromise = () => {
			return Promise.resolve(this.db);
		};

		try {
			await this.registerWorkers();
			await this.createIndexes();
		} catch (e) {
			this.logger.fatal(e, 'Fatal error occurred when registering workers');
			process.exit(1);
		}
	}

	async createIndexes(): Promise<void> {
		this.logger.info('Creating indexes for queue worker');

		// Library doesnt create indexes by itself, for some reason
		// This should create the indexes we need and improve queue perf on reading
		await this.db.collection(this.queue.collectionName).createIndex({ type: 1 });
		await this.db.collection(this.queue.collectionName).createIndex({ rejectedTime: 1 }, { sparse: true });
		await this.db.collection(this.queue.collectionName).createIndex({ nextReceivableTime: 1 }, { sparse: true });
		await this.db.collection(this.queue.collectionName).createIndex({ receivedTime: 1 }, { sparse: true });
	}

	async stopped(): Promise<void> {
		this.logger.info('Stopping queue worker');
		this.queue.stopPolling();
	}

	private isRetryableError(error: string): boolean {
		// Let's retry on 2 circumstances: (for now)
		// 1. When the error is "service not found" -> this means the service is not yet registered
		// 2. When the error is "retry" -> this means the service is registered, but is not willing to process it right now, maybe due to load
		return this.isServiceNotFoundMessage(error) || this.isServiceRetryError(error);
	}

	private async workerCallback(queueItem: Work<{ to: string; data: any }>): Promise<ValidResult> {
		this.logger.info(`Processing queue item ${queueItem._id} for work`);
		this.logger.info(`Queue item is trying to call ${queueItem.message.to}`);
		try {
			await api.waitAndCall(queueItem.message.to, [queueItem.message]);
			this.logger.info(`Queue item ${queueItem._id} completed`);
			return 'Completed' as const;
		} catch (err: unknown) {
			const e = err as Error;
			this.logger.error(`Queue item ${queueItem._id} errored: ${e.message}`);
			queueItem.releasedReason = e.message;
			// Let's only retry for X times when the error is "service not found"
			// For any other error, we'll just reject the item
			if ((queueItem.retryCount || 0) < this.retryCount && this.isRetryableError(e.message)) {
				this.logger.info(`Queue item ${queueItem._id} will be retried in 10 seconds`);
				queueItem.nextReceivableTime = new Date(Date.now() + this.retryDelay);
				return 'Retry' as const;
			}
			this.logger.info(`Queue item ${queueItem._id} will be rejected`);
			return 'Rejected' as const;
		}
	}

	// Registers the actual workers, the actions lib will try to fetch elements to work on
	private async registerWorkers(): Promise<void> {
		this.logger.info('Registering workers of type "work"');
		this.queue.registerWorker('work', this.workerCallback.bind(this));

		this.logger.info('Registering workers of type "workComplete"');
		this.queue.registerWorker('workComplete', this.workerCallback.bind(this));
	}

	private matchServiceCall(service: string): boolean {
		const [namespace, action] = service.split('.');
		if (!namespace || !action) {
			return false;
		}
		return true;
	}

	// Queues an action of type "X" to be processed by the workers
	// Action receives a record of unknown data that will be passed to the actual service
	// `to` is a service name that will be called, including namespace + action
	// This is a "generic" job that allows you to call any service
	async queueWork<T extends Record<string, unknown>>(queue: Actions, to: string, data: T): Promise<void> {
		if (!this.shouldWork) {
			this.logger.info('Queue worker is disabled, not queueing work');
			return;
		}

		this.logger.info(`Queueing work for ${to}`);
		if (!this.matchServiceCall(to)) {
			// We don't want to queue calls to invalid service names
			throw new Error(`Invalid service name ${to}`);
		}

		await this.queue.enqueue<typeof data>(queue, { ...data, to });
	}

	async queueInfo(): Promise<HealthAggResult[]> {
		return this.db
			.collection(this.queue.collectionName)
			.aggregate<HealthAggResult>([
				{
					$addFields: {
						status: { $cond: [{ $ifNull: ['$rejectionReason', false] }, 'Rejected', 'In progress'] },
					},
				},
				{ $group: { _id: { type: '$type', status: '$status' }, elements: { $push: '$$ROOT' }, total: { $sum: 1 } } },
				// Project from each group the type, status and total of elements
				{ $project: { _id: 0, type: '$_id.type', status: '$_id.status', total: 1 } },
			])
			.toArray();
	}
}
