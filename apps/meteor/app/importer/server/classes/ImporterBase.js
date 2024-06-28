import http from 'http';
import fs from 'fs';
import https from 'https';

import { Settings, ImportData, Imports, RawImports } from '@rocket.chat/models';
import { Meteor } from 'meteor/meteor';
import AdmZip from 'adm-zip';
import getFileType from 'file-type';

import { Progress } from './ImporterProgress';
import { ImporterWebsocket } from './ImporterWebsocket';
import { ProgressStep } from '../../lib/ImporterProgressStep';
import { ImporterInfo } from '../../lib/ImporterInfo';
import { Logger } from '../../../logger/server';
import { ImportDataConverter } from './ImportDataConverter';
import { t } from '../../../utils/server';
import { Selection, SelectionChannel, SelectionUser } from '..';

/**
 * Base class for all of the importers.
 */
export class Base {
	/**
	 * Constructs a new importer, adding an empty collection, AdmZip property, and empty users & channels
	 *
	 * @param {string} name The importer's name.
	 * @param {string} description The i18n string which describes the importer
	 * @param {string} mimeType The expected file type.
	 */
	constructor(info, importRecord) {
		if (!(info instanceof ImporterInfo)) {
			throw new Error('Information passed in must be a valid ImporterInfo instance.');
		}

		this.http = http;
		this.https = https;
		this.AdmZip = AdmZip;
		this.getFileType = getFileType;
		this.converter = new ImportDataConverter();

		this.prepare = this.prepare.bind(this);
		this.startImport = this.startImport.bind(this);
		this.getProgress = this.getProgress.bind(this);
		this.updateProgress = this.updateProgress.bind(this);
		this.addCountToTotal = this.addCountToTotal.bind(this);
		this.addCountCompleted = this.addCountCompleted.bind(this);
		this.updateRecord = this.updateRecord.bind(this);

		this.info = info;

		this.logger = new Logger(`${this.info.name} Importer`);
		this.converter.setLogger(this.logger);

		this.progress = new Progress(this.info.key, this.info.name);
		this.collection = RawImports;
		this.importRecordParam = importRecord;
		this.users = {};
		this.channels = {};
		this.messages = {};
		this.oldSettings = {};
	}

	async build() {
		const userId = Meteor.userId();
		if (this.importRecordParam) {
			this.logger.debug('Found existing import operation');
			this.importRecord = this.importRecordParam;
			this.progress.step = this.importRecord.status;
		} else {
			this.logger.debug('Starting new import operation');
			const importId = (
				await Imports.insertOne({
					type: this.info.name,
					importerKey: this.info.key,
					ts: Date.now(),
					status: this.progress.step,
					valid: true,
					user: userId,
				})
			).insertedId;
			this.importRecord = await Imports.findOne(importId);
		}
		this.logger.debug(`Constructed a new ${this.info.name} Importer.`);
	}

	/**
	 * Registers the file name and content type on the import operation
	 *
	 * @param {string} fileName The name of the uploaded file.
	 * @param {string} contentType The sent file type.
	 * @returns {Progress} The progress record of the import.
	 */
	async startFileUpload(fileName, contentType) {
		await this.updateProgress(ProgressStep.UPLOADING);
		return this.updateRecord({ file: fileName, contentType });
	}

	/**
	 * Takes the uploaded file and extracts the users, channels, and messages from it.
	 *
	 * @param {string} fullFilePath the full path of the uploaded file
	 * @returns {Progress} The progress record of the import.
	 */
	async prepareUsingLocalFile(fullFilePath) {
		const file = fs.readFileSync(fullFilePath);
		const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file);

		const { contentType } = this.importRecord;
		const fileName = this.importRecord.file;

		const data = buffer.toString('base64');
		const dataURI = `data:${contentType};base64,${data}`;

		return this.prepare(dataURI, contentType, fileName, true);
	}

	/**
	 * Takes the uploaded file and extracts the users, channels, and messages from it.
	 *
	 * @param {string} dataURI Base64 string of the uploaded file
	 * @param {string} sentContentType The sent file type.
	 * @param {string} fileName The name of the uploaded file.
	 * @param {boolean} skipTypeCheck Optional property that says to not check the type provided.
	 * @returns {Progress} The progress record of the import.
	 */
	async prepare(dataURI, sentContentType, fileName, skipTypeCheck) {
		await this.collection.deleteMany({});
		if (!skipTypeCheck) {
			const fileType = this.getFileType(Buffer.from(dataURI.split(',')[1], 'base64'));
			this.logger.debug('Uploaded file information is:', fileType);
			this.logger.debug('Expected file type is:', this.info.mimeType);

			if (!fileType || fileType.mime !== this.info.mimeType) {
				this.logger.warn(`Invalid file uploaded for the ${this.info.name} importer.`);
				await this.updateProgress(ProgressStep.ERROR);
				throw new Meteor.Error('error-invalid-file-uploaded', `Invalid file uploaded to import ${this.info.name} data from.`, {
					step: 'prepare',
				});
			}
		}

		await this.updateProgress(ProgressStep.PREPARING_STARTED);
		return this.updateRecord({ file: fileName });
	}

	/**
	 * Starts the import process. The implementing method should defer
	 * as soon as the selection is set, so the user who started the process
	 * doesn't end up with a "locked" UI while Meteor waits for a response.
	 * The returned object should be the progress.
	 *
	 * @param {Selection} importSelection The selection data.
	 * @returns {Progress} The progress record of the import.
	 */
	async startImport(importSelection) {
		if (!(importSelection instanceof Selection)) {
			throw new Error(`Invalid Selection data provided to the ${this.info.name} importer.`);
		} else if (importSelection.users === undefined) {
			throw new Error(`Users in the selected data wasn't found, it must but at least an empty array for the ${this.info.name} importer.`);
		} else if (importSelection.channels === undefined) {
			throw new Error(
				`Channels in the selected data wasn't found, it must but at least an empty array for the ${this.info.name} importer.`,
			);
		}

		await this.updateProgress(ProgressStep.IMPORTING_STARTED);
		this.reloadCount();
		const started = Date.now();
		const startedByUserId = Meteor.userId();

		const beforeImportFn = async (data, type) => {
			switch (type) {
				case 'channel': {
					const id = data.t === 'd' ? '__directMessages__' : data.importIds[0];
					for (const channel of importSelection.channels) {
						if (channel.channel_id === id) {
							return channel.do_import;
						}
					}

					return false;
				}
				case 'user': {
					const id = data.importIds[0];
					for (const user of importSelection.users) {
						if (user.user_id === id) {
							return user.do_import;
						}
					}

					return false;
				}
			}

			return true;
		};

		const afterImportFn = async () => {
			return this.addCountCompleted(1);
		};

		process.nextTick(async () => {
			await this.backupSettingValues();

			try {
				await this.applySettingValues({});

				await this.updateProgress(ProgressStep.IMPORTING_USERS);
				await this.converter.convertUsers({ beforeImportFn, afterImportFn });

				await this.updateProgress(ProgressStep.IMPORTING_CHANNELS);
				await this.converter.convertChannels(startedByUserId, { beforeImportFn, afterImportFn });

				await this.updateProgress(ProgressStep.IMPORTING_MESSAGES);
				await this.converter.convertMessages({ afterImportFn });

				await this.updateProgress(ProgressStep.FINISHING);

				process.nextTick(async () => {
					await this.converter.clearSuccessfullyImportedData();
				});

				await this.updateProgress(ProgressStep.DONE);
			} catch (e) {
				this.logger.error(e);
				await this.updateProgress(ProgressStep.ERROR);
			} finally {
				await this.applySettingValues(this.oldSettings);
			}

			const timeTook = Date.now() - started;
			this.logger.log(`Import took ${timeTook} milliseconds.`);
		});

		return this.getProgress();
	}

	async backupSettingValues() {
		const allowedDomainList = await Settings.findOneById('Accounts_AllowedDomainsList').value;
		const allowUsernameChange = await Settings.findOneById('Accounts_AllowUsernameChange').value;
		const maxFileSize = await Settings.findOneById('FileUpload_MaxFileSize').value;
		const mediaTypeWhiteList = await Settings.findOneById('FileUpload_MediaTypeWhiteList').value;
		const mediaTypeBlackList = await Settings.findOneById('FileUpload_MediaTypeBlackList').value;

		this.oldSettings = {
			allowedDomainList,
			allowUsernameChange,
			maxFileSize,
			mediaTypeWhiteList,
			mediaTypeBlackList,
		};
	}

	async applySettingValues(settingValues) {
		await Settings.updateValueById('Accounts_AllowedDomainsList', settingValues.allowedDomainList ?? '');
		await Settings.updateValueById('Accounts_AllowUsernameChange', setTimeout.allowUsernameChange ?? true);
		await Settings.updateValueById('FileUpload_MaxFileSize', settingValues.maxFileSize ?? -1);
		await Settings.updateValueById('FileUpload_MediaTypeWhiteList', settingValues.mediaTypeWhiteList ?? '*');
		await Settings.updateValueById('FileUpload_MediaTypeBlackList', settingValues.mediaTypeBlackList ?? '');
	}

	/**
	 * Gets the progress of this import.
	 *
	 * @returns {Progress} The progress record of the import.
	 */
	getProgress() {
		return this.progress;
	}

	/**
	 * Updates the progress step of this importer.
	 * It also changes some internal settings at various stages of the import.
	 * This way the importer can adjust user/room information at will.
	 *
	 * @param {ProgressStep} step The progress step which this import is currently at.
	 * @returns {Progress} The progress record of the import.
	 */
	async updateProgress(step) {
		this.progress.step = step;

		this.logger.debug(`${this.info.name} is now at ${step}.`);
		await this.updateRecord({ status: this.progress.step });

		this.reportProgress();

		return this.progress;
	}

	reloadCount() {
		if (!this.importRecord.count) {
			this.progress.count.total = 0;
			this.progress.count.completed = 0;
		}

		this.progress.count.total = this.importRecord.count?.total || 0;
		this.progress.count.completed = this.importRecord.count?.completed || 0;
	}

	/**
	 * Adds the passed in value to the total amount of items needed to complete.
	 *
	 * @param {number} count The amount to add to the total count of items.
	 * @returns {Progress} The progress record of the import.
	 */
	async addCountToTotal(count) {
		this.progress.count.total += count;
		await this.updateRecord({ 'count.total': this.progress.count.total });

		return this.progress;
	}

	/**
	 * Adds the passed in value to the total amount of items completed.
	 *
	 * @param {number} count The amount to add to the total count of finished items.
	 * @returns {Progress} The progress record of the import.
	 */
	async addCountCompleted(count) {
		this.progress.count.completed += count;

		// Only update the database every 500 records
		// Or the completed is greater than or equal to the total amount
		if (this.progress.count.completed % 500 === 0 || this.progress.count.completed >= this.progress.count.total) {
			await this.updateRecord({ 'count.completed': this.progress.count.completed });
			this.reportProgress();
		} else if (!this._reportProgressHandler) {
			this._reportProgressHandler = setTimeout(() => {
				this.reportProgress();
			}, 250);
		}

		this.logger.log(`${this.progress.count.completed} messages imported`);

		return this.progress;
	}

	/**
	 * Sends an updated progress to the websocket
	 */
	reportProgress() {
		if (this._reportProgressHandler) {
			clearTimeout(this._reportProgressHandler);
			this._reportProgressHandler = false;
		}
		ImporterWebsocket.progressUpdated(this.progress);
	}

	/**
	 * Registers error information on a specific user from the import record
	 *
	 * @param {int} the user id
	 * @param {object} an exception object
	 */
	async addUserError(userId, error) {
		await Imports.updateOne(
			{
				'_id': this.importRecord._id,
				'fileData.users.user_id': userId,
			},
			{
				$set: {
					'fileData.users.$.error': error,
					'hasErrors': true,
				},
			},
		);
	}

	async addMessageError(error, msg) {
		await Imports.updateOne(
			{
				_id: this.importRecord._id,
			},
			{
				$push: {
					errors: {
						error,
						msg,
					},
				},
				$set: {
					hasErrors: true,
				},
			},
		);
	}

	/**
	 * Updates the import record with the given fields being `set`.
	 *
	 * @param {any} fields The fields to set, it should be an object with key/values.
	 * @returns {Imports} The import record.
	 */
	async updateRecord(fields) {
		await Imports.update({ _id: this.importRecord._id }, { $set: fields });
		this.importRecord = await Imports.findOne(this.importRecord._id);

		return this.importRecord;
	}

	async buildSelection() {
		await this.updateProgress(ProgressStep.USER_SELECTION);

		const users = await ImportData.getAllUsersForSelection();
		const channels = await ImportData.getAllChannelsForSelection();
		const hasDM = await ImportData.checkIfDirectMessagesExists();

		const selectionUsers = users.map(
			(u) =>
				new SelectionUser(u.data.importIds[0], u.data.username, u.data.emails[0], Boolean(u.data.deleted), u.data.type === 'bot', true),
		);
		const selectionChannels = channels.map(
			(c) =>
				new SelectionChannel(
					c.data.importIds[0],
					c.data.name,
					Boolean(c.data.archived),
					true,
					c.data.t === 'p',
					undefined,
					c.data.t === 'd',
				),
		);
		const selectionMessages = await ImportData.countMessages();

		if (hasDM) {
			selectionChannels.push(new SelectionChannel('__directMessages__', t('Direct_Messages'), false, true, true, undefined, true));
		}

		const results = new Selection(this.name, selectionUsers, selectionChannels, selectionMessages);

		return results;
	}
}
