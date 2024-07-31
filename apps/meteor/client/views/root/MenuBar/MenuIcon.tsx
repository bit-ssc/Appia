import { Meteor } from 'meteor/meteor';
import type { ReactElement } from 'react';
import React from 'react';

import { settings } from '../../../../app/settings/client';
import {
	ChatIcon,
	ChatActiveIcon,
	ChannelIcon,
	ChannelActiveIcon,
	ContactIcon,
	ContactActiveIcon,
	DocumentIcon,
	DocumentActiveIcon,
	MeIcon,
	MeActiveIcon,
	WorkspaceIcon,
	WorkspaceActiveIcon,
} from '../../../components/AppiaIcon';

const icons = {
	normal: { chat: ChatIcon, channel: ChannelIcon, contact: ContactIcon, document: DocumentIcon, me: MeIcon, workspace: WorkspaceIcon },
	active: {
		chat: ChatActiveIcon,
		channel: ChannelActiveIcon,
		contact: ContactActiveIcon,
		document: DocumentActiveIcon,
		me: MeActiveIcon,
		workspace: WorkspaceActiveIcon,
	},
};

type IconNameType = 'chat' | 'channel' | 'contact' | 'workspace' | 'document' | 'me';

export const getIconByName = (name: IconNameType, active: boolean): ReactElement => {
	// const language = Meteor._localStorage.getItem('userLanguage');
	// const langIcons = language === 'en' ? icons.en : icons.zh;
	const values = active ? icons.active : icons.normal;
	const Icon = values[name];
	return <Icon />;
};

export const getMenuNameByType = (name: 'chat' | 'channel' | 'contact' | 'workspace' | 'document' | 'me'): React.ReactElement => {
	const menuBarNames = (settings.get('Appia_Menu_bar_Names') as string) || '{}';
	const language = Meteor._localStorage.getItem('userLanguage');
	const menuBarNamesJson = JSON.parse(menuBarNames);
	let lang = !language ? 'zh' : language;
	lang = lang.startsWith('zh') ? 'zh' : 'en';
	// @ts-ignore
	const menuBarNamesLang = menuBarNamesJson[lang];
	return menuBarNamesLang[name];
};
