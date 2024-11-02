import { useEffect } from 'react';

import { Notifications } from '../../../../app/notifications/client';
import type { NotificationEvent } from '../../../../app/ui/client/lib/KonchatNotification';
import { useNotification } from '../../../providers/NotificationProvider';

export const useOnNotification = () => {
	const notificationContext = useNotification();
	const { updateNotification, updateShow } = notificationContext;

	useEffect(() => {
		Notifications.onUser('notification', (notification: NotificationEvent) => {
			console.log('dxd========notification', notification);
			if (!notification?.payload) return;

			const { message } = notification.payload;
			if (!message || message.msgType !== 'meeting_room') return;

			const msgData = JSON.parse(message.msgData || '');
			if (!(msgData && (msgData.extraData?.action !== 'begin_info' || msgData.extraData?.action !== 'pota_warning'))) return;
			updateNotification(message);
			updateShow(true);
		});
	}, []);
};
