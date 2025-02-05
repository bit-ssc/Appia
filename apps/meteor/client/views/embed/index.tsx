import { Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetModal, useRoute, useSetting } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import qs from 'qs';
import React, { useEffect, useMemo } from 'react';

import FilePreview from '/client/components/message/Attachments/FilePreview';
import { useMediaUrl } from '/client/components/message/Attachments/context/AttachmentContext';
import { ChatRoom, Subscriptions } from '/app/models';

const Embed: React.FC = () => {
	const directRoute = useRoute('direct');
	const groupRoute = useRoute('group');
	const channelRoute = useRoute('channel');
	const shimoWebUrl = useSetting('Shimo_Web_Url') as string;
	const setModal = useSetModal();
	const closeModal = useMutableCallback(() => setModal());
	const getURL = useMediaUrl();

	useEffect(() => {
		const handleMessage = (e: MessageEvent<string>): void => {
			if (!e.origin.includes('appia.cn')) {
				return;
			}

			const goToGroupMessage = (t: string, rid: string, mid: string) => {
				const roomData = ChatRoom.findOne({
					_id: rid,
				});

				if (!roomData) {
					throw new Error('room-not-found');
				}

				const subData = Subscriptions.findOne({ 'rid': roomData._id, 'u._id': Meteor.userId() });
				if (t === 'p') {
					groupRoute.push({ name: roomData.name || subData.name }, { msg: mid });
				}
				if (t === 'c') {
					channelRoute.push({ name: roomData.name || subData.name }, { msg: mid });
				}
			};

			const goToMessage = async (t: string, rid: string, mid: string) => {
				if (t === 'd') {
					return directRoute.push({ rid }, { msg: mid });
				}
				goToGroupMessage(t, rid, mid);
			};
			9;

			const msg = e.data;
			if (msg && msg.type === 'service') {
				directRoute.push({
					rid: msg.name,
				});
			}

			if (msg && msg.type === 'preViewFile') {
				const { url, title } = msg;
				// setModal(<FilePreview url={getURL(url)} fileName={title} fileSize={1024} onClose={closeModal} />);
				window.location.href = getURL(url);
			}

			if (msg && msg.type === 'goToMessage') {
				const { t, rid, mid } = msg;
				goToMessage(t, rid, mid);
			}
		};

		window.addEventListener('message', handleMessage);

		return (): void => {
			window.removeEventListener('message', handleMessage);
		};
	}, [directRoute, groupRoute, channelRoute]);

	const urlStr = qs.parse(window.location.search, {
		ignoreQueryPrefix: true,
	}).url;

	const url = useMemo(() => {
		const temp = new URL(decodeURIComponent(urlStr), window.location.href);
		temp.searchParams.set('v', Date.now());
		return temp;
	}, [urlStr]);

	if (!urlStr) {
		return null;
	}

	if (!/^https?:$/i.test(url.protocol) || !(urlStr.includes(shimoWebUrl) || url.host === window.location.host)) {
		return null;
	}

	return <Box is='iframe' w='100%' h='100%' border='none' src={url.toString()} />;
};

export default Embed;
