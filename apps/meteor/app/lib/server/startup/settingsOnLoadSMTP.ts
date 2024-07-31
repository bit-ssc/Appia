import { settings } from '../../../settings/server';
import { SystemLogger } from '../../../../server/lib/logger/system';

settings.watchMultiple(
	['SMTP_Host', 'SMTP_Port', 'SMTP_Username', 'SMTP_Password', 'SMTP_Protocol', 'SMTP_Pool', 'SMTP_IgnoreTLS'],
	function () {
		SystemLogger.info('Updating process.env.MAIL_URL');

		if (!settings.get('SMTP_Host')) {
			process.env.MAIL_URL = undefined;
			return;
		}

		process.env.MAIL_URL = `${settings.get('SMTP_Protocol')}://`;

		if (settings.get('SMTP_Username') && settings.get('SMTP_Password')) {
			process.env.MAIL_URL += `${encodeURIComponent(settings.get('SMTP_Username'))}:${encodeURIComponent(settings.get('SMTP_Password'))}@`;
		}

		process.env.MAIL_URL += encodeURIComponent(settings.get('SMTP_Host'));

		if (settings.get('SMTP_Port')) {
			process.env.MAIL_URL += `:${parseInt(settings.get('SMTP_Port'))}`;
		}

		process.env.MAIL_URL += `?pool=${settings.get('SMTP_Pool')}`;

		if (settings.get('SMTP_Protocol') === 'smtp' && settings.get('SMTP_IgnoreTLS')) {
			process.env.MAIL_URL += '&secure=false&ignoreTLS=true';
		}
	},
);
