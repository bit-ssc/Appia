import type { IUIActionButton, IUActionButtonWhen } from '@rocket.chat/apps-engine/definition/ui/IUIActionButtonDescriptor';
import type { UserStatus } from '@rocket.chat/core-typings';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import type { Icon } from '@rocket.chat/fuselage';
import type { ComponentProps } from 'react';

import { applyDropdownActionButtonFilters } from '../../../ui-message/client/actionButtons/lib/applyButtonFilters';
import { APIClient } from '../../../utils/client';

export interface IAppAccountBoxItem extends IUIActionButton {
	name: string;
	icon?: string;
	href?: string;
	sideNav?: string;
	isAppButtonItem?: boolean;
	subItems?: [IAppAccountBoxItem];
	when?: Omit<IUActionButtonWhen, 'roomTypes' | 'messageActionContext'>;
}

export type AccountBoxItem = {
	name: TranslationKey;
	icon: ComponentProps<typeof Icon>['name'];
	href: string;
	sideNav?: string;
	condition: () => boolean;
};

export const isAppAccountBoxItem = (item: IAppAccountBoxItem | AccountBoxItem): item is IAppAccountBoxItem => 'isAppButtonItem' in item;

class AccountBoxBase {
	private items = new ReactiveVar<IAppAccountBoxItem[]>([]);

	public setStatus(status: UserStatus, statusText?: string): any {
		return APIClient.post('/v1/users.setStatus', { status, message: statusText });
	}

	public async addItem(newItem: IAppAccountBoxItem): Promise<void> {
		Tracker.nonreactive(() => {
			const actual = this.items.get();
			actual.push(newItem);
			this.items.set(actual);
		});
	}

	public async deleteItem(item: IAppAccountBoxItem): Promise<void> {
		Tracker.nonreactive(() => {
			const actual = this.items.get();
			const itemIndex = actual.findIndex((actualItem: IAppAccountBoxItem) => actualItem.appId === item.appId);
			actual.splice(itemIndex, 1);
			this.items.set(actual);
		});
	}

	public getItems(): (IAppAccountBoxItem | AccountBoxItem)[] {
		return this.items.get().filter((item: IAppAccountBoxItem | AccountBoxItem) => {
			if ('condition' in item) {
				return item.condition();
			}

			return applyDropdownActionButtonFilters(item);
		});
	}
}

export const AccountBox = new AccountBoxBase();
