Package.describe({
	name: 'rocketchat:i18n',
	version: '0.0.1',
	summary: 'RocketChat i18n',
	git: '',
});

const additionalPackages = {
	config: 'rocketchat-i18n/src/',
};
const fs = Npm.require('fs');

Package.onUse(function (api) {
	const zh = {
		member: '成员',
		channel: '频道',
		Sponsor: 'SP',
		PDT: 'PDT',
		message: '消息',
		sendMessage: '发送消息',
		Todo: '待办',
		info: '信息',
		announcement: '公告',
		project: '频道',
	};

	const en = {
		member: 'member',
		Member: 'Member',
		channel: 'channel',
		Channel: 'Channel',
		Sponsor: 'SP',
		PDT: 'PDT',
		message: 'message',
		Message: 'Message',
		sendMessage: 'Send Message',
		announcement: 'announcement',
		Announcement: 'Announcement',
		Todo: 'Todo',
		Info: 'Info',
		Discuss: 'Discuss',
		Discussion: 'Discussion',
		discuss: 'discuss',
		discussion: 'discussion',
	};

	const config = { zh, en };

	api.use('templating', 'client');

	const workingDir = process.env.PWD || '.';
	const i18nDir = `${workingDir}/packages/rocketchat-i18n/i18n`;

	Object.keys(additionalPackages).forEach(function (current) {
		const fullPath = `${workingDir}/packages/${additionalPackages[current]}`;
		fs.readdirSync(fullPath).forEach(function (filename) {
			if (filename.indexOf('.json') > -1 && fs.statSync(`${fullPath}/${filename}`).size > 16) {
				const content = fs.readFileSync(`${fullPath}/${filename}`, { encoding: 'utf8' });
				const [name, extension] = filename.split('.');
				const data = config[name];

				fs.writeFileSync(
					`${i18nDir}/${name}.i18n.${extension}`,
					content.replace(/\{\{\{(.*?)\}\}\}/g, (m, p) => data[p] || m),
				);
			}
		});
	});

	fs.readdirSync(i18nDir).forEach(function (filename) {
		if (filename.indexOf('.json') > -1 && filename.indexOf('livechat.') === -1 && fs.statSync(`${i18nDir}/${filename}`).size > 16) {
			api.addFiles(`i18n/${filename}`);
		}
	});

	api.use('rocketchat:tap-i18n');
});
