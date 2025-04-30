import type * as MessageParser from '@rocket.chat/message-parser';
import { lazy, memo, ReactElement } from 'react';

import HeadingBlock from './blocks/HeadingBlock';
import ParagraphBlock from './blocks/ParagraphBlock';
import QuoteBlock from './blocks/QuoteBlock';
import TaskList from './blocks/TaskListBlock';
import BigEmojiBlock from './emoji/BigEmojiBlock';
import KatexErrorBoundary from './katex/KatexErrorBoundary';
import { OrderedListBlock, UnorderedListBlock } from './blocks/ListBlock';

const CodeBlock = lazy(() => import('./code/CodeBlock'));
const KatexBlock = lazy(() => import('./katex/KatexBlock'));

type OrderedList = MessageParser.OrderedList;
type UnorderedList = MessageParser.UnorderedList;

type MarkupProps = {
	tokens: MessageParser.Root;
};

const isList = (block: MessageParser.Root[number]) => block && (block.type === 'ORDERED_LIST' || block.type === 'UNORDERED_LIST');

const covertIntermediateNode = (block: UnorderedList | OrderedList): UnorderedList | OrderedList => {
	let intermediateNode = block;

	while (intermediateNode.level && intermediateNode.level > 0) {
		intermediateNode = {
			type: intermediateNode.type,
			level: intermediateNode.level - 1,
			value: [{
				type: 'LIST_ITEM',
				number: 1,
				value: [intermediateNode],
			}],
		};
	}

	return intermediateNode;
};

const covertList = (tokens: MessageParser.Root): MessageParser.Root => {
	const elements: MessageParser.Root = [];

	tokens.forEach((token) => {
		if (!token) {
			return ;
		}
		const block = JSON.parse(JSON.stringify(token));

		if (isList(block)) {
			const currentLevel = block.level;
			let lastBlock = elements[elements.length - 1];

			if (isList(lastBlock)) {
				if (block.level > 0) {
					let initFlag = 0
					let parent: OrderedList | UnorderedList | undefined

					while (isList(lastBlock)) {
						if ((lastBlock as OrderedList | UnorderedList).level === currentLevel - 1) {
							initFlag = 1
							parent = lastBlock as OrderedList | UnorderedList
						} else if ((lastBlock as OrderedList | UnorderedList).level === currentLevel) {
							initFlag = 2
							parent = lastBlock as OrderedList | UnorderedList
							break
						}

						const lastListItem = lastBlock.value?.[lastBlock.value.length - 1];

						if (!lastListItem) {
							break ;
						}

						if (typeof lastListItem === 'string') {
							break ;
						}

						lastBlock = lastListItem.value?.[lastListItem.value?.length - 1];
					}

					if (initFlag === 1) {
						parent?.value.push({
							type: 'LIST_ITEM',
							number: 1,
							value: [block],
						})
					} else if (initFlag === 2) {
						parent?.value.push(...block.value)
					} else {
						elements.push(covertIntermediateNode(block))
					}
				} else {
					elements.push(block);
				}
			} else {
				elements.push(covertIntermediateNode(block));
			}
		} else {
			elements.push(block);
		}
	});

	return elements;
}
const Markup = ({ tokens }: MarkupProps): ReactElement => {
	const elements = covertList(tokens);

	return (
		<>
			{elements.map((block, index) => {
				switch (block.type) {
					case 'BIG_EMOJI':
						return <BigEmojiBlock key={index} emoji={block.value} />;

					case 'PARAGRAPH':
						return <ParagraphBlock key={index} children={block.value} />;

					case 'HEADING':
						return <HeadingBlock key={index} level={block.level} children={block.value} />;

					case 'UNORDERED_LIST':
						return <UnorderedListBlock key={index} items={block.value} level={block.level} />;

					case 'ORDERED_LIST':
						return <OrderedListBlock key={index} items={block.value} level={block.level} />;

					case 'TASKS':
						return <TaskList key={index} tasks={block.value} />;

					case 'QUOTE':
						return <QuoteBlock key={index} children={block.value} />;

					case 'CODE':
						return <CodeBlock key={index} language={block.language} lines={block.value} />;

					case 'KATEX':
						return (
							<KatexErrorBoundary code={block.value} key={index}>
								<KatexBlock code={block.value} />
							</KatexErrorBoundary>
						);

					case 'LINE_BREAK':
						return (
							<p>
								<br key={index} />
							</p>
						);

					default:
						return null;
				}
			})}
		</>
	);
}

export default memo(Markup);
