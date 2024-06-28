import './appia.css';
import React, { useCallback, useMemo, useState } from 'react';

import type { IAppiaContentProps } from './IAppia';
import { classNames } from './utils';
import { ArrowIcon } from '../../AppiaIcon';

interface IField {
	label: string;
	value: string;
	show: boolean;
}
const FeedbackMsg: React.FC<IAppiaContentProps> = ({ msg }) => {
	const fields = useMemo(() => JSON.parse(msg.msgData || '[]') as IField[], [msg.msgData]);
	const showToggle = useMemo(() => fields.find((field) => !field.show), [fields]);
	const [toggle, setToggle] = useState(false);
	const onToggle = useCallback(() => {
		setToggle((prevState) => !prevState);
	}, []);

	return (
		<div className='appia-approval-wrapper'>
			<div className='appia-approval-header'>{msg.msg}</div>
			<div className='appia-approval-body'>
				{fields
					.filter(({ show }) => toggle || show)
					.map(({ label, value }) => (
						<div key={label} className='appia-approval-item'>
							<div className='appia-approval-item-label'>{label}</div>
							<div className='appia-approval-item-value'>{`${value}`}</div>
						</div>
					))}
			</div>
			{showToggle ? (
				<div onClick={onToggle} className={classNames('appia-feedback-btn', toggle && 'appia-feedback-btn-reverse')}>
					<ArrowIcon />
					{toggle ? ' 收起' : ' 展开'}
				</div>
			) : null}
		</div>
	);
};

export default FeedbackMsg;
