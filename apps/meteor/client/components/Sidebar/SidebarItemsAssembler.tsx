import { Divider } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { Fragment, memo } from 'react';

import SidebarNavigationItem from './SidebarNavigationItem';
import type { SidebarItem } from '../../lib/createSidebarItems';
import { isSidebarItem } from '../../lib/createSidebarItems';

type SidebarItemsAssemblerProps = {
	items: SidebarItem[];
	currentPath?: string;
};

const SidebarItemsAssembler: FC<SidebarItemsAssemblerProps> = ({ items, currentPath }) => {
	const t = useTranslation();

	return (
		<>
			{items.map((props) => (
				<Fragment key={props.i18nLabel}>
					{isSidebarItem(props) ? (
						<SidebarNavigationItem
							permissionGranted={props.permissionGranted}
							pathGroup={props.pathGroup || ''}
							pathSection={props.href ?? props.pathSection ?? ''}
							icon={props.icon}
							label={t((props.i18nLabel || props.name) as Parameters<typeof t>[0])}
							currentPath={currentPath}
							tag={t.has(props.tag) ? t(props.tag) : props.tag}
							externalUrl={props.externalUrl}
							badge={props.badge}
						/>
					) : (
						<Divider />
					)}
				</Fragment>
			))}
		</>
	);
};

export default memo(SidebarItemsAssembler);
