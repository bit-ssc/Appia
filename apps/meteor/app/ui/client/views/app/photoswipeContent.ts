import { Meteor } from 'meteor/meteor';
/*
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { escapeHTML } from '@rocket.chat/string-helpers';
import type PhotoSwipe from 'photoswipe';
import type PhotoSwipeUiDefault from 'photoswipe/dist/photoswipe-ui-default';
*/
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';
import 'viewerjs/dist/viewer.js';

/* const createViewer =
	(className: string) =>
	(event: JQuery.ClickEvent): void => {
		event.preventDefault();
		event.stopPropagation();

		// const { currentTarget } = event;
		// const index = Array.from(document.querySelectorAll(className)).indexOf(currentTarget);
		// const viewer = new Viewer(document.getElementById('messages-list') as HTMLElement, {
		// 	navbar: false,
		// 	initialViewIndex: index,
		// 	// zoomRatio: 0.2,
		// 	url(image: HTMLElement) {
		// 		return image.dataset.src;
		// 	},
		// 	hidden() {
		// 		viewer.destroy();
		// 	},
		// });
		// viewer.show();
	};

Meteor.startup(() => {
	$(document).on('click', '.gallery-item', createViewer('.gallery-item'));
});
 */