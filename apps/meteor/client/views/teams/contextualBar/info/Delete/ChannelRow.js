import { CheckBox, Table, Icon, Margins } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React from 'react';

import { useRoomIcon } from '../../../../../hooks/useRoomIcon';

const ChannelRow = ({ onChange, selected, room }) => {
	const { name, fname, usersCount } = room;

	const handleChange = useMutableCallback(() => onChange(room));

	return (
		<Table.Row action>
			<Table.Cell maxWidth='x300' withTruncatedText>
				<CheckBox checked={selected} onChange={handleChange} />
				<Margins inline='x8'>
					<Icon size='x16' {...useRoomIcon(room)} />
					{fname ?? name}
				</Margins>
			</Table.Cell>

			<Table.Cell align='end' withTruncatedText>
				{usersCount}
			</Table.Cell>
		</Table.Row>
	);
};

export default ChannelRow;
