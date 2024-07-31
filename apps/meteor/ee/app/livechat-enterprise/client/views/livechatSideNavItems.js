import { registerOmnichannelSidebarItem } from '../../../../../client/views/omnichannel/sidebarItems';
import { hasPermission, hasAtLeastOnePermission } from '../../../../../app/authorization/client';

registerOmnichannelSidebarItem({
	href: 'omnichannel-monitors',
	i18nLabel: 'Livechat_Monitors',
	permissionGranted: () => hasPermission('manage-livechat-monitors'),
});

registerOmnichannelSidebarItem({
	href: 'omnichannel/units',
	i18nLabel: 'Units',
	permissionGranted: () => hasPermission('manage-livechat-units'),
});

registerOmnichannelSidebarItem({
	href: 'omnichannel-canned-responses',
	i18nLabel: 'Canned_Responses',
	permissionGranted: () => hasPermission('manage-livechat-canned-responses'),
});

registerOmnichannelSidebarItem({
	href: 'omnichannel/tags',
	i18nLabel: 'Tags',
	permissionGranted: () => hasPermission('manage-livechat-tags'),
});

registerOmnichannelSidebarItem({
	href: 'omnichannel/sla-policies',
	i18nLabel: 'SLA_Policies',
	permissionGranted: () => hasAtLeastOnePermission('manage-livechat-sla'),
});

registerOmnichannelSidebarItem({
	href: 'omnichannel/priorities',
	i18nLabel: 'Priorities',
	permissionGranted: () => hasAtLeastOnePermission('manage-livechat-priorities'),
});
