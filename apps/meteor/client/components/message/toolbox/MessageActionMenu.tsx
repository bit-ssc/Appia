import { MessageToolboxItem, Option, OptionDivider, Box } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ComponentProps, UIEvent, ReactElement } from 'react';
import React, { useState, Fragment, useRef } from 'react';

import ToolboxDropdown from './ToolboxDropdown';
import type { MessageActionConfig } from '../../../../app/ui-utils/client/lib/MessageAction';
import { useEmbeddedLayout } from '../../../hooks/useEmbeddedLayout';
import { ForwardCombineIcon, ForwardIcon, ForwardOneByOneIcon } from '../../SvgIcons';

type MessageActionConfigOption = Omit<MessageActionConfig, 'condition' | 'context' | 'order' | 'action'> & {
	action: (event: UIEvent) => void;
};

type MessageActionMenuProps = {
	options: MessageActionConfigOption[];
};

const icons = {
	forward: <ForwardIcon fontSize={16} />,
	forward_one_by_one: <ForwardOneByOneIcon fontSize={16} />,
	forward_combine: <ForwardCombineIcon fontSize={16} />,
};

const MessageActionMenu = ({ options, ...props }: MessageActionMenuProps): ReactElement => {
	const ref = useRef(null);

	const t = useTranslation();
	const [visible, setVisible] = useState(false);
	const isLayoutEmbedded = useEmbeddedLayout();

	const groupOptions = options
		.map(({ color, ...option }) => ({
			...option,
			...(color === 'alert' && { variant: 'danger' as const }),
		}))
		.reduce((acc, option) => {
			const group = option.variant ? option.variant : '';
			acc[group] = acc[group] || [];
			if (!(isLayoutEmbedded && option.id === 'reply-directly')) acc[group].push(option);

			return acc;
		}, {} as { [key: string]: MessageActionConfigOption[] }) as {
		[key: string]: MessageActionConfigOption[];
	};

	return (
		<>
			<MessageToolboxItem
				ref={ref}
				icon='kebab'
				onClick={(): void => setVisible(!visible)}
				data-qa-id='menu'
				data-qa-type='message-action-menu'
				title={t('More')}
			/>
			{visible && (
				<>
					<Box position='fixed' inset={0} onClick={(): void => setVisible(!visible)} />
					<ToolboxDropdown reference={ref} {...props}>
						{Object.entries(groupOptions).map(([, options], index, arr) => (
							<Fragment key={index}>
								{options.map((option) => {
									const icon = icons[option.icon];

									return (
										<Option
											variant={option.variant}
											key={option.id}
											id={option.id}
											icon={icon ? undefined : (option.icon as ComponentProps<typeof Option>['icon'])}
											label={
												icon ? (
													<div>
														<span style={{ marginRight: 10 }}>{icon}</span>
														{t(option.label)}
													</div>
												) : (
													t(option.label)
												)
											}
											onClick={option.action}
											data-qa-type='message-action'
											data-qa-id={option.id}
											role={option.role ? option.role : 'button'}
										/>
									);
								})}
								{index !== arr.length - 1 && <OptionDivider />}
							</Fragment>
						))}
					</ToolboxDropdown>
				</>
			)}
		</>
	);
};

export default MessageActionMenu;
