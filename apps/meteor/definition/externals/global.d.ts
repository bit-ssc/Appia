// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Server } from 'net';

declare global {
	interface Navigator {
		/** @deprecated */
		readonly userLanguage?: string;
		getUserMedia?: (
			this: Navigator,
			constraints?: MediaStreamConstraints | undefined,
			onSuccess?: (stream: MediaStream) => void,
			onError?: (error: any) => void,
		) => void;
		webkitGetUserMedia?: (
			this: Navigator,
			constraints?: MediaStreamConstraints | undefined,
			onSuccess?: (stream: MediaStream) => void,
			onError?: (error: any) => void,
		) => void;
		mozGetUserMedia?: (
			this: Navigator,
			constraints?: MediaStreamConstraints | undefined,
			onSuccess?: (stream: MediaStream) => void,
			onError?: (error: any) => void,
		) => void;
		msGetUserMedia?: (
			this: Navigator,
			constraints?: MediaStreamConstraints | undefined,
			onSuccess?: (stream: MediaStream) => void,
			onError?: (error: any) => void,
		) => void;
	}

	const __meteor_runtime_config__: {
		ROOT_URL_PATH_PREFIX: string;
		ROOT_URL: string;
	};

	interface Window {
		setLanguage?: (language: string) => void;
		defaultUserLanguage?: () => string;
		DISABLE_ANIMATION?: boolean;
		lastMessageWindow?: Record<string, unknown>;
		lastMessageWindowHistory?: Record<string, unknown>;
		favico?: any;
		USE_REST_FOR_DDP_CALLS?: boolean;
		ECDH_Enabled?: boolean;
		__meteor_runtime_config__: {
			ROOT_URL_PATH_PREFIX: string;
			ROOT_URL: string;
		};
	}

	interface PromiseConstructor {
		await<T>(promise: Promise<T>): T;
		await<T>(value: T): T;
	}

	namespace NodeJS {
		interface Process {
			emit(event: 'message', message: any, sendHandle?: Server | Socket): boolean;
		}
	}
}
