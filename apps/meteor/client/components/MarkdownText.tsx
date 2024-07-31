import { Box } from '@rocket.chat/fuselage';
import dompurify from 'dompurify';
import { marked } from 'marked';
import type { ComponentProps, FC } from 'react';
import React, { useMemo } from 'react';

import { renderMessageEmoji } from '../lib/utils/renderMessageEmoji';

type MarkdownTextParams = {
	content: string;
	variant: 'inline' | 'inlineWithoutBreaks' | 'document';
	preserveHtml: boolean;
	parseEmoji: boolean;
	withTruncatedText: boolean;
} & ComponentProps<typeof Box>;

const documentRenderer = new marked.Renderer();
const inlineRenderer = new marked.Renderer();
const inlineWithoutBreaks = new marked.Renderer();

marked.Lexer.rules.gfm = {
	...marked.Lexer.rules.gfm,
	strong: /^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,
	em: /^__(?=\S)([\s\S]*?\S)__(?!_)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
};

const linkMarked = (href: string | null, _title: string | null, text: string): string =>
	`<a href="${href}" target="_blank" rel="nofollow noopener noreferrer">${text}</a> `;
const paragraphMarked = (text: string): string => text;
const brMarked = (): string => ' ';
const listItemMarked = (text: string): string => {
	const cleanText = text.replace(/<p.*?>|<\/p>/gi, '');
	return `<li>${cleanText}</li>`;
};
const horizontalRuleMarked = (): string => '';

documentRenderer.link = linkMarked;
documentRenderer.listitem = listItemMarked;

inlineRenderer.link = linkMarked;
inlineRenderer.paragraph = paragraphMarked;
inlineRenderer.listitem = listItemMarked;
inlineRenderer.hr = horizontalRuleMarked;

inlineWithoutBreaks.link = linkMarked;
inlineWithoutBreaks.paragraph = paragraphMarked;
inlineWithoutBreaks.br = brMarked;
inlineWithoutBreaks.image = brMarked;
inlineWithoutBreaks.code = paragraphMarked;
inlineWithoutBreaks.codespan = paragraphMarked;
inlineWithoutBreaks.listitem = listItemMarked;
inlineWithoutBreaks.hr = horizontalRuleMarked;

const defaultOptions = {
	gfm: true,
	headerIds: false,
};

const options = {
	...defaultOptions,
	renderer: documentRenderer,
};

const inlineOptions = {
	...defaultOptions,
	renderer: inlineRenderer,
};

const inlineWithoutBreaksOptions = {
	...defaultOptions,
	renderer: inlineWithoutBreaks,
};

const getRegexp = (schemeSetting: string): RegExp => {
	const schemes = schemeSetting ? schemeSetting.split(',').join('|') : '';
	return new RegExp(`^(${schemes}):`, 'gim');
};

const MarkdownText: FC<Partial<MarkdownTextParams>> = ({
	content,
	variant = 'document',
	withTruncatedText = false,
	preserveHtml = false,
	parseEmoji = false,
	...props
}) => {
	const sanitizer = dompurify.sanitize;

	let markedOptions: marked.MarkedOptions;

	const schemes = 'http,https';

	switch (variant) {
		case 'inline':
			markedOptions = inlineOptions;
			break;
		case 'inlineWithoutBreaks':
			markedOptions = inlineWithoutBreaksOptions;
			break;
		case 'document':
		default:
			markedOptions = options;
	}

	const __html = useMemo(() => {
		const html = ((): any => {
			if (content && typeof content === 'string') {
				const markedHtml = /inline/.test(variant)
					? marked.parseInline(new Option(content).innerHTML, markedOptions)
					: marked.parse(new Option(content).innerHTML, markedOptions);

				if (parseEmoji) {
					// We are using the old emoji parser here. This could come
					// with additional processing use, but is the workaround available right now.
					// Should be replaced in the future with the new parser.
					return renderMessageEmoji({ html: markedHtml });
				}

				return markedHtml;
			}
		})();

		// Add a hook to make all links open a new window
		dompurify.addHook('afterSanitizeAttributes', (node) => {
			// set all elements owning target to target=_blank
			if ('target' in node) {
				node.setAttribute('target', '_blank');
				node.setAttribute('rel', 'nofollow noopener noreferrer');
			}
		});

		return preserveHtml ? html : html && sanitizer(html, { ADD_ATTR: ['target'], ALLOWED_URI_REGEXP: getRegexp(schemes) });
	}, [preserveHtml, sanitizer, content, variant, markedOptions, parseEmoji, schemes]);

	return __html ? (
		<Box
			dangerouslySetInnerHTML={{ __html }}
			withTruncatedText={withTruncatedText}
			withRichContent={variant === 'inlineWithoutBreaks' ? 'inlineWithoutBreaks' : true}
			{...props}
		/>
	) : null;
};

export default MarkdownText;
