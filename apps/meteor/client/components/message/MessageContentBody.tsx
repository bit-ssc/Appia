import { css } from '@rocket.chat/css-in-js';
import { MessageBody, Box, Palette } from '@rocket.chat/fuselage';
import { Markup } from '@rocket.chat/gazzodown';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';

import type { MessageWithMdEnforced } from '../../lib/parseMessageTextToAstMarkdown';
import GazzodownText from '../GazzodownText';

type MessageContentBodyProps = Pick<MessageWithMdEnforced, 'mentions' | 'channels' | 'md'> & {
	searchText?: string;
	lineClamp?: number;
	id: string;
	edited?: boolean;
};

const MessageContentBody = ({ mentions, channels, md, searchText, lineClamp, id, edited = false }: MessageContentBodyProps) => {
	const t = useTranslation();
	// TODO: this style should go to Fuselage <MessageBody> repository
	const messageBodyAdditionalStyles = css`
		> blockquote {
			padding-inline: 8px;
			border: 1px solid ${Palette.stroke['stroke-extra-light']};
			border-radius: 2px;
			background-color: ${Palette.surface['surface-tint']};
			border-inline-start-color: ${Palette.stroke['stroke-medium']};
			font-size: 10px;

			&:focus {
				border-color: ${Palette.stroke['stroke-highlight']};
				border-inline-start-color: ${Palette.stroke['stroke-highlight']};
			}

			&:hover,
			&:focus {
				background-color: ${Palette.surface['surface-hover']};
				border-color: ${Palette.stroke['stroke-light']};
				border-inline-start-color: ${Palette.stroke['stroke-medium']};
			}
		}
		> ul.task-list {
			> li::before {
				display: none;
			}

			> li > .rcx-check-box > .rcx-check-box__input:focus + .rcx-check-box__fake {
				z-index: 1;
			}

			list-style: none;
			margin-inline-start: 0;
			padding-inline-start: 0;
		}
		a {
			color: ${Palette.text['font-info']};
			&:hover {
				text-decoration: underline;
			}
			&:focus {
				border: 2px solid ${Palette.stroke['stroke-extra-light-highlight']};
				border-radius: 2px;
			}
		}

		.markup-container div:last-child,
		.markup-container span:last-child {
			display: inline !important;
		}

		.markup-container span.rcx-message__emoji {
			display: inline-block !important;
		}

		.edit-message-mark {
			color: gray;
			font-size: 12px;
		}
	`;

	return (
		<MessageBody data-qa-type='message-body'>
			<Box className={messageBodyAdditionalStyles} id={`j-message-content-${id}`}>
				<GazzodownText channels={channels} mentions={mentions} searchText={searchText}>
					<>
						<div
							className={edited ? 'markup-container' : ''}
							style={{ overflow: 'hidden', display: 'inline', WebkitBoxOrient: 'vertical', WebkitLineClamp: lineClamp }}
						>
							<Markup tokens={md} />
						</div>
						{edited ? <span className='edit-message-mark'>{t('Edited')}</span> : null}
					</>
				</GazzodownText>
			</Box>
		</MessageBody>
	);
};

export default MessageContentBody;
