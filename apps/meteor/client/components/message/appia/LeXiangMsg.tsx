import './appia.css';
import { Meteor } from 'meteor/meteor';
import React, { useMemo, useState } from 'react';

import type { IAppiaContentProps, ILeXiang } from './IAppia';
import { APIClient } from '../../../../app/utils/client';
import { dispatchToastMessage } from '../../../lib/toast';
import { Spin } from '../../AppiaUI';

const LeXiangMsg: React.FC<IAppiaContentProps> = ({ msg }) => {
	const [loading, setLoading] = useState(false);

	if (!msg.msgData || typeof msg.msgData !== 'string') {
		return <div>message error</div>;
	}
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { url, title, content, imageUrl } = useMemo(() => JSON.parse(msg.msgData as string) as ILeXiang, [msg.msgData]);

	const directUrl = async () => {
		let linkUrl = `${url}${url.indexOf('?') > -1 ? '&' : '?'}from=appia`;
		setLoading(true);
		try {
			const sourceUrl = encodeURIComponent(encodeURIComponent(url));
			const { accessUrl, token } = await APIClient.get(`/v1/users.externalToken?platform=WEB&source=LEXIANG&url=${sourceUrl}`);
			linkUrl = accessUrl || `${linkUrl}&code=${token}&userId=${Meteor.user()?._id}&username=${Meteor.user()?.username}`;
			setLoading(false);
			window.open(linkUrl, '_blank');
		} catch (error) {
			setLoading(false);
			dispatchToastMessage({
				type: 'error',
				message: 'request fail',
			});
		}
	};

	return (
		<div className='appia-lexiang-wrapper'>
			<Spin spinning={loading} />
			<div onClick={directUrl}>
				{imageUrl && <img src={imageUrl} className='appia-lexiang-image'></img>}
				{title || content ? (
					<div>
						{<div className='appia-lexiang-title'>{title}</div>}
						{<div className='appia-lexiang-content'>{content}</div>}
					</div>
				) : null}
			</div>
		</div>
	);
};

export default LeXiangMsg;
