import React, { useState, ReactElement } from 'react';
import { Popover } from '../../../../../../../components/AppiaUI';
import { SmileOutlined } from '@ant-design/icons';
import { Box } from '@rocket.chat/fuselage';
import { Random } from '@rocket.chat/random';
import { callWithErrorHandling } from '../../../../../../../lib/utils/callWithErrorHandling';
import { logUpload } from '../../../../../../../lib/utils/logUpload';
import { css } from '@rocket.chat/css-in-js';

const overlayStyle = css`
	padding: 12px;

	ol {
		padding: 0 0 4px;
	}

	li {
		cursor: pointer;
		margin: 0 0 8px;
		padding: 2px 12px;
		height: 26px;
		line-height: 20px;
		border-radius: 24px;
		border: 1px solid #e5e6eb;
		font-size: 12px;

		&:hover {
			background: #f0f0f0;
		}
	}

	.rcx-message__emoji {
		display: block;
		width: 20px;
		height: 20px;
	}

	.emoji-list {
		display: flex;
		padding: 2px 6px;
		align-content: normal;
		gap: 18px;
		border-radius: 8px;
		background: #f5f5f2;
	}

	.emoji-item {
		cursor: pointer;
		padding: 2px;
		border-radius: 2px;

		&:hover {
			background: #f0f0f0;
		}
	}
`;

const quickReplies = ['收到，正在处理。', '加快节奏！', '好的，感谢。', '会议中，请稍等。'];
export const emojis = [
	{
		key: 'white_check_mark',
		value: '✅',
		className: 'rcx-message__emoji emojione emojione-symbols _2705 :white_check_mark:',
	},
	{
		key: 'ok_hand',
		value: '👌',
		className: 'rcx-message__emoji emojione emojione-people _1f44c :ok_hand:',
	},
	{
		key: 'thumbsup',
		value: '👍',
		className: 'rcx-message__emoji emojione emojione-people _1f44d :thumbsup:',
	},
	{
		key: 'smiley',
		value: '😃',
		className: 'rcx-message__emoji emojione emojione-people _1f603 :smiley:',
	},
	{
		key: 'rage',
		value: '😡',
		className: 'rcx-message__emoji emojione emojione-people _1f621 :rage:',
	},
	{
		key: 'rose',
		value: '🌹',
		className: 'rcx-message__emoji emojione emojione-nature _1f339 :rose:',
	},
];

export const QuickReplies = ({ refs, room }): ReactElement => {
	const { editorRef, wrapperRef } = refs;
	const [open, setOpen] = useState(false);

	const sendMessage = (msg: string) => {
		callWithErrorHandling('sendMessage', { _id: Random.id(), rid: room._id, msg });
		setOpen(false);
	};

	const insertEmoji = (value: string, className: string) => {
		editorRef.current?.insertSimpleSpan(value, className);
		setOpen(false);
	};

	const content = (
		<Box className={overlayStyle}>
			<Box
				is='ol'
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(2, 1fr)',
					gridTemplateRows: 'repeat(2, auto)',
					gap: '10px',
					listStyle: 'none',
					padding: 0,
					margin: 0,
					width: '100%',
				}}
			>
				{quickReplies.map((text) => (
					<Box
						is='li'
						key={text}
						textAlign={'center'}
						onClick={() => {
							sendMessage(text);
							logUpload('quickReplies', 'info', text, 'text');
						}}
						style={{
							width: '100%',
							minWidth: 0,
						}}
					>
						{text}
					</Box>
				))}
			</Box>
			<Box className='emoji-list'>
				{emojis.map(({ key, value, className }) => (
					<Box
						key={key}
						className='emoji-item'
						onClick={() => {
							insertEmoji(value, className);
							logUpload('quickReplies', 'info', key, 'emoji');
						}}
					>
						<Box is='span' className={className}>
							{value}
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
	return (
		<Popover
			content={content}
			arrow={false}
			overlayInnerStyle={{ padding: 0 }}
			trigger='hover'
			open={open}
			onOpenChange={setOpen}
			getPopupContainer={() => wrapperRef?.current || document.body}
		>
			<button type='button'>
				<SmileOutlined />
			</button>
		</Popover>
	);
};
