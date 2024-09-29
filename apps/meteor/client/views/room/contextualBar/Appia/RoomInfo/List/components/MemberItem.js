import { Option, OptionContent, ActionButton, Icon } from '@rocket.chat/fuselage';
import { usePrefersReducedMotion } from '@rocket.chat/fuselage-hooks';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { useState } from 'react';

import UserActions from './UserActions';
import { Tag } from '../../../../../../../components/AppiaUI';
import { ReactiveUserStatus } from '../../../../../../../components/UserStatus';
import UserAvatar from '../../../../../../../components/avatar/UserAvatar';
import { usePreventPropagation } from '../../../../../../../hooks/usePreventPropagation';

export const MemberItem = ({ _id, status, name, username, onClickView, style, rid, reload, roles, isTeam, federated }) => {
	const [showButton, setShowButton] = useState();
	const t = useTranslation();

	const isReduceMotionEnabled = usePrefersReducedMotion();
	const handleMenuEvent = {
		[isReduceMotionEnabled ? 'onMouseEnter' : 'onTransitionEnd']: setShowButton,
	};

	const onClick = usePreventPropagation();
	const roleMap = {};
	roles?.forEach((role) => {
		roleMap[role] = 1;
	});
	let content = null;
	if (isTeam && roleMap.owner) {
		content = (
			<>
				<Icon name='shield-check' size='x16' style={{ marginTop: -2 }}></Icon> {t('role_name_owner1')}
			</>
		);
	} else if (roleMap.owner) {
		content = (
			<>
				<Icon name='mic' size='x16' style={{ marginTop: -2 }}></Icon> {t('role_name_owner2')}
			</>
		);
	} else if (isTeam && roleMap.moderator) {
		content = (
			<>
				<Icon name='shield-blank' size='x16' style={{ marginTop: -2 }}></Icon> {t('role_name_moderator1')}
			</>
		);
	} else if (roleMap.moderator) {
		content = (
			<>
				<Icon name='shield-check' size='x16' style={{ marginTop: -2 }}></Icon> {t('role_name_moderator2')}
			</>
		);
	}

	return (
		<Option
			id={_id}
			style={style}
			data-username={username}
			presence={status}
			onClick={!federated ? onClickView : undefined}
			{...handleMenuEvent}
		>
			<Option.Avatar>
				<UserAvatar username={username} size='x28' />
			</Option.Avatar>
			<Option.Column>
				<ReactiveUserStatus uid={_id} />
			</Option.Column>
			<OptionContent>
				{name} {content ? <Tag style={{ border: 0, background: '#F2F3F5' }}>{content}</Tag> : null}{' '}
				{federated ? <Tag color='blue'>外部</Tag> : null}
			</OptionContent>
			<Option.Menu onClick={onClick}>
				{showButton ? (
					<UserActions name={name} roleMap={roleMap} username={username} rid={rid} _id={_id} reload={reload} federated={federated} />
				) : (
					<ActionButton ghost tiny icon='kebab' />
				)}
			</Option.Menu>
		</Option>
	);
};

MemberItem.Skeleton = Option.Skeleton;
