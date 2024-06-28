import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Rooms, Uploads } from '@rocket.chat/models';
import type { ServerMethods } from '@rocket.chat/ui-contexts';

import { UploadFS } from '../../../../server/ufs';
import { settings } from '../../../settings/server';
import { canAccessRoomAsync } from '../../../authorization/server';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		getS3FileUrl(fileId: string): string;
	}
}

Meteor.methods<ServerMethods>({
	async getS3FileUrl(fileId) {
		check(fileId, String);
		const uid = Meteor.userId();
		if (settings.get<boolean>('FileUpload_ProtectFiles') && !uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'sendFileMessage' });
		}
		const file = await Uploads.findOneById(fileId);
		if (!file?.rid) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed');
		}
		const room = await Rooms.findOneById(file.rid);
		if (uid && room && !(await canAccessRoomAsync(room, { _id: uid }))) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed');
		}

		return UploadFS.getStore('AmazonS3:Uploads').getRedirectURL(file);
	},
});
