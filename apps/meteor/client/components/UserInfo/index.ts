import UserInfo from './UserInfo';
import UserInfoAction from './UserInfoAction';
import UserInfoAvatar from './UserInfoAvatar';
import UserInfoUsername from './UserInfoUsername';
import InfoPanel from '../InfoPanel';

export default Object.assign(UserInfo, {
	Action: UserInfoAction,
	Avatar: UserInfoAvatar,
	Info: InfoPanel.Text,
	Label: InfoPanel.Label,
	Username: UserInfoUsername,
});
