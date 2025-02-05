import { InfoCircleOutlined } from '@ant-design/icons';
import type { IRoom } from '@rocket.chat/core-typings';
import { Box, Modal } from '@rocket.chat/fuselage';
import { useEndpoint } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { useState, useMemo, useCallback, useEffect } from 'react';

import { styles } from './appia-style';
import { Button, Radio, Form, Space, Tooltip, Spin } from '../../../../../../components/AppiaUI';
import ModalHeader from '../Modal/Header';

interface IProps {
	onClose: () => void;
	room: IRoom;
}

const SwitchType: FC<IProps> = ({ onClose, room }) => {
	const [form] = Form.useForm();
	const initialValues = {
		federated: room.federated ? '1' : '0',
		rt: room.rt === 'p' ? '1' : '0',
	};
	const label = room.t === 'c' ? '频道' : '讨论';

	const scopeOptions = useMemo(
		() => [
			{
				label: `内部${label}`,
				value: '0',
			},
			{
				label: `外部${label}`,
				value: '1',
			},
		],
		[label],
	);

	const typeOptions = useMemo(
		() => [
			{
				label: '公开',
				value: '0',
			},
			{
				label: '非公开',
				value: '1',
			},
		],
		[],
	);
	const [loading, setLoading] = useState(false);
	const saveRoomSettings = useEndpoint('POST', '/v1/rooms.saveRoomSettings');
	const external = useEndpoint('GET', '/v1/exist/external.member');
	const [state, setState] = useState({
		loading: false,
		enable: false,
	});

	useEffect(() => {
		(async () => {
			setState({
				loading: true,
				enable: false,
			});
			const { data } = await external({ rid: room.rid });
			setState({
				loading: false,
				enable: !data,
			});
		})();
	}, []);

	const onSubmit = useCallback(async () => {
		const values = form.getFieldsValue();
		setLoading(true);
		console.log(values);
		const params = {
			rid: room.rid,
			federated: values.federated === '1',
		};

		if (room.t === 'c') {
			params.appiaRoomType = values.rt === '1' ? 'p' : '';
		}

		await saveRoomSettings(params);

		onClose();
		setLoading(false);
	}, [saveRoomSettings]);

	return (
		<Modal style={{ width: 480 }}>
			<Box className={styles}>
				<Spin spinning={state.loading}>
					<ModalHeader>转换{label}类型</ModalHeader>
					<Form form={form} layout='vertical' initialValues={initialValues} onFinish={onSubmit}>
						<Form.Item
							label={
								<>
									范围{' '}
									<Tooltip
										zIndex={10001}
										title={
											<>
												{`内部${label}：支持组织内部用户加入`}
												<br />
												{`外部${label}：支持组织外部用户加入`}
											</>
										}
									>
										<InfoCircleOutlined style={{ color: '#86909C', marginLeft: '8px' }} />
									</Tooltip>
								</>
							}
							name='federated'
						>
							<Radio.Group disabled={!state.enable}>
								<Space direction='vertical'>
									{scopeOptions.map((option) => (
										<Radio key={option.value} value={option.value}>
											{option.label}
										</Radio>
									))}
								</Space>
							</Radio.Group>
						</Form.Item>

						{room.t === 'c' ? (
							<Form.Item
								label={
									<>
										类型{' '}
										<Tooltip
											zIndex={10001}
											title={
												<>
													非公开频道仅支持用户被邀请加入；
													<br />
													公开频道支持用户自主加入群聊
												</>
											}
										>
											<InfoCircleOutlined style={{ color: '#86909C', marginLeft: '8px' }} />
										</Tooltip>
									</>
								}
								name='rt'
							>
								<Radio.Group>
									<Space direction='vertical'>
										{typeOptions.map((option) => (
											<Radio key={option.value} value={option.value}>
												{option.label}
											</Radio>
										))}
									</Space>
								</Radio.Group>
							</Form.Item>
						) : null}

						<div className='footer'>
							<Space>
								<Button onClick={onClose}>取消</Button>
								<Button type='primary' loading={loading} htmlType='submit'>
									确定
								</Button>
							</Space>
						</div>
					</Form>
				</Spin>
			</Box>
		</Modal>
	);
};

export default SwitchType;
