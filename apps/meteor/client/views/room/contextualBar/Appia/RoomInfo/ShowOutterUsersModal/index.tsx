import type { IRoom } from '@rocket.chat/core-typings';
import { Box, Modal } from '@rocket.chat/fuselage';
import { useEndpoint, useSetting } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import QRCode from 'qrcode';
import type { FC } from 'react';
import React, { useState, useEffect, useRef } from 'react';

import { styles } from './appia-style';
import { Button, Select, Spin } from '../../../../../../components/AppiaUI';
import ModalFooter from '../Modal/Footer';
import ModalHeader from '../Modal/Header';
import { useRoomInfo } from '../hooks/useRoomInfo';

interface IProps {
	onClose: () => void;
	room: IRoom;
	reload: () => Promise<void>;
}

const ShowOutterUsersModal: FC<IProps> = ({ room, ...props }) => {
	const [loading, setLoading] = useState(false);
	const user = Meteor.user();
	const roomInfo = useRoomInfo(room.rid);
	const fetch = useEndpoint('GET', `/v1/room/${room.rid}/qrcode/content`);
	const containerRef = useRef<React.HTMLDivElement>(null);
	const enterpriseId = useSetting('Enterprise_ID');
	const [url, setUrl] = useState<string>(null);
	const [expire, setExpire] = useState<number>(-1);

	const onClose = () => {
		props.onClose();
		props.reload();
	};

	const options = [
		{
			label: '永久有效',
			value: -1,
		},
		{
			label: '30天有效',
			value: 30,
		},
		{
			label: '7天有效',
			value: 7,
		},
		{
			label: '3天有效',
			value: 3,
		},
	];

	const download = () => {
		const a = document.createElement('a');
		a.href = url;
		a.target = '_blank';
		a.download = `${room.fname}.png`;
		document.body.appendChild(a);
		a.click();
		a.remove();
	};

	useEffect(() => {
		(async () => {
			if (!enterpriseId || !roomInfo) {
				return;
			}

			setLoading(true);
			try {
				const res = await fetch({
					inviteUsername: user.username,
					expire,
					attribution: enterpriseId,
					t: roomInfo.t,
					owner: user.username,
					ownerOrg: enterpriseId,
				});

				const url = await QRCode.toDataURL(`join_federation#${res.data.inviteId}`);
				setUrl(url);
			} finally {
				setLoading(false);
			}
		})();
	}, [expire, enterpriseId, roomInfo]);

	return (
		<Modal style={{ width: 480 }}>
			<Box className={styles}>
				<ModalHeader title='添加外部成员' onClose={onClose} />
				<div className='container' ref={containerRef}>
					<div className='qrcode'>
						<Spin spinning={loading}>{url ? <img src={url} /> : null}</Spin>
					</div>
					<Button type='primary' disabled={!url} ghost onClick={download}>
						下载二维码
					</Button>
					<div className='desc'>
						二维码有效期
						<Select
							bordered={false}
							options={options}
							value={expire}
							onChange={(v) => setExpire(v)}
							dropdownStyle={{ zIndex: 90000 }}
							popupMatchSelectWidth={false}
							getPopupContainer={() => containerRef.current}
						/>
					</div>
				</div>
				<ModalFooter>
					<Button onClick={onClose}>取消</Button>
					<Button type='primary' onClick={onClose}>
						完成
					</Button>
				</ModalFooter>
			</Box>
		</Modal>
	);
};

export default ShowOutterUsersModal;
