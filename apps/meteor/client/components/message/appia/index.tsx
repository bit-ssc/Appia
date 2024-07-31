import React from 'react';

import Approval from './ApprovalMsg';
import FeedbackMsg from './FeedbackMsg';
import ForwardMsg from './ForwardMsg';
import type { IAppiaContentProps } from './IAppia';
import LeXiangMsg from './LeXiangMsg';
import MentionType from './MentionType';
import ShareDynamic from './ShareDynamic';
import UdeskMsg from './udeskMsg';

export const components: Record<
	string,
	{
		component: React.FC<IAppiaContentProps>;
		className: string;
	}
> = {
	'approval': {
		component: Approval,
		className: 'approval',
	},
	'applyJoinRoom': {
		component: Approval,
		className: 'approval',
	},
	'approvalNeedAuth': {
		component: Approval,
		className: 'approval',
	},
	'meeting_room': {
		component: Approval,
		className: 'approval',
	},
	'mentionType': {
		component: MentionType,
		className: 'mentionType',
	},
	'udeskMsg': {
		component: UdeskMsg,
		className: 'udeskMsg',
	},
	'forwardMergeMessage': {
		component: ForwardMsg,
		className: 'forwardMergeMessage',
	},
	'shareDynamic': {
		component: ShareDynamic,
		className: 'share-media',
	},
	'field_list:feedback': {
		component: FeedbackMsg,
		className: 'approval',
	},
	'lexiangMsg': {
		component: LeXiangMsg,
		className: 'lexiang',
	},
};

const AppiaContent: React.FC<IAppiaContentProps> = (props) => {
	const { msgType } = props.msg;

	const Component = components[msgType as keyof typeof components]?.component;

	if (Component) {
		return <Component {...props} />;
	}

	return <div>未知消息</div>;
};

export default AppiaContent;
