import { Emitter } from '@rocket.chat/emitter';
import type { ReactElement } from 'react';
import React, { lazy } from 'react';

const ConnectionStatusBar = lazy(() => import('../components/connectionStatus/ConnectionStatusBar'));
// const BannerRegion = lazy(() => import('../views/banners/BannerRegion'));
const PortalsWrapper = lazy(() => import('../views/root/PortalsWrapper'));
const ModalRegion = lazy(() => import('../views/modal/ModalRegion'));

type AppLayoutDescriptor = ReactElement | null;

class AppLayoutSubscription extends Emitter<{ update: void }> {
	private descriptor: AppLayoutDescriptor = null;

	getSnapshot = (): AppLayoutDescriptor => this.descriptor;

	subscribe = (onStoreChange: () => void): (() => void) => this.on('update', onStoreChange);

	setCurrentValue(descriptor: AppLayoutDescriptor): void {
		this.descriptor = descriptor;
		this.emit('update');
	}

	render(element: ReactElement): void {
		this.setCurrentValue(
			<>
				<ConnectionStatusBar />
				{/**
				<BannerRegion />
				 */}
				{element}
				<PortalsWrapper />
				<ModalRegion />
			</>,
		);
	}

	renderStandalone(element: ReactElement): void {
		this.setCurrentValue(element);
	}
}

export const appLayout = new AppLayoutSubscription();
