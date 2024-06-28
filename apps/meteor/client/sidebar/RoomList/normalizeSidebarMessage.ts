import type { IMessage } from '@rocket.chat/core-typings';
import { escapeHTML } from '@rocket.chat/string-helpers';
import type { useTranslation } from '@rocket.chat/ui-contexts';
import emojione from 'emojione';
import { escapeRegExp } from 'lodash';

import { filterMarkdown } from '../../../app/markdown/lib/markdown';

export const normalizeSidebarMessage = (message: IMessage, t: ReturnType<typeof useTranslation>): string | undefined => {
	if (message.msg) {
		let content = filterMarkdown(emojione.shortnameToUnicode(message.msg));

		if (message.mentions?.length) {
			const map = {};
			const list = [];

			message.mentions.forEach((mention) => {
				list.push(`@${escapeRegExp(mention.username)}`);
				map[`@${mention.username}`] = `@${mention.name || mention.username}`;
			});

			content = content.replace(new RegExp(list.join('|'), 'g'), (key) => map[key]);
		}

		return escapeHTML(content);
	}

	if (message.attachments) {
		const attachment = message.attachments.find((attachment) => attachment.title || attachment.description);

		if (attachment?.description) {
			return escapeHTML(attachment.description);
		}

		if (attachment?.title) {
			return escapeHTML(attachment.title);
		}

		return t('Sent_an_attachment');
	}
};
