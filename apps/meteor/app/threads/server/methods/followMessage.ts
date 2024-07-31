import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import type { IMessage } from '@rocket.chat/core-typings';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import { Messages } from '@rocket.chat/models';

import { RateLimiter } from '../../../lib/server';
import { settings } from '../../../settings/server';
import { canAccessRoomIdAsync } from '../../../authorization/server/functions/canAccessRoom';
import { follow } from '../functions';
import { Apps, AppEvents } from '../../../../ee/server/apps/orchestrator';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		followMessage(message: { mid: IMessage['_id'] }): false | undefined;
	}
}

Meteor.methods<ServerMethods>({
	async followMessage({ mid }) {
		check(mid, String);

		const uid = Meteor.userId();
		if (!uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'followMessage' });
		}

		if (mid && !settings.get('Threads_enabled')) {
			throw new Meteor.Error('error-not-allowed', 'not-allowed', { method: 'followMessage' });
		}

		const message = await Messages.findOneById(mid);
		if (!message) {
			throw new Meteor.Error('error-invalid-message', 'Invalid message', {
				method: 'followMessage',
			});
		}

		if (!(await canAccessRoomIdAsync(message.rid, uid))) {
			throw new Meteor.Error('error-not-allowed', 'not-allowed', { method: 'followMessage' });
		}

		const followResult = await follow({ tmid: message.tmid || message._id, uid });

		const isFollowed = true;
		await Apps.triggerEvent(AppEvents.IPostMessageFollowed, message, await Meteor.userAsync(), isFollowed);

		return followResult;
	},
});

RateLimiter.limitMethod('followMessage', 5, 5000, {
	userId() {
		return true;
	},
});
