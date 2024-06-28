import type { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { UIKitIncomingInteractionType } from '@rocket.chat/apps-engine/definition/uikit';
import { AppInterface } from '@rocket.chat/apps-engine/definition/metadata';
import { UiKitCoreApp } from '@rocket.chat/core-services';

import { settings } from '../../../../app/settings/server';
import type { AppServerOrchestrator } from '../orchestrator';
import { Apps } from '../orchestrator';
import { authenticationMiddleware } from '../../../../app/api/server/middlewares/authentication';

const apiServer = express();

apiServer.disable('x-powered-by');

let corsEnabled = false;
let allowListOrigins: string[] = [];

settings.watch('API_Enable_CORS', (value: boolean) => {
	corsEnabled = value;
});

settings.watch('API_CORS_Origin', (value: string) => {
	allowListOrigins = value
		? value
				.trim()
				.split(',')
				.map((origin) => String(origin).trim().toLocaleLowerCase())
		: [];
});

WebApp.connectHandlers.use(apiServer);

// eslint-disable-next-line new-cap
const router = express.Router();

const unauthorized = (res: Response): unknown =>
	res.status(401).send({
		status: 'error',
		message: 'You must be logged in to do this.',
	});

Meteor.startup(() => {
	// use specific rate limit of 600 (which is 60 times the default limits) requests per minute (around 10/second)
	const apiLimiter = rateLimit({
		windowMs: settings.get('API_Enable_Rate_Limiter_Limit_Time_Default'),
		max: (settings.get('API_Enable_Rate_Limiter_Limit_Calls_Default') as number) * 60,
		skip: () =>
			settings.get('API_Enable_Rate_Limiter') !== true ||
			(process.env.NODE_ENV === 'development' && settings.get('API_Enable_Rate_Limiter_Dev') !== true),
	});

	router.use(apiLimiter);
});

router.use(authenticationMiddleware({ rejectUnauthorized: false }));

router.use(async (req: Request, res, next) => {
	const { 'x-visitor-token': visitorToken } = req.headers;

	if (visitorToken) {
		req.body.visitor = await Apps.getConverters()?.get('visitors').convertByToken(visitorToken);
	}

	if (!req.user && !req.body.visitor) {
		return unauthorized(res);
	}

	next();
});

const corsOptions: cors.CorsOptions = {
	origin: (origin, callback) => {
		if (
			!origin ||
			!corsEnabled ||
			allowListOrigins.includes('*') ||
			allowListOrigins.includes(origin) ||
			origin === settings.get('Site_Url')
		) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'), false);
		}
	},
};

apiServer.use('/api/apps/ui.interaction/', cors(corsOptions), router); // didn't have the rateLimiter option

const getPayloadForType = (type: UIKitIncomingInteractionType, req: Request) => {
	if (type === UIKitIncomingInteractionType.BLOCK) {
		const { type, actionId, triggerId, mid, rid, payload, container } = req.body;

		const { visitor } = req.body;
		const { user } = req;

		const room = rid; // orch.getConverters().get('rooms').convertById(rid);
		const message = mid;

		return {
			type,
			container,
			actionId,
			message,
			triggerId,
			payload,
			user,
			visitor,
			room,
		} as const;
	}

	if (type === UIKitIncomingInteractionType.VIEW_CLOSED) {
		const {
			type,
			actionId,
			payload: { view, isCleared },
		} = req.body;

		const { user } = req;

		return {
			type,
			actionId,
			user,
			payload: {
				view,
				isCleared,
			},
		};
	}

	if (type === UIKitIncomingInteractionType.VIEW_SUBMIT) {
		const { type, actionId, triggerId, payload } = req.body;

		const { user } = req;

		return {
			type,
			actionId,
			triggerId,
			payload,
			user,
		};
	}

	throw new Error('Type not supported');
};

router.post('/:appId', async (req, res, next) => {
	const { appId } = req.params;

	const isCore = await UiKitCoreApp.isRegistered(appId);
	if (!isCore) {
		return next();
	}

	// eslint-disable-next-line prefer-destructuring
	const type: UIKitIncomingInteractionType = req.body.type;

	try {
		const payload = {
			...getPayloadForType(type, req),
			appId,
		};

		const result = await (UiKitCoreApp as any)[type](payload); // TO-DO: fix type

		// Using ?? to always send something in the response, even if the app had no result.
		res.send(result ?? {});
	} catch (e) {
		const error = e instanceof Error ? e.message : e;
		res.status(500).send({ error });
	}
});

const appsRoutes =
	(orch: AppServerOrchestrator) =>
	async (req: Request, res: Response): Promise<void> => {
		const { appId } = req.params;

		const { type } = req.body;

		switch (type) {
			case UIKitIncomingInteractionType.BLOCK: {
				const { type, actionId, triggerId, mid, rid, payload, container } = req.body;

				const { visitor } = req.body;
				const room = await orch.getConverters()?.get('rooms').convertById(rid);
				const user = orch.getConverters()?.get('users').convertToApp(req.user);
				const message = mid && (await orch.getConverters()?.get('messages').convertById(mid));

				const action = {
					type,
					container,
					appId,
					actionId,
					message,
					triggerId,
					payload,
					user,
					visitor,
					room,
				};

				try {
					const eventInterface = !visitor ? AppInterface.IUIKitInteractionHandler : AppInterface.IUIKitLivechatInteractionHandler;

					const result = await orch.triggerEvent(eventInterface, action);

					res.send(result);
				} catch (e) {
					const error = e instanceof Error ? e.message : e;
					res.status(500).send({ error });
				}
				break;
			}

			case UIKitIncomingInteractionType.VIEW_CLOSED: {
				const {
					type,
					actionId,
					payload: { view, isCleared },
				} = req.body;

				const user = orch.getConverters()?.get('users').convertToApp(req.user);

				const action = {
					type,
					appId,
					actionId,
					user,
					payload: {
						view,
						isCleared,
					},
				};

				try {
					const result = await orch.triggerEvent('IUIKitInteractionHandler', action);

					res.send(result);
				} catch (e) {
					const error = e instanceof Error ? e.message : e;
					res.status(500).send({ error });
				}
				break;
			}

			case UIKitIncomingInteractionType.VIEW_SUBMIT: {
				const { type, actionId, triggerId, payload } = req.body;

				const user = orch.getConverters()?.get('users').convertToApp(req.user);

				const action = {
					type,
					appId,
					actionId,
					triggerId,
					payload,
					user,
				};

				try {
					const result = await orch.triggerEvent('IUIKitInteractionHandler', action);

					res.send(result);
				} catch (e) {
					const error = e instanceof Error ? e.message : e;
					res.status(500).send({ error });
				}
				break;
			}

			case UIKitIncomingInteractionType.ACTION_BUTTON: {
				const {
					type,
					actionId,
					triggerId,
					rid,
					mid,
					payload: { context },
				} = req.body;

				const room = await orch.getConverters()?.get('rooms').convertById(rid);
				const user = orch.getConverters()?.get('users').convertToApp(req.user);
				const message = mid && (await orch.getConverters()?.get('messages').convertById(mid));

				const action = {
					type,
					appId,
					actionId,
					triggerId,
					user,
					room,
					message,
					payload: {
						context,
					},
				};

				try {
					const result = await orch.triggerEvent('IUIKitInteractionHandler', action);

					res.send(result);
				} catch (e) {
					const error = e instanceof Error ? e.message : e;
					res.status(500).send({ error });
				}
				break;
			}

			default: {
				res.status(400).send({ error: 'Unknown action' });
			}
		}

		// TODO: validate payloads per type
	};

export class AppUIKitInteractionApi {
	orch: AppServerOrchestrator;

	constructor(orch: AppServerOrchestrator) {
		this.orch = orch;

		router.post('/:appId', appsRoutes(orch));
	}
}
