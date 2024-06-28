import type { IApiService } from '../types/IApiService';
import type { IBroker, IBrokerNode } from '../types/IBroker';
import type { IServiceClass } from '../types/ServiceClass';
import type { EventSignatures } from '../Events';

export class Api implements IApiService {
	private services: Set<IServiceClass> = new Set<IServiceClass>();

	private broker?: IBroker;

	// set a broker for the API and registers all services in the broker
	setBroker(broker: IBroker): void {
		this.broker = broker;

		this.services.forEach((service) => this.broker?.createService(service));
	}

	destroyService(instance: IServiceClass): void {
		if (!this.services.has(instance)) {
			return;
		}

		if (this.broker) {
			this.broker.destroyService(instance);
		}

		this.services.delete(instance);
	}

	registerService(instance: IServiceClass, serviceDependencies?: string[]): void {
		this.services.add(instance);

		instance.setApi(this);

		if (this.broker) {
			this.broker.createService(instance, serviceDependencies);
		}
	}

	async call(method: string, data?: unknown): Promise<any> {
		return this.broker?.call(method, data);
	}

	async waitAndCall(method: string, data: any): Promise<any> {
		return this.broker?.waitAndCall(method, data);
	}

	async broadcast<T extends keyof EventSignatures>(event: T, ...args: Parameters<EventSignatures[T]>): Promise<void> {
		return this.broker?.broadcast(event, ...args);
	}

	async broadcastToServices<T extends keyof EventSignatures>(
		services: string[],
		event: T,
		...args: Parameters<EventSignatures[T]>
	): Promise<void> {
		return this.broker?.broadcastToServices(services, event, ...args);
	}

	async broadcastLocal<T extends keyof EventSignatures>(event: T, ...args: Parameters<EventSignatures[T]>): Promise<void> {
		return this.broker?.broadcastLocal(event, ...args);
	}

	nodeList(): Promise<IBrokerNode[]> {
		if (!this.broker) {
			throw new Error('No broker set to start.');
		}
		return this.broker.nodeList();
	}

	async start(): Promise<void> {
		if (!this.broker) {
			throw new Error('No broker set to start.');
		}
		await this.broker.start();
	}
}
