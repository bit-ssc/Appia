import React, { useState } from 'react';

import { classNames } from '../utils';

export interface IOption<T> {
	label: string;
	value: T;
}

export interface IProps<T> {
	options: IOption<T>[];
	initValue: T;
	onChange: (value: T) => void;
}

const RadioGroup = <T extends number | string>({ options, initValue, onChange }: IProps<T>): React.ReactElement => {
	const [state, setState] = useState(initValue);

	return (
		<div className='appia-radio-group'>
			{options.map(({ value, label }) => (
				<div
					key={value}
					className={classNames('appia-radio-item', state === value && 'appia-radio-item-active')}
					onClick={(): void => {
						setState(value);
						onChange(value);
					}}
				>
					<div className='appia-radio-icon' />

					<div className='appia-radio-text'>{label}</div>
				</div>
			))}
		</div>
	);
};

export default RadioGroup;
