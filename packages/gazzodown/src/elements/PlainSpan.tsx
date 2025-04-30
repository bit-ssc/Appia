import { FC, Fragment, memo, ReactElement, useContext, useMemo } from 'react';

import { MarkupInteractionContext } from '../MarkupInteractionContext';

type PlainSpanProps = {
	text: string;
};

const LineBreak: FC<{ text: string }> = ({ text }) => {
	if (text.includes('\n')) {
		const chunks = text.split('\n');

		return (
			<>
				{chunks.map((chunk, i) => (
					<Fragment key={i}>
						{chunk}
						{i < chunks.length - 1 && <br />}
					</Fragment>
				))}
			</>
		);
	}

	return <>{text}</>;
}

const PlainSpan = ({ text }: PlainSpanProps): ReactElement => {
	const { highlightRegex, markRegex } = useContext(MarkupInteractionContext);

	const content = useMemo(() => {
		if (highlightRegex) {
			const chunks = text.split(highlightRegex());
			const head = chunks.shift() ?? '';

			return (
				<>
					<LineBreak text={head} />
					{chunks.map((chunk, i) => {
						if (i % 2 === 0) {
							return (
								<mark key={i} className='highlight-text'>
									<LineBreak text={chunk} />
								</mark>
							);
						}

						return (
							<Fragment key={i}>
								<LineBreak text={chunk} />
							</Fragment>
						);
					})}
				</>
			);
		}

		if (markRegex) {
			const chunks = text.split(markRegex());
			const head = chunks.shift() ?? '';

			return (
				<>
					<LineBreak text={head} />
					{chunks.map((chunk, i) => {
						if (i % 2 === 0) {
							return (
								<mark key={i}>
									<LineBreak text={chunk} />
								</mark>
							);
						}

						return (
							<Fragment key={i}>
								<LineBreak text={chunk} />
							</Fragment>
						);
					})}
				</>
			);
		}

		return <LineBreak text={text} />;
	}, [text, highlightRegex, markRegex]);

	// return <>{content}</>;
	return <div className='appia-paragraph'>{content}</div>;
};

export default memo(PlainSpan);
