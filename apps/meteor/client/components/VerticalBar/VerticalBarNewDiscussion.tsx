import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { memo } from 'react';

import { NewTeamIcon } from '../SvgIcons';

type VerticalBarNewDiscussionProps = {
	onClick?: () => void;
};

const VerticalBarNewDiscussion = ({ onClick }: VerticalBarNewDiscussionProps): ReactElement => {
	const t = useTranslation();
	return (
		<div
			className='contact-user-info-new-team'
			onClick={() => {
				onClick && onClick();
			}}
		>
			<NewTeamIcon fontSize={15} />
			<div className='contact-user-info-new-team-title'>{t('New_Discussion')}</div>
		</div>
	);
};

export default memo(VerticalBarNewDiscussion);
