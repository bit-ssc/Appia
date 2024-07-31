import type Url from 'url';

import type { MessageAttachment } from './IMessage';

export type ParsedUrl = Pick<Url.UrlWithParsedQuery, 'host' | 'hash' | 'pathname' | 'protocol' | 'port' | 'query' | 'search' | 'hostname'>;

export type OEmbedMeta = {
	[key: string]: string;
} & {
	oembedHtml: string | undefined;
	oembedUrl: string | string[];
};

export type OEmbedUrlContent = {
	urlObj: Url.UrlWithParsedQuery;
	parsedUrl: ParsedUrl;
	headers: { [k: string]: string };
	body: string;
	statusCode: number;
};

export type OEmbedProvider = {
	urls: RegExp[];
	endPoint: string;
};

export type OEmbedUrlContentResult = {
	headers: { [key: string]: string };
	body: string;
	parsedUrl: Pick<Url.UrlWithStringQuery, 'host' | 'hash' | 'pathname' | 'protocol' | 'port' | 'query' | 'search' | 'hostname'>;
	statusCode: number;
	attachments?: MessageAttachment[];
};

export const isOEmbedUrlContentResult = (value: any): value is OEmbedUrlContentResult => 'attachments' in value;

export type OEmbedUrlWithMetadata = {
	url: string;
	meta: OEmbedMeta;
	headers: { [k: string]: string };
	parsedUrl: Pick<Url.UrlWithStringQuery, 'host' | 'hash' | 'pathname' | 'protocol' | 'port' | 'query' | 'search' | 'hostname'>;
	content: OEmbedUrlContent;
};

export const isOEmbedUrlWithMetadata = (value: any): value is OEmbedUrlWithMetadata => 'meta' in value;
