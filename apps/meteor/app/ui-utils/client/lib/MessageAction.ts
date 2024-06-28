import type { ComponentProps, ContextType } from 'react';
import mem from 'mem';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import type { Icon } from '@rocket.chat/fuselage';
import type { IMessage, IUser, ISubscription, IRoom, SettingValue, Serialized, ITranslatedMessage } from '@rocket.chat/core-typings';
import type { TranslationKey } from '@rocket.chat/ui-contexts';

import { Messages, ChatRoom, Subscriptions } from '../../../models/client';
import { roomCoordinator } from '../../../../client/lib/rooms/roomCoordinator';
import type { ToolboxContextValue } from '../../../../client/views/room/contexts/ToolboxContext';
import type { ChatContext } from '../../../../client/views/room/contexts/ChatContext';
import { APIClient } from '../../../utils/client';
import type { AutoTranslateOptions } from '../../../../client/views/room/MessageList/hooks/useAutoTranslate';

const getMessage = async (msgId: string): Promise<Serialized<IMessage> | null> => {
	try {
		const { message } = await APIClient.get('/v1/chat.getMessage', { msgId });
		return message;
	} catch {
		return null;
	}
};

type MessageActionGroup = 'message' | 'menu';
export type MessageActionContext =
	| 'message'
	| 'threads'
	| 'message-mobile'
	| 'pinned'
	| 'direct'
	| 'starred'
	| 'mentions'
	| 'federated'
	| 'videoconf'
	| 'search';

type MessageActionConditionProps = {
	message: IMessage;
	user: IUser | undefined;
	room: IRoom;
	subscription?: ISubscription;
	context?: MessageActionContext;
	settings: { [key: string]: SettingValue };
	chat: ContextType<typeof ChatContext>;
};

export type MessageActionConfig = {
	id: string;
	icon: ComponentProps<typeof Icon>['name'] | 'forward' | any;
	variant?: 'danger' | 'success' | 'warning';
	label: TranslationKey;
	order?: number;
	/* @deprecated */
	color?: string;
	role?: string;
	group?: MessageActionGroup | MessageActionGroup[];
	context?: MessageActionContext[];
	action: (
		e: Pick<Event, 'preventDefault' | 'stopPropagation'>,
		{
			message,
			tabbar,
			room,
			chat,
			autoTranslateOptions,
		}: {
			message?: IMessage & Partial<ITranslatedMessage>;
			tabbar: ToolboxContextValue;
			room?: IRoom;
			chat: ContextType<typeof ChatContext>;
			autoTranslateOptions?: AutoTranslateOptions;
		},
	) => any;
	condition?: (props: MessageActionConditionProps) => Promise<boolean> | boolean;
};

type MessageActionConfigList = MessageActionConfig[];

export const MessageAction = new (class {
	/*
  	config expects the following keys (only id is mandatory):
  		id (mandatory)
  		icon: string
  		label: string
  		action: function(event, instance)
  		condition: function(message)
			order: integer
			group: string (message or menu)
   */

	buttons = new ReactiveVar<Record<string, MessageActionConfig>>({});

	addButton(config: MessageActionConfig): void {
		if (!config?.id) {
			return;
		}

		if (!config.group) {
			config.group = 'menu';
		}

		if (config.condition) {
			config.condition = mem(config.condition, { maxAge: 1000, cacheKey: JSON.stringify });
		}

		return Tracker.nonreactive(() => {
			const btns = this.buttons.get();
			btns[config.id] = config;
			mem.clear(this._getButtons);
			mem.clear(this.getButtonsByGroup);
			return this.buttons.set(btns);
		});
	}

	removeButton(id: MessageActionConfig['id']): void {
		return Tracker.nonreactive(() => {
			const btns = this.buttons.get();
			delete btns[id];
			return this.buttons.set(btns);
		});
	}

	updateButton(id: MessageActionConfig['id'], config: MessageActionConfig): void {
		return Tracker.nonreactive(() => {
			const btns = this.buttons.get();
			if (btns[id]) {
				btns[id] = Object.assign(btns[id], config);
				return this.buttons.set(btns);
			}
		});
	}

	getButtonById(id: MessageActionConfig['id']): MessageActionConfig | undefined {
		const allButtons = this.buttons.get();
		return allButtons[id];
	}

	_getButtons = mem((): MessageActionConfigList => Object.values(this.buttons.get()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), {
		maxAge: 1000,
	});

	async getButtonsByCondition(
		prop: MessageActionConditionProps,
		arr: MessageActionConfigList = MessageAction._getButtons(),
	): Promise<MessageActionConfigList> {
		return (
			await Promise.all(
				arr.map(async (button) => {
					return [button, !button.condition || (await button.condition(prop))] as const;
				}),
			)
		)
			.filter(([, condition]) => condition)
			.map(([button]) => button);
	}

	getButtonsByGroup = mem(
		function (group: MessageActionGroup, arr: MessageActionConfigList = MessageAction._getButtons()): MessageActionConfigList {
			return arr.filter((button) => !button.group || (Array.isArray(button.group) ? button.group.includes(group) : button.group === group));
		},
		{ maxAge: 1000 },
	);

	getButtonsByContext(context: MessageActionContext, arr: MessageActionConfigList): MessageActionConfigList {
		return !context ? arr : arr.filter((button) => !button.context || button.context.includes(context));
	}

	async getButtons(
		props: MessageActionConditionProps,
		context: MessageActionContext,
		group: MessageActionGroup,
	): Promise<MessageActionConfigList> {
		const allButtons = group ? this.getButtonsByGroup(group) : MessageAction._getButtons();

		if (props.message) {
			return this.getButtonsByCondition({ ...props, context }, this.getButtonsByContext(context, allButtons));
		}
		return allButtons;
	}

	resetButtons(): void {
		mem.clear(this._getButtons);
		mem.clear(this.getButtonsByGroup);
		return this.buttons.set({});
	}

	async getPermaLink(msgId: string): Promise<string> {
		if (!msgId) {
			throw new Error('invalid-parameter');
		}

		const msg = Messages.findOne(msgId) || (await getMessage(msgId));
		if (!msg) {
			throw new Error('message-not-found');
		}
		const roomData = ChatRoom.findOne({
			_id: msg.rid,
		});

		if (!roomData) {
			throw new Error('room-not-found');
		}

		const subData = Subscriptions.findOne({ 'rid': roomData._id, 'u._id': Meteor.userId() });
		const roomURL = roomCoordinator.getURL(roomData.t, { ...(subData || roomData), tab: '' });
		return `${roomURL}?msg=${msgId}`;
	}
})();
