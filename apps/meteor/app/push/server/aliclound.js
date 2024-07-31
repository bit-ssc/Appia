// This file is auto-generated, don't edit it
import Push20160801, * as $Push20160801 from '@alicloud/push20160801';
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
import * as $OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';
import { AppiaLog } from '@rocket.chat/models';

import { settings } from '../../settings/server';
import { logger } from './logger';
import { aliAccessKeyId, aliAccessKeySecret, aliEndpoint, aliAppKey } from '../../api/server/v1/appia/config';

const config = new $OpenApi.Config({
	// 你的 AccessKey ID
	accessKeyId: aliAccessKeyId,
	// 你的 AccessKey Secret
	accessKeySecret: aliAccessKeySecret,
	endpoint: aliEndpoint,
});
const appKey = aliAppKey;
const client = new Push20160801(config);
export const sendAliCloudAndroid = ({ userTokens, notification }) => {
	if (typeof notification.gcm === 'object') {
		notification = Object.assign({}, notification, notification.gcm);
	}

	// Make sure userTokens are an array of strings
	if (typeof userTokens === 'string') {
		userTokens = [userTokens];
	}

	// Check if any tokens in there to send
	if (!userTokens.length) {
		logger.debug('sendGCM no push tokens found');
		return;
	}

	logger.debug('[PUSH] AliCloud Push', userTokens, notification);

	const { rid } = notification;
	// Allow user to set payload
	// const data = notification.payload ? { ejson: EJSON.stringify(notification.payload) } : {};
	const data = {};

	data.title = notification.title || notification.sender.username;
	data.body = notification.text;

	// Set image
	if (notification.image != null) {
		data.image = notification.image;
	}

	if (notification.android_channel_id != null) {
		data.android_channel_id = notification.android_channel_id;
	} else {
		logger.debug(
			'For devices running Android 8.0 or later you are required to provide an android_channel_id. See https://github.com/raix/push/issues/341 for more info',
		);
	}

	// Set extra details
	if (notification.badge != null) {
		data.msgcnt = notification.badge;
	}
	if (notification.sound != null) {
		data.soundname = notification.sound;
	}
	if (notification.notId != null) {
		data.notId = notification.notId;
	}
	if (notification.style != null) {
		data.style = notification.style;
	}
	if (notification.summaryText != null) {
		data.summaryText = notification.summaryText;
	}
	if (notification.picture != null) {
		data.picture = notification.picture;
	}

	// Action Buttons
	if (notification.actions != null) {
		data.actions = notification.actions;
	}

	// Force Start
	if (notification.forceStart != null) {
		data['force-start'] = notification.forceStart;
	}

	if (notification.contentAvailable != null) {
		data['content-available'] = notification.contentAvailable;
	}

	const { badge } = notification;

	// logger.debug(`Create GCM Sender using "${options.gcm.apiKey}"`);
	const env = process.env.ENV_PROFILE || 'beta';
	// const company = process.env.COMPANY || 'TEST';
	let siteURL = settings.get('Site_Url') || '';
	siteURL = siteURL.toLowerCase().replace('https://', '');

	const androidOpenUrl = `test://room?path=channel/general&rid=${rid}&host=${siteURL}`;
	logger.debug('badge:', badge, 'env:', env, 'androidOpenUrl', androidOpenUrl);
	const timestamp = Date.parse(new Date());
	userTokens.forEach(async (value) => {
		logger.debug(`[PUSH] AliCloud, Send message to: ${value}`);
		const request = {
			deviceType: 'ANDROID',
			appKey,
			pushType: 'NOTICE',
			title: data.title,
			body: data.body,
			jobKey: 'jobKey',
			storeOffline: true,
			target: 'DEVICE',
			targetValue: value,
			// sendChannels: 'accs',
			androidNotificationChannel: 'channel_01',
			androidOpenType: 'URL',
			androidOpenUrl,
			androidPopupActivity: 'chat.rocket.reactnative.MainActivity',
			androidPopupTitle: data.title,
			androidPopupBody: data.body,
			androidVivoPushMode: 1,
			androidExtParameters: JSON.stringify({ badgeCount: badge, roomId: rid, timestamp }),
		};

		if (data.image != null) {
			request.image = data.image;
		}

		const pushRequest = new $Push20160801.PushRequest(request);

		const runtime = new $Util.RuntimeOptions({});

		try {
			// 复制代码运行请自行打印 API 的返回值
			const pushResp = await client.pushWithOptions(pushRequest, runtime);
			logger.debug('[PUSH] AliCloud PushResp:', pushResp);
			// await AppiaLog.insertData(
			// 	'AliCloudPushError',
			// 	'android',
			// 	'push',
			// 	'debug',
			// 	'',
			// 	{ userTokens },
			// 	{ data, appKey, notification, androidOpenUrl, env },
			// );
		} catch (error) {
			// 如有需要，请打印 error
			logger.error('[PUSH] AliCloud PushError:', error.message);

			try {
				await AppiaLog.insertData(
					'AliCloudPushError',
					'android',
					'push',
					'error',
					'pushError',
					{ userTokens },
					{ msg: error.message, data, appKey, notification, androidOpenUrl, env },
				);
			} catch (e) {
				console.log('TestLog.insertData Failed:', e.message);
			}
		}
	});
};
