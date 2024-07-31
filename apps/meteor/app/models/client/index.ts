import { Base } from './models/Base';
import { Roles } from './models/Roles';
import { Users } from './models/Users';
import { CachedChannelList } from './models/CachedChannelList';
import { CachedChatRoom } from './models/CachedChatRoom';
import { CachedChatSubscription } from './models/CachedChatSubscription';
import { CachedUserList } from './models/CachedUserList';
import { ChatRoom } from './models/ChatRoom';
import { ChatSubscription } from './models/ChatSubscription';
import { ChatMessage } from './models/ChatMessage';
import { RoomRoles } from './models/RoomRoles';
import { UserAndRoom } from './models/UserAndRoom';
import { UserRoles } from './models/UserRoles';
import { AuthzCachedCollection, ChatPermissions } from './models/ChatPermissions';
import { WebdavAccounts } from './models/WebdavAccounts';
import CustomSounds from './models/CustomSounds';
import EmojiCustom from './models/EmojiCustom';

// overwrite Meteor.users collection so records on it don't get erased whenever the client reconnects to websocket
const meteorUserOverwrite = () => {
	const uid = Meteor.userId();

	if (!uid) {
		return null;
	}

	return (Users.findOne({ _id: uid }) ?? null) as Meteor.User | null;
};
Meteor.users = Users as typeof Meteor.users;
Meteor.user = meteorUserOverwrite;

export {
	Base,
	Roles,
	CachedChannelList,
	CachedChatRoom,
	CachedChatSubscription,
	CachedUserList,
	RoomRoles,
	UserAndRoom,
	UserRoles,
	AuthzCachedCollection,
	ChatPermissions,
	CustomSounds,
	EmojiCustom,
	WebdavAccounts,
	/** @deprecated */
	Users,
	/** @deprecated */
	ChatRoom,
	/** @deprecated */
	ChatSubscription,
	/** @deprecated */
	ChatSubscription as Subscriptions,
	/** @deprecated */
	ChatMessage,
	/** @deprecated */
	ChatMessage as Messages,
};
