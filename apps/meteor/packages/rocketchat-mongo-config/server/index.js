import tls from 'tls';
import { PassThrough } from 'stream';

import { Email } from 'meteor/email';
import { Mongo } from 'meteor/mongo';

// Temporary code to track fibers usage
// Based on https://github.com/laverdet/node-fibers/pull/461/files
const Fiber = Npm.require('fibers');

function logUsingFibers(fibersMethod) {
	const logUseFibersLevel = +(process.env.ENABLE_LOG_USE_FIBERS || 0);

	if (!logUseFibersLevel) return;

	if (logUseFibersLevel === 1) {
		console.warn(`[FIBERS_LOG] Using ${fibersMethod}.`);
		return;
	}

	const { LOG_USE_FIBERS_INCLUDE_IN_PATH } = process.env;
	const stackFromError = new Error(`[FIBERS_LOG] Using ${fibersMethod}.`).stack;

	if (!LOG_USE_FIBERS_INCLUDE_IN_PATH || stackFromError.includes(LOG_USE_FIBERS_INCLUDE_IN_PATH)) {
		console.warn(stackFromError);
	}
}

function wrapFunction(fn, fibersMethod) {
	return function (...args) {
		logUsingFibers(fibersMethod);
		return fn.call(this, ...args);
	};
}

Fiber.yield = wrapFunction(Fiber.yield, 'Fiber.yield');
Fiber.prototype.run = wrapFunction(Fiber.prototype.run, 'Fiber.run');
Fiber.prototype.throwInto = wrapFunction(Fiber.prototype.throwInto, 'Fiber.throwInto');

const shouldDisableOplog = ['yes', 'true'].includes(String(process.env.USE_NATIVE_OPLOG).toLowerCase());
if (!shouldDisableOplog) {
	Package['disable-oplog'] = {};
}

// FIX For TLS error see more here https://github.com/RocketChat/Rocket.Chat/issues/9316
// TODO: Remove after NodeJS fix it, more information
// https://github.com/nodejs/node/issues/16196
// https://github.com/nodejs/node/pull/16853
// This is fixed in Node 10, but this supports LTS versions
tls.DEFAULT_ECDH_CURVE = 'auto';

const mongoConnectionOptions = {
	// add retryWrites=false if not present in MONGO_URL
	...(!process.env.MONGO_URL.includes('retryWrites') && { retryWrites: false }),
	// ignoreUndefined: false, // TODO evaluate adding this config
};

const mongoOptionStr = process.env.MONGO_OPTIONS;
if (typeof mongoOptionStr !== 'undefined') {
	const mongoOptions = JSON.parse(mongoOptionStr);
	Object.assign(mongoConnectionOptions, mongoOptions);
}

if (Object.keys(mongoConnectionOptions).length > 0) {
	Mongo.setConnectionOptions(mongoConnectionOptions);
}

process.env.HTTP_FORWARDED_COUNT = process.env.HTTP_FORWARDED_COUNT || '1';

// Send emails to a "fake" stream instead of print them in console in case MAIL_URL or SMTP is not configured
if (process.env.NODE_ENV !== 'development') {
	const { sendAsync } = Email;
	const stream = new PassThrough();
	stream.on('data', () => {});
	stream.on('end', () => {});
	Email.sendAsync = function _sendAsync(options) {
		return sendAsync.call(this, { stream, ...options });
	};
}

// Just print to logs if in TEST_MODE due to a bug in Meteor 2.5: TypeError: Cannot read property '_syncSendMail' of null
if (process.env.TEST_MODE === 'true') {
	Email.sendAsync = function _sendAsync(options) {
		console.log('Email.sendAsync', options);
	};
}
