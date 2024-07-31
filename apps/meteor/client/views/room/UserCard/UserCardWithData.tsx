import type { IRoom } from '@rocket.chat/core-typings';
// import { PositionAnimated, AnimatedVisibility, Menu, Option } from '@rocket.chat/fuselage';
import { PositionAnimated, AnimatedVisibility } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetting, useRolesDescription } from '@rocket.chat/ui-contexts';
import type { UIEvent } from 'react';
import React, { useMemo, useRef } from 'react';

import { getUserEmailAddress } from '../../../../lib/getUserEmailAddress';
import { Backdrop } from '../../../components/Backdrop';
import LocalTime from '../../../components/LocalTime';
// import UserCard from '../../../components/UserCard';
import UserCardNew from '../../../components/UserCard/UserCardNew';
import { ReactiveUserStatus } from '../../../components/UserStatus';
import { AsyncStatePhase } from '../../../hooks/useAsyncState';
import { useEndpointData } from '../../../hooks/useEndpointData';
// import { useActionSpread } from '../../hooks/useActionSpread';
// import { useUserInfoActions } from '../hooks/useUserInfoActions';
/**
type UserCardWithDataProps = {
	username: string;
	target: Element;
	rid: IRoom['_id'];
	open: (e: UIEvent) => void;
	onClose: () => void;
};
*/
// const UserCardWithData = ({ username, target, rid, open, onClose }: UserCardWithDataProps): ReactElement => {
const UserCardWithData = ({ username, onClose, target, open }) => {
	const ref = useRef(target);
	const getRoles = useRolesDescription();
	const showRealNames = useSetting('UI_Use_Real_Name');

	const query = useMemo(() => ({ username }), [username]);
	const { value: data, phase: state } = useEndpointData('/v1/users.info', { params: query });

	ref.current = target;

	const isLoading = state === AsyncStatePhase.LOADING;

	const user = useMemo(() => {
		const defaultValue = isLoading ? undefined : null;

		const {
			_id,
			name = username,
			roles = defaultValue,
			statusText = defaultValue,
			bio = defaultValue,
			utcOffset = defaultValue,
			nickname,
			avatarETag,
			employeeID = defaultValue,
			importIds = defaultValue,
		} = data?.user || {};

		return {
			_id,
			name: showRealNames ? name : username,
			username,
			// roles: roles && getRoles(roles).map((role, index) => <UserCard.Role key={index}>{role}</UserCard.Role>),
			bio,
			etag: avatarETag,
			localTime: utcOffset && Number.isInteger(utcOffset) && <LocalTime utcOffset={utcOffset} />,
			status: _id && <ReactiveUserStatus uid={_id} />,
			customStatus: statusText,
			nickname,
			employeeID,
			importIds,
			email: getUserEmailAddress(data?.user || {}),
		};
	}, [data, username, showRealNames, isLoading, getRoles]);

	const handleOpen = useMutableCallback((e: UIEvent) => {
		open?.(e);
		onClose?.();
	});

	/**
	const userActions = useUserInfoActions({ _id: user._id ?? '', username: user.username }, rid);
	const { actions: actionsDefinition, menu: menuOptions } = useActionSpread(userActions);

	const menu = useMemo(() => {
		if (!menuOptions) {
			return null;
		}

		return (
			<Menu
				flexShrink={0}
				maxHeight='initial'
				mi='x2'
				key='menu'
				renderItem={({ label: { label, icon }, ...props }): ReactElement => <Option {...props} label={label} icon={icon} />}
				options={menuOptions}
			/>
		);
	}, [menuOptions]);

	const actions = useMemo(() => {
		const mapAction = ([key, { label, icon, action }]: any): ReactElement => (
			<UserCard.Action key={key} label={label} aria-label={label} onClick={action} icon={icon} />
		);

		return [...actionsDefinition.map(mapAction), menu].filter(Boolean);
	}, [actionsDefinition, menu]);
	*/
	return (
		<>
			<Backdrop bg='transparent' onClick={onClose} />
			<PositionAnimated anchor={ref} placement='top-start' margin={8} visible={AnimatedVisibility.UNHIDING}>
				{/* <UserCard {...user} onClose={onClose} open={handleOpen} actions={actions} isLoading={isLoading} />*/}
				<UserCardNew {...user} onClose={onClose} open={handleOpen} />
			</PositionAnimated>
		</>
	);
};

export default UserCardWithData;
