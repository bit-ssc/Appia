import { Box, Margins, Tag, Button, Icon, ButtonGroup } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useToastMessageDispatch, useRoute, useUserSubscription, useTranslation, usePermission } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

import DepartmentField from './DepartmentField';
import VisitorClientInfo from './VisitorClientInfo';
import VerticalBar from '../../../../../components/VerticalBar';
import { useEndpointData } from '../../../../../hooks/useEndpointData';
import { useFormatDateAndTime } from '../../../../../hooks/useFormatDateAndTime';
import { useFormatDuration } from '../../../../../hooks/useFormatDuration';
import CustomField from '../../../components/CustomField';
import Field from '../../../components/Field';
import Info from '../../../components/Info';
import Label from '../../../components/Label';
import { AgentField, SlaField, ContactField, SourceField } from '../../components';
import PriorityField from '../../components/PriorityField';
import { useOmnichannelRoomInfo } from '../../hooks/useOmnichannelRoomInfo';

// TODO: Remove moment we are mixing moment and our own formatters :sadface:
function ChatInfo({ id, route }) {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const formatDateAndTime = useFormatDateAndTime();
	const { value: allCustomFields, phase: stateCustomFields } = useEndpointData('/v1/livechat/custom-fields');
	const [customFields, setCustomFields] = useState([]);
	const formatDuration = useFormatDuration();

	const { data: room } = useOmnichannelRoomInfo(id);

	const {
		ts,
		tags,
		closedAt,
		departmentId,
		v,
		servedBy,
		metrics,
		topic,
		waitingResponse,
		responseBy,
		slaId,
		priorityId,
		livechatData,
		source,
		queuedAt,
	} = room || { room: { v: {} } };

	const routePath = useRoute(route || 'omnichannel-directory');
	const canViewCustomFields = usePermission('view-livechat-room-customfields');
	const subscription = useUserSubscription(id);
	const hasGlobalEditRoomPermission = usePermission('save-others-livechat-room-info');
	const hasLocalEditRoomPermission = servedBy?._id === Meteor.userId();
	const visitorId = v?._id;
	const queueStartedAt = queuedAt || ts;

	useEffect(() => {
		if (allCustomFields) {
			const { customFields: customFieldsAPI } = allCustomFields;
			setCustomFields(customFieldsAPI);
		}
	}, [allCustomFields, stateCustomFields]);

	const checkIsVisibleAndScopeRoom = (key) => {
		const field = customFields.find(({ _id }) => _id === key);
		return field?.visibility === 'visible' && field?.scope === 'room';
	};

	const onEditClick = useMutableCallback(() => {
		const hasEditAccess = !!subscription || hasLocalEditRoomPermission || hasGlobalEditRoomPermission;
		if (!hasEditAccess) {
			return dispatchToastMessage({ type: 'error', message: t('Not_authorized') });
		}

		routePath.push(
			route
				? {
						tab: 'room-info',
						context: 'edit',
						id,
				  }
				: {
						page: 'chats',
						id,
						bar: 'edit',
				  },
		);
	});

	const customFieldEntries = Object.entries(livechatData || {}).filter(([key]) => checkIsVisibleAndScopeRoom(key) && livechatData[key]);

	return (
		<>
			<VerticalBar.ScrollableContent p='x24'>
				<Margins block='x4'>
					{source && <SourceField room={room} />}
					{room && v && <ContactField contact={v} room={room} />}
					{visitorId && <VisitorClientInfo uid={visitorId} />}
					{servedBy && <AgentField agent={servedBy} />}
					{departmentId && <DepartmentField departmentId={departmentId} />}
					{tags && tags.length > 0 && (
						<Field>
							<Label>{t('Tags')}</Label>
							<Info>
								{tags.map((tag) => (
									<Box key={tag} mie='x4' display='inline'>
										<Tag style={{ display: 'inline' }} disabled>
											{tag}
										</Tag>
									</Box>
								))}
							</Info>
						</Field>
					)}
					{topic && (
						<Field>
							<Label>{t('Topic')}</Label>
							<Info>{topic}</Info>
						</Field>
					)}
					{queueStartedAt && (
						<Field>
							<Label>{t('Queue_Time')}</Label>
							{servedBy ? (
								<Info>{moment(servedBy.ts).from(moment(queueStartedAt), true)}</Info>
							) : (
								<Info>{moment(queueStartedAt).fromNow(true)}</Info>
							)}
						</Field>
					)}
					{closedAt && (
						<Field>
							<Label>{t('Chat_Duration')}</Label>
							<Info>{moment(closedAt).from(moment(ts), true)}</Info>
						</Field>
					)}
					{ts && (
						<Field>
							<Label>{t('Created_at')}</Label>
							<Info>{formatDateAndTime(ts)}</Info>
						</Field>
					)}
					{closedAt && (
						<Field>
							<Label>{t('Closed_At')}</Label>
							<Info>{formatDateAndTime(closedAt)}</Info>
						</Field>
					)}
					{servedBy?.ts && (
						<Field>
							<Label>{t('Taken_at')}</Label>
							<Info>{formatDateAndTime(servedBy.ts)}</Info>
						</Field>
					)}
					{metrics?.response?.avg && formatDuration(metrics.response.avg) && (
						<Field>
							<Label>{t('Avg_response_time')}</Label>
							<Info>{formatDuration(metrics.response.avg)}</Info>
						</Field>
					)}
					{!waitingResponse && responseBy?.lastMessageTs && (
						<Field>
							<Label>{t('Inactivity_Time')}</Label>
							<Info>{moment(responseBy.lastMessageTs).fromNow(true)}</Info>
						</Field>
					)}
					{canViewCustomFields && customFieldEntries.map(([key, value]) => <CustomField key={key} id={key} value={value} />)}
					{slaId && <SlaField id={slaId} />}
					{priorityId && <PriorityField id={priorityId} />}
				</Margins>
			</VerticalBar.ScrollableContent>
			<VerticalBar.Footer>
				<ButtonGroup stretch>
					<Button onClick={onEditClick}>
						<Icon name='pencil' size='x20' /> {t('Edit')}
					</Button>
				</ButtonGroup>
			</VerticalBar.Footer>
		</>
	);
}

export default ChatInfo;
