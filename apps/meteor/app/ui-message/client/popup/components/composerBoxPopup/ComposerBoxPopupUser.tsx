import React from 'react';
// import { useTranslation } from '@rocket.chat/ui-contexts';
// import { OptionAvatar, OptionColumn, OptionContent } from '@rocket.chat/fuselage';
import { OptionAvatar, OptionContent } from '@rocket.chat/fuselage';

import { Tag } from '../../../../../../client/components/AppiaUI';
import UserAvatar from '../../../../../../client/components/avatar/UserAvatar';
// import ReactiveUserStatus from '../../../../../../client/components/UserStatus/ReactiveUserStatus';

export type ComposerBoxPopupUserProps = {
	_id: string;
	system?: boolean;
	outside?: boolean;
	suggestion?: boolean;
	username: string;
	name?: string;
	nickname?: string;
	status?: string;
	sort?: number;
};

const ComposerBoxPopupUser = ({ _id, system, username, name /* , nickname, outside, suggestion*/ }: ComposerBoxPopupUserProps) => {
	// const t = useTranslation();
	return (
		<>
			{!system && (
				<>
					<OptionAvatar>
						<UserAvatar size='x28' username={username} />
					</OptionAvatar>
					{/**
					<OptionColumn>
						<ReactiveUserStatus uid={_id} />
					</OptionColumn>
					 */}
					<OptionContent>
						<strong>{name ?? username}</strong> {username.includes(':') ? <Tag color='blue'>外部</Tag> : null}
						{/**
						{nickname && <span className='popup-user-nickname'>({nickname})</span>}
						 */}
					</OptionContent>
				</>
			)}

			{system && (
				<OptionContent>
					<strong>{username}</strong> {name}
				</OptionContent>
			)}

			{/**
			{outside && <OptionColumn>{t('Not_in_channel')}</OptionColumn>}
			{suggestion && <OptionColumn>{t('Suggestion_from_recent_messages')}</OptionColumn>}
			 */}
		</>
	);
};

export default ComposerBoxPopupUser;
