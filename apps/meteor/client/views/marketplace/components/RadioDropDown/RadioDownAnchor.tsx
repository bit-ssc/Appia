import { Select } from '@rocket.chat/fuselage';
import type { ComponentProps } from 'react';
import React, { forwardRef } from 'react';

import type { RadioDropDownGroup } from '../../definitions/RadioDropDownDefinitions';

const RadioDownAnchor = forwardRef<HTMLInputElement, Partial<ComponentProps<typeof Select>> & { group: RadioDropDownGroup }>(
	function SortDropDownAnchor(props, ref) {
		const { group } = props;

		const selectedFilter = group?.items.find((item) => item.checked)?.label;

		return <Select ref={ref} placeholder={selectedFilter} options={[]} onChange={(): number => 0} color='hint' {...props} />;
	},
);

export default RadioDownAnchor;
