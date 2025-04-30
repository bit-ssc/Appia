import type { CSSProperties } from 'react';
import React from 'react';

import { ExcelIcon, PdfIcon, PptIcon, TxtIcon, WordIcon, ZipIcon, ImageIcon, UnknownIcon } from './AppiaIcon';

const typeMap: Record<string, React.ElementType> = {
	excel: ExcelIcon,
	pdf: PdfIcon,
	ppt: PptIcon,
	txt: TxtIcon,
	word: WordIcon,
	zip: ZipIcon,
	image: ImageIcon,
	unknown: UnknownIcon,
};

const extensionMap: Record<string, string> = {};

[
	['excel', 'xls,xlsx'],
	['pdf', 'pdf'],
	['ppt', 'ppt,pptx'],
	['txt', 'txt'],
	['word', 'doc,docx'],
	['zip', 'zip,rar,tar.gz'],
	['image', 'png,jpg,jpeg,svg,gif'],
].forEach(([key, names]) => {
	names.split(',').forEach((name) => {
		extensionMap[name] = key;
	});
});

interface IFileIcon {
	fileName?: string;
	fontSize?: number;
	style?: CSSProperties;
}

const FileIcon = ({ fileName = '', fontSize = 32, style }: IFileIcon): React.ReactElement => {
	const fileType = extensionMap[fileName.split('.').pop()?.trimRight() as string] || 'unknown';
	const Com = typeMap[fileType];
	return <Com fontSize={fontSize} style={style} />;
};

export default FileIcon;
