import type { IRoom } from '@rocket.chat/core-typings';
import type { Icon } from '@rocket.chat/fuselage';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { BlazeTemplates } from 'meteor/templating';
import type { ReactElement, ComponentProps } from 'react';
import React from 'react';

import BlazeTemplate from './BlazeTemplate';
import VerticalBar from '../../../components/VerticalBar';
import type { ToolboxContextValue } from '../contexts/ToolboxContext';
import { useTabBarClose } from '../contexts/ToolboxContext';

type VerticalBarOldActionsProps = {
	name: keyof BlazeTemplates;
	rid: IRoom['_id'];
	_id: string;
	icon?: ComponentProps<typeof Icon>['name'];
	tabBar: ToolboxContextValue['tabBar'];
	title: TranslationKey;
};

const VerticalBarOldActions = ({ name, icon, title, ...props }: VerticalBarOldActionsProps): ReactElement => {
	const close = useTabBarClose();
	const t = useTranslation();

	return (
		<>
			<VerticalBar.Header>
				{icon && <VerticalBar.Icon name={icon} />}
				<VerticalBar.Text>{t(title)}</VerticalBar.Text>
				{close && <VerticalBar.Close onClick={close} />}
			</VerticalBar.Header>
			<VerticalBar.Content>
				<BlazeTemplate flexShrink={1} overflow='hidden' name={name} {...(props as any)} />
			</VerticalBar.Content>
		</>
	);
};

export default VerticalBarOldActions;
