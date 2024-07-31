import { Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetModal, useTranslation } from '@rocket.chat/ui-contexts';
import DOMPurify from 'dompurify';
import React from 'react';

import { Popover } from '../../../AppiaUI';
import type { IFastModelRefs, IContent, IDoc, ISnippet, IHighlight } from '../IAppia';
import { FastModelStyles } from './FastModelStyles';
import RefsModal from './RefsModal';

const FastModelMsg: React.FC<IFastModelRefs> = ({ content, snippets, docs, botId }) => {
	const t = useTranslation();
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());

	if (!content) {
		return <div>message error</div>;
	}

	const renderTextWithTab = (text: string, style?: any) => (
		<span style={style} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text).replace(/\n/g, '<br />') }}></span>
	);

	const renderContentText = (content: IContent) => renderTextWithTab(content.content);

	const renderSnippet = (snippet: ISnippet, highlights: IHighlight[]) => {
		const texts: { type: 'plain' | 'highlight'; text: string }[] = highlights.map((item) => ({
			type: item.type,
			text: snippet.text.substring(item.start, item.end),
		}));

		return (
			<span style={{ display: 'flow', width: 300, overflowY: 'auto', maxHeight: 200 }}>
				{texts.map((item) => renderTextWithTab(item.text, item.type === 'highlight' ? { color: '#2878ff' } : {}))}
			</span>
		);
	};

	const renderCitation = (content: IContent) => (
		<Popover content={renderSnippet(snippets[content.snippetIndex], content.highlights)} title={t('Ref')}>
			<span className='num-sup-tag'>{content.displayNum}</span>
		</Popover>
	);

	const openRefsModal = (doc: IDoc) => {
		if (doc.type.toUpperCase() === 'UUID') {
			setModal(<RefsModal botId={botId} docId={doc.uuid} onClose={closeModal} />);
		} else if (doc.type.toUpperCase() === 'URL') {
			window.open(doc.url);
		}
	};

	const renderDocItem = (doc: IDoc) => (
		<div className='fast-model-cell-tag' onClick={() => openRefsModal(doc)}>
			{doc.displayNums.map((item: string) => (
				<span>{`[${item}].`}</span>
			))}
			<span>{doc.title}</span>
		</div>
	);

	const renderDocs = () =>
		docs && docs.length > 0 ? (
			<div>
				<div className='line'></div>
				<span>{t('Refs')}</span>
				<div>{docs.map((item: IDoc) => renderDocItem(item))}</div>
			</div>
		) : null;

	return (
		<Box className={FastModelStyles}>
			{content.map((item: IContent) => (item.type === 'text' ? renderContentText(item) : renderCitation(item)))}
			{renderDocs()}
		</Box>
	);
};

export default FastModelMsg;
