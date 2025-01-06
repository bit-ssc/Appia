import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Box, Icon, TextInput, Margins, Throbber, ButtonGroup, Button, Callout, ToggleSwitch } from '@rocket.chat/fuselage';
import { useMutableCallback, useAutoFocus, useUniqueId } from '@rocket.chat/fuselage-hooks';
import { usePermission, useSetModal, useEndpoint, useMethod, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import { FlowRouter } from 'meteor/kadira:flow-router';
import React, { useCallback, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { Modal, Collapse } from '../../../../../../components/AppiaUI';
import GenericModal from '../../../../../../components/GenericModal';
import ScrollableContentWrapper from '../../../../../../components/ScrollableContentWrapper';
import VerticalBar from '../../../../../../components/VerticalBar';
import { useAddInnerUser } from '../AddUsersModal';
import DefaultRow from './DefaultRow';
import RoomName from './RoomName';
import RoomSchedule from './RoomSchedule';

import './room.css';
// eslint-disable-next-line import/no-absolute-path,import/no-unresolved
import { FederationIcon } from '/client/components/AppiaIcon';
// eslint-disable-next-line import/no-absolute-path,import/no-unresolved
import UserAvatar from '/client/components/avatar/UserAvatar';
import { useReactiveValue } from '/client/hooks/useReactiveValue';
import { RoomRoles } from '/app/models';
// import { useRoomSubscription } from '/client/views/room/contexts/RoomContext';

const formatUrl = (text) => `https://static.appia.cn/logo/${text}.png`;

const useUserHasRoomRole = (rid) =>
	useReactiveValue(
		useCallback(() => {
			const map = {};
			RoomRoles.find({ rid }).forEach((role) => {
				if (role?.u?._id) {
					map[role.u._id] = role.roles || [];
				}
			});

			return map;
		}, [rid]),
	);

const RoomMembers = ({
	loading,
	members = [],
	text,
	setText,
	onClickClose,
	onClickView,
	onClickSet,
	onClickAnnouncement,
	onClickTodos,
	total,
	error,
	loadMoreItems,
	renderRow: Row = DefaultRow,
	rid,
	isTeam,
	teamMain,
	isDirect,
	room,
	reload,
	realFederated,
	federatedMembers,
	searchFederatedMembers,
	handleValue,
	formHandlers,
	formValues,
	handleSaveButton,
	handlePostFavorite,
	...props
}) => {
	const t = useTranslation();
	const inputRef = useAutoFocus(true);
	const canEdit = usePermission('edit-team-channel', room._id) || room.prid;
	const roleMap = useUserHasRoomRole(rid);

	// const subscription = useRoomSubscription();

	const strsGroup =
		room.t === 'c'
			? {
					title: t('Channel_Info'),
					name: t('Channel_name'),
					member: t('Channel_members'),
			  }
			: {
					title: t('Topic_Info'),
					name: t('Appia_Theme'),
					member: t('Topic_members'),
			  };
	const strs = isTeam
		? {
				title: t('Teams_Info'),
				name: t('Appia_Theme'),
				member: t('Teams_members'),
		  }
		: strsGroup;
	const itemData = useMemo(() => ({ onClickView, rid }), [onClickView, rid]);

	// 外部 490 7   项目		群	540
	const translateYNumber = useMemo(() => {
		if (realFederated) {
			return '7px';
		}
		return '6px';
	}, [room, realFederated]);
	const lm = useMutableCallback((start) => !loading && loadMoreItems(start));
	const isChannel = room.t === 'c';

	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());
	const dispatchToastMessage = useToastMessageDispatch();
	const { type, joined = true } = room;

	const leaveTeam = useEndpoint('POST', '/v1/teams.leave');
	const deleteRoom = useEndpoint('POST', room.t === 'c' ? '/v1/channels.delete' : '/v1/groups.delete');
	const leaveRoom = useMethod('leaveRoom');
	const handleLeave = useMutableCallback(async () => {
		const onConfirm = async () => {
			try {
				if (teamMain) {
					await leaveTeam({
						teamId: room.teamId,
					});
				} else {
					await leaveRoom(rid);
				}

				dispatchToastMessage({ type: 'success', message: t('You_have_left') });
				closeModal();
				FlowRouter.go(`/home?menu=${isChannel ? 'channel' : 'home'}`);
			} catch (e) {
				closeModal();
				if (e?.error === 'error-you-are-last-owner' || e?.error === 'last-owner-can-not-be-removed') {
					dispatchToastMessage({ type: 'error', message: `${t('last_Sponsor_Cannot_leave')}` });
				} else {
					dispatchToastMessage({ type: 'error', message: t('Error_during_deletion') });
				}
			}
		};

		setModal(<GenericModal variant='danger' onConfirm={onConfirm} onCancel={closeModal} title={t('Confirm_exit')} confirmText={t('OK')} />);
	}, [closeModal, dispatchToastMessage, leaveTeam]);

	const isGroup = room.t === 'p' || room.t === 'c';
	const canLeave = usePermission(type === 'c' ? 'leave-c' : 'leave-p') && room.cl !== false && joined && isGroup;
	const canDelete = usePermission(type === 'c' ? 'delete-c' : 'delete-p', rid) && isGroup;

	const handleDelete = useMutableCallback(() => {
		const onConfirm = async () => {
			try {
				await deleteRoom({ roomId: rid });
				dispatchToastMessage({ type: 'success', message: t('Deleted_successfully') });
				FlowRouter.go(`/home?menu=${isChannel ? 'channel' : 'home'}`);
				closeModal();
			} catch (e) {
				closeModal();
				if (e?.error === 'error-you-are-last-owner' || e?.error === 'last-owner-can-not-be-removed') {
					dispatchToastMessage({ type: 'error', message: `${t('last_Sponsor_Cannot_leave')}` });
				} else {
					dispatchToastMessage({ type: 'error', message: t('Error_during_deletion') });
				}
			}
		};
		Modal.confirm({
			title: t('Dissolve_discussion'),
			icon: <ExclamationCircleOutlined />,
			okText: t('Yes_continue'),
			cancelText: t('Cancel'),
			onOk: onConfirm,
		});
	});
	const existGroupText = room.t === 'c' ? t('Leave_Channel') : t('Leave_Discussion');
	const deleteGroupText = room.t === 'c' ? t('Dissolve_Channel') : t('Dissolve_Discussion');
	const settingText = t('Mute_Notification');
	const favorite = t('Favorite');

	// const announcementText = '公告';
	const openAddInnerUser = useAddInnerUser(room, reload);
	const onAddUsers = () => {
		openAddInnerUser();
	};
	const renderFederatedMembers = () => {
		if (searchFederatedMembers) {
			return (
				<Virtuoso
					style={{
						height: '100%',
						width: '100%',
					}}
					data={searchFederatedMembers}
					components={{ Scroller: ScrollableContentWrapper }}
					itemContent={(index, data) => (
						<Row data={itemData} user={data} roles={roleMap[data._id] || []} isTeam={isTeam} index={index} reload={reload} />
					)}
				/>
			);
		}
		const federatedData = federatedMembers?.map((item, index) => ({
			key: `${index}`,
			label: (
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<div className={'appia__team-info-scroller-members-title'}>
						<UserAvatar url={item.logo || formatUrl(item?.org)} size='x28' />
					</div>
					<div className={'appia__team-info-scroller-members-title'}>{`${item?.org.toUpperCase()}`}</div>
					{!item.isLocal && (
						<div className={'appia__team-info-scroller-members-title'}>
							<FederationIcon />
						</div>
					)}
				</div>
			),
			children: (
				<>
					{item.members.map((member) => (
						<Row key={member._id} data={itemData} user={member} roles={roleMap[member._id] || []} isTeam={isTeam} reload={reload} />
					))}
				</>
			),
		}));
		return (
			<Collapse
				style={{
					border: 'none',
					borderRadius: 0,
					height: `100%`,
					overflowY: 'auto',
					background: '#fff',
				}}
				destroyInactivePanel
				items={federatedData}
				defaultActiveKey={['0']}
			/>
		);
	};

	const renderMembers = () => (
		<>
			{loading && (
				<Box pi='x24' pb='x12'>
					<Throbber size='x12' />
				</Box>
			)}

			{error && (
				<Box pi='x12' pb='x12'>
					<Callout type='danger'>{error.message}</Callout>
				</Box>
			)}

			{!loading && members.length <= 0 && (
				<Box textAlign='center' p='x12' color='neutral-600'>
					{t('No_members_found')}
				</Box>
			)}

			<Box w='full' h='full' overflow='hidden' flexShrink={1}>
				{!loading && members && members.length > 0 && (
					<Virtuoso
						style={{
							height: '100%',
							width: '100%',
						}}
						totalCount={total}
						endReached={lm}
						overscan={50}
						data={members}
						components={{ Scroller: ScrollableContentWrapper }}
						itemContent={(index, data) => (
							<Row data={itemData} user={data} roles={roleMap[data._id] || []} isTeam={isTeam} index={index} reload={reload} />
						)}
					/>
				)}
			</Box>
		</>
	);

	return (
		<Box
			display='flex'
			flexGrow={1}
			flexDirection='column'
			className='appia__team-info'
			style={{
				overflow: 'auto',
			}}
		>
			<VerticalBar.Header>
				<VerticalBar.Icon name='info-circled' />
				<VerticalBar.Text>{strs.title}</VerticalBar.Text>
				{onClickClose && <VerticalBar.Close onClick={onClickClose} />}
			</VerticalBar.Header>

			<VerticalBar.Content p='x12' className='appia__team-info__no-padding-top'>
				<Box display='flex' flexDirection='row' alignItems='center' mi='x12' className='appia__team-info__wrapper'>
					<Box className='appia__team-info__title-label' flexGrow={1} flexShrink={0}>
						{strs.name}
					</Box>
					<Box className='appia__team-info__title-value' width='60%'>
						<RoomName name={room?.fname || room?.dname || ''} rid={rid} canEdit={canEdit} />
					</Box>
				</Box>
				{/* {room.t === 'c' && (
					<Box mi='x12' className='appia__team-info__wrapper'>
						<RoomSchedule rid={rid} canEdit={canEdit} onClose={onClickClose} />
					</Box>
				)} */}
				<Box display='flex' flexDirection='row' alignItems='center' mi='x12' className='appia__team-info__wrapper'>
					<Box className='appia__team-info__title-label' flexGrow={1} flexShrink={0}>
						{settingText}
					</Box>
					{useMemo(
						() => (
							<ToggleSwitch
								onChange={(e) => {
									formHandlers?.handleShowCounter(e);
									formHandlers?.handleTurnOn(e);
									setTimeout(() => {
										handleSaveButton();
									}, 0);
								}}
								checked={formValues?.showCounter}
							/>
						),
						[formHandlers?.handleShowCounter, formHandlers?.handleTurnOn, handleSaveButton, formValues?.showCounter],
					)}
				</Box>
				<Box display='flex' flexDirection='row' alignItems='center' mi='x12' className='appia__team-info__wrapper'>
					<Box className='appia__team-info__title-label' flexGrow={1} flexShrink={0}>
						{favorite}
					</Box>

					{useMemo(
						() => (
							<ToggleSwitch
								onChange={(e) => {
									formHandlers?.handleFavorite(e);
									formHandlers?.handleTurnOn(e);
									setTimeout(() => {
										handlePostFavorite(!formValues?.favorite);
									}, 0);
								}}
								checked={formValues?.favorite}
							/>
						),
						[formHandlers?.handleFavorite, formHandlers?.handleTurnOn, handleSaveButton, formValues?.favorite],
					)}
				</Box>

				<Box display='flex' flexDirection='row' alignItems='center' justifyContent='space-between' p='x12'>
					<Box is='span' className='appia__team-info__title-label'>
						{strs.member}
						{!loading && total === 1 ? `（1${t('person')})` : null}
						{!loading && total > 1 ? `(${total} ${t('people')})` : null}
					</Box>
					{!isDirect && props.showAddButton && (
						<a onClick={onAddUsers}>
							<Icon name='user-plus' size='x20' mie='x4' />
							{t('Add_Member')}
						</a>
					)}
				</Box>
				<Box display='flex' flexDirection='row' flexShrink={0} p='x12' className='appia__team-info-search-input'>
					<Box display='flex' flexDirection='row' flexGrow={1} mi='neg-x4'>
						<Margins inline='x4'>
							<TextInput
								placeholder={t('Search_by_username')}
								value={text}
								ref={inputRef}
								onChange={setText}
								addon={<Icon name='magnifier' size='x20' />}
							/>
						</Margins>
					</Box>
				</Box>
				{realFederated ? renderFederatedMembers() : renderMembers()}
			</VerticalBar.Content>
			<ButtonGroup
				style={{
					transform: `translateY(-${translateYNumber})`,
					paddingLeft: '30px',
					paddingRight: '30px',
				}}
			>
				{canDelete && (
					<Button onClick={handleDelete} width='100%' color='#F76560'>
						{deleteGroupText}
					</Button>
				)}
				{canLeave && (
					<Button onClick={handleLeave} width='100%' color='#F76560'>
						{existGroupText}
					</Button>
				)}
			</ButtonGroup>
		</Box>
	);
};

export default RoomMembers;
