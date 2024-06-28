import { PlusOutlined, CheckOutlined, SearchOutlined } from '@ant-design/icons';
import type { IRoom } from '@rocket.chat/core-typings';
import { Box, Modal } from '@rocket.chat/fuselage';
import { escapeRegExp } from '@rocket.chat/string-helpers';
import { useEndpoint, usePermission, useSetting, useToastMessageDispatch } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { dropdownOptionsStyles, styles } from './appia-style';
import { Alert, Button, message, Select, Tag } from '../../../../../../components/AppiaUI';
import ModalFooter from '../Modal/Footer';
import ModalHeader from '../Modal/Header';
import { useRoomInfo } from '../hooks/useRoomInfo';

interface IProps {
	onClose: () => void;
	room: IRoom;
	reload: () => Promise<void>;
}

const AddOutterUsersModal: FC<IProps> = ({ room, onClose, ...props }) => {
	const [loading, setLoading] = useState(false);
	const [members, setMembers] = useState({
		list: [],
		options: [],
	});
	const [option, setOption] = useState([]);
	const [searchValue, setSearchValue] = useState('');
	const [searchRes, setSearchRes] = useState({
		list: [],
		dropdownOpen: false,
	});
	const fetch = useEndpoint('GET', '/v1/org/members');
	const roomInfo = useRoomInfo(room.rid);
	const joinFederationRoom = useEndpoint('POST', `/v1/room/${room.rid}/join`);
	const canAddUser = usePermission('add-user-to-private-c-room', room.rid);
	const company = useSetting('Enterprise_ID');
	const { username } = Meteor.user();
	const dispatchToastMessage = useToastMessageDispatch();

	const onSearch = (value) => {
		setSearchValue(value);
		const keyword = value.trim();
		if (keyword) {
			const reg = new RegExp(escapeRegExp(keyword), 'i');
			setSearchRes({
				dropdownOpen: true,
				list: members.list.filter((user) => reg.test(user.name) || reg.test(user.username)),
			});
		} else {
			setSearchRes({
				dropdownOpen: false,
				list: [],
			});
		}
	};

	const optionSet = new Set(option);

	useEffect(() => {
		(async () => {
			const { data = [] } = await fetch({ rid: room.rid });
			const list = [];
			const options = [];

			data.forEach((org) =>
				org.members.forEach((user) => {
					console.log(org.remote);
					list.push({
						...user,
						...org,
						key: `@${user.username}:${org.remote}`,
					});

					options.push({
						label: `${user.name}(${org.orgType})`,
						value: `@${user.username}:${org.remote}`,
					});
				}),
			);

			setMembers({
				list,
				options,
			});
		})();
	}, []);

	const reload = useCallback(() => {
		let time = 5;

		const r = () => {
			if (time >= 0) {
				time--;
				setTimeout(() => {
					props.reload && props.reload();
					r();
				}, 2000);
			}
		};

		r();
	}, [props.reload]);
	const onSubmit = useCallback(async () => {
		if (!(canAddUser || (room.rt !== 'p' && room.t === 'c'))) {
			dispatchToastMessage({ type: 'error', message: '没有权限' });
			return;
		}

		setLoading(true);
		joinFederationRoom({
			users: option,
			owner: username,
			ownerOrg: company.toLowerCase(),
		});

		setTimeout(async () => {
			onClose();
			reload();
			setLoading(false);
			const time = option.length * 2;

			if (time > 10) {
				message.open({
					content: (
						<Alert
							message={`添加外部成员大约需要${time > 60 ? `${Math.round(time / 60)}分钟` : `${time}秒`}，请稍后操作`}
							type='warning'
							closable
							showIcon
						/>
					),
					duration: 10,
					className: 'appia-toast-wrapper',
					onClick: () => {
						message.destroy('CreateTeamToast');
					},
					key: 'CreateTeamToast',
				});
			}
		}, 2000);
	}, [roomInfo, option, canAddUser, company, username, reload]);

	return (
		<Modal style={{ width: 480 }}>
			<Box className={styles}>
				<ModalHeader title='添加外部成员' onClose={onClose} />

				<div className='select'>
					<Select
						placeholder='搜索用户名'
						style={{ width: '100%' }}
						dropdownStyle={{ zIndex: 90000 }}
						mode='multiple'
						onSearch={onSearch}
						value={option}
						onDeselect={(value) => setOption((prevState) => prevState.filter((option) => option !== value))}
						searchValue={searchValue}
						suffixIcon={<SearchOutlined />}
						filterOption={false}
						open={searchRes.dropdownOpen}
						dropdownRender={() => (
							<Box
								className={dropdownOptionsStyles}
								onMouseDown={(e) => {
									e.preventDefault();
									e.stopPropagation();
								}}
							>
								{searchRes.list.length ? (
									<Virtuoso
										style={{ height: '320px' }}
										totalCount={searchRes.list.length}
										data={searchRes.list}
										itemContent={(_, user) => {
											let props = {};

											if (user.exist === '1' || optionSet.has(user.key)) {
												props = {
													icon: <CheckOutlined />,
													disabled: true,
												};
											}

											return (
												<div className='option' key={user.key}>
													<div className='avatar'>
														<img src={`${user.appiaHost}/avatar/${user.username}`} />
													</div>
													<div className='name'>
														{user.name}
														<Tag color='blue' className='tag'>
															{user.orgType}
														</Tag>
													</div>
													<Button
														type='primary'
														ghost={true}
														shape='round'
														icon={<PlusOutlined />}
														onClick={() => {
															setOption((prevState) => [...prevState, user.key]);
															setSearchRes({
																list: [],
																dropdownOpen: false,
															});
															setSearchValue('');
														}}
														{...props}
													>
														添加
													</Button>
												</div>
											);
										}}
									/>
								) : (
									<div className='empty'>Appia账号不存在，换个账号试试</div>
								)}
							</Box>
						)}
						options={members.options}
					/>
				</div>
				<ModalFooter>
					<Button onClick={onClose}>取消</Button>
					<Button type='primary' loading={loading} disabled={!option.length} onClick={onSubmit}>
						完成
					</Button>
				</ModalFooter>
			</Box>
		</Modal>
	);
};

export default AddOutterUsersModal;
