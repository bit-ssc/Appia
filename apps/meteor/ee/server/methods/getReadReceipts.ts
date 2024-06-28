import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import type { ServerMethods } from '@rocket.chat/ui-contexts';
import type { ReadReceipt as ReadReceiptType, IMessage } from '@rocket.chat/core-typings';
import { Messages } from '@rocket.chat/models';

import { canAccessRoomIdAsync } from '../../../app/authorization/server/functions/canAccessRoom';
import { hasLicense } from '../../app/license/server/license';
import { ReadReceipt } from '../lib/message-read-receipt/ReadReceipt';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		getReadReceipts(options: { messageId: IMessage['_id'] }): ReadReceiptType[];
	}
}

Meteor.methods<ServerMethods>({
	async getReadReceipts({ messageId }) {
		if (!hasLicense('message-read-receipt')) {
			throw new Meteor.Error('error-action-not-allowed', 'This is an enterprise feature', { method: 'getReadReceipts' });
		}

		if (!messageId) {
			throw new Meteor.Error('error-invalid-message', "The required 'messageId' param is missing.", { method: 'getReadReceipts' });
		}

		check(messageId, String);

		const uid = Meteor.userId();
		if (!uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'getReadReceipts' });
		}

		const message = await Messages.findOneById(messageId);
		if (!message) {
			throw new Meteor.Error('error-invalid-message', 'Invalid message', {
				method: 'getReadReceipts',
			});
		}

		if (!(await canAccessRoomIdAsync(message.rid, uid))) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', { method: 'getReadReceipts' });
		}

		return ReadReceipt.getReceipts(message);
	},
});
