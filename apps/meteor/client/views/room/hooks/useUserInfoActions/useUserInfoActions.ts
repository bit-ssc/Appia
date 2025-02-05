import type { IRoom, IUser } from '@rocket.chat/core-typings';
import {useCallback, useMemo, useState} from 'react';
import { Meteor } from 'meteor/meteor';

import { useEmbeddedLayout } from '../../../../hooks/useEmbeddedLayout';
import type { Action } from '../../../hooks/useActionSpread';
import { useBlockUserAction } from './actions/useBlockUserAction';
// import { useCallAction } from './actions/useCallAction';
import { useChangeLeaderAction } from './actions/useChangeLeaderAction';
import { useChangeModeratorAction } from './actions/useChangeModeratorAction';
import { useChangeOwnerAction } from './actions/useChangeOwnerAction';
import { useDirectMessageAction } from './actions/useDirectMessageAction';
// import { useIgnoreUserAction } from './actions/useIgnoreUserAction';
// import { useMuteUserAction } from './actions/useMuteUserAction';
// import { useRedirectModerationConsole } from './actions/useRedirectModerationConsole';
import { useRemoveUserAction } from './actions/useRemoveUserAction';
const uid = ((id) => () => {
	console.log('id', id);
	return ++id;
)(Date.now());

export const useUserInfoActions = (
	user: Pick<IUser, '_id' | 'username'>,
	rid: IRoom['_id'],
	propsReload,
): {
	[key: string]: Action;
} => {
	const [update, setUpdate] = useState(uid);
	const loginUser = Meteor.user();
	const reload = useCallback(() => {
		propsReload && propsReload();
		setUpdate(uid);
	}, [propsReload]);
	const blockUserOption = useBlockUserAction(user, rid);
	const changeLeaderOption = useChangeLeaderAction(user, rid, reload, update);
	const changeModeratorOption = useChangeModeratorAction(user, rid, reload, update);
	// const openModerationConsoleOption = useRedirectModerationConsole(user._id);
	const changeOwnerOption = useChangeOwnerAction(user, rid, reload, update);
	const openDirectMessageOption = useDirectMessageAction(user, rid);
	// const ignoreUserOption = useIgnoreUserAction(user, rid);
	// const muteUserOption = useMuteUserAction(user, rid);
	const removeUserOption = useRemoveUserAction(user, rid, reload);
	// const callOption = useCallAction(user);
	const isLayoutEmbedded = useEmbeddedLayout();
	const isOwner = !user?.roleMap?.owner || user.username === loginUser?.username;

	return useMemo(
		() => ({
			...(openDirectMessageOption && !isLayoutEmbedded && { openDirectMessage: openDirectMessageOption }),
			// ...(callOption && { call: callOption }),
			...(changeOwnerOption && isOwner && { changeOwner: changeOwnerOption }),
			...(changeLeaderOption && { changeLeader: changeLeaderOption }),
			...(changeModeratorOption && isOwner && { changeModerator: changeModeratorOption }),
			// ...(openModerationConsoleOption && { openModerationConsole: openModerationConsoleOption }),
			// ...(ignoreUserOption && { ignoreUser: ignoreUserOption }),
			// ...(muteUserOption && { muteUser: muteUserOption }),
			...(blockUserOption && { toggleBlock: blockUserOption }),
			...(removeUserOption && !user?.roleMap?.owner && { removeUser: removeUserOption }),
		}),
		[
			openDirectMessageOption,
			isLayoutEmbedded,
			// callOption,
			changeOwnerOption,
			changeLeaderOption,
			changeModeratorOption,
			// ignoreUserOption,
			// muteUserOption,
			blockUserOption,
			removeUserOption,
			// openModerationConsoleOption,
		],
	);
};
