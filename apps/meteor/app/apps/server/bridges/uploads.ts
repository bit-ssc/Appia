import { Meteor } from 'meteor/meteor';
import { UploadBridge } from '@rocket.chat/apps-engine/server/bridges/UploadBridge';
import type { IUpload } from '@rocket.chat/apps-engine/definition/uploads';
import type { IUploadDetails } from '@rocket.chat/apps-engine/definition/uploads/IUploadDetails';

import { FileUpload } from '../../../file-upload/server';
import { determineFileType } from '../../../../ee/lib/misc/determineFileType';
import type { AppServerOrchestrator } from '../../../../ee/server/apps/orchestrator';

const getUploadDetails = (details: IUploadDetails): Partial<IUploadDetails> => {
	if (details.visitorToken) {
		const { userId, ...result } = details;
		return result;
	}
	return details;
};
export class AppUploadBridge extends UploadBridge {
	// eslint-disable-next-line no-empty-function
	constructor(private readonly orch: AppServerOrchestrator) {
		super();
	}

	protected async getById(id: string, appId: string): Promise<IUpload> {
		this.orch.debugLog(`The App ${appId} is getting the upload: "${id}"`);

		return this.orch.getConverters()?.get('uploads').convertById(id);
	}

	protected async getBuffer(upload: IUpload, appId: string): Promise<Buffer> {
		this.orch.debugLog(`The App ${appId} is getting the upload: "${upload.id}"`);

		const rocketChatUpload = this.orch.getConverters()?.get('uploads').convertToRocketChat(upload);

		return new Promise((resolve, reject) => {
			FileUpload.getBuffer(rocketChatUpload, (error?: Error, result?: Buffer | false) => {
				if (error) {
					return reject(error);
				}

				if (!(result instanceof Buffer)) {
					return reject(new Error('Unknown error'));
				}

				resolve(result);
			});
		});
	}

	protected async createUpload(details: IUploadDetails, buffer: Buffer, appId: string): Promise<IUpload> {
		this.orch.debugLog(`The App ${appId} is creating an upload "${details.name}"`);

		if (!details.userId && !details.visitorToken) {
			throw new Error('Missing user to perform the upload operation');
		}

		const fileStore = FileUpload.getStore('Uploads');

		details.type = determineFileType(buffer, details.name);

		return Meteor.runAsUser(details.userId, async () => {
			const uploadedFile = await fileStore.insert(getUploadDetails(details), buffer);
			this.orch.debugLog(`The App ${appId} has created an upload`, uploadedFile);
			if (details.visitorToken) {
				await Meteor.callAsync('sendFileLivechatMessage', details.rid, details.visitorToken, uploadedFile);
			} else {
				await Meteor.callAsync('sendFileMessage', details.rid, null, uploadedFile);
			}
			return this.orch.getConverters()?.get('uploads').convertToApp(uploadedFile);
		});
	}
}
