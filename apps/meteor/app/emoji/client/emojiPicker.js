import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { escapeRegExp } from '@rocket.chat/string-helpers';

import { t } from '../../utils/client';
import { EmojiPicker } from './lib/EmojiPicker';
import { emoji } from '../lib/rocketchat';
import { withThrottling } from '../../../lib/utils/highOrderFunctions';
import { baseURI } from '../../../client/lib/baseURI';
import './emojiPicker.html';

const ESCAPE = 27;

const emojiListByCategory = new ReactiveDict('emojiList');

const getEmojiElement = (emoji, image) =>
	image && `<li class="emoji-${emoji} emoji-picker-item" data-emoji="${emoji}" title="${emoji}">${image}</li>`;

// used as a function so `t` can use the user's language correctly when called
const loadMoreLink = () => `<li class="emoji-picker-load-more"><a href="#load-more">${t('Load_more')}</a></li>`;

let customItems = 90;

const baseUrlFix = () => `${baseURI}${FlowRouter.current().path.substring(1)}`;

const isMozillaFirefoxBelowVersion = (upperVersion) => {
	const [, version] = navigator.userAgent.match(/Firefox\/(\d+)\.\d/) || [];
	return parseInt(version, 10) < upperVersion;
};

const isGoogleChromeBelowVersion = (upperVersion) => {
	const [, version] = navigator.userAgent.match(/Chrome\/(\d+)\.\d/) || [];
	return parseInt(version, 10) < upperVersion;
};

const isBaseUrlFixNeeded = () => isMozillaFirefoxBelowVersion(55) || isGoogleChromeBelowVersion(55);

const createEmojiList = (category, actualTone, limit = null) => {
	const html =
		Object.values(emoji.packages)
			.map((emojiPackage) => {
				if (!emojiPackage.emojisByCategory || !emojiPackage.emojisByCategory[category]) {
					return;
				}

				const result = [];

				const total = emojiPackage.emojisByCategory[category].length;

				const listTotal = limit ? Math.min(limit, total) : total;

				for (let i = 0; i < listTotal; i++) {
					const current = emojiPackage.emojisByCategory[category][i];

					const tone = actualTone > 0 && emojiPackage.toneList.hasOwnProperty(current) ? `_tone${actualTone}` : '';
					result.push(getEmojiElement(current, emojiPackage.renderPicker(`:${current}${tone}:`)));
				}

				if (limit > 0 && total > limit) {
					result.push(loadMoreLink());
				}

				return result.join('');
			})
			.join('') || `<li>${t('No_emojis_found')}</li>`;

	return html;
};

export function updateRecentEmoji(category) {
	emojiListByCategory.set(category, createEmojiList(category, null, category === 'rocket' ? customItems : null));
}

const createPickerEmojis = (instance) => {
	const categories = instance.categoriesList;
	const actualTone = instance.tone;

	categories.forEach((category) =>
		emojiListByCategory.set(category.key, createEmojiList(category.key, actualTone, category.key === 'rocket' ? customItems : null)),
	);
};

function getEmojisBySearchTerm(searchTerm, limit) {
	let html = '<ul class="emoji-list">';
	const actualTone = Template.instance().tone;

	EmojiPicker.currentCategory.set('');

	const searchRegExp = new RegExp(escapeRegExp(searchTerm.replace(/:/g, '')), 'i');

	let totalFound = 0;

	for (let current in emoji.list) {
		if (!emoji.list.hasOwnProperty(current)) {
			continue;
		}

		if (searchRegExp.test(current)) {
			const emojiObject = emoji.list[current];
			const { emojiPackage, shortnames = [] } = emojiObject;
			let tone = '';
			current = current.replace(/:/g, '');
			const alias = shortnames[0] !== undefined ? shortnames[0].replace(/:/g, '') : shortnames[0];

			if (actualTone > 0 && emoji.packages[emojiPackage].toneList.hasOwnProperty(emoji)) {
				tone = `_tone${actualTone}`;
			}

			let emojiFound = false;

			for (const key in emoji.packages[emojiPackage].emojisByCategory) {
				if (emoji.packages[emojiPackage].emojisByCategory.hasOwnProperty(key)) {
					const contents = emoji.packages[emojiPackage].emojisByCategory[key];
					const searchValArray = alias !== undefined ? alias.replace(/:/g, '').split('_') : alias;
					if (contents.indexOf(current) !== -1 || (searchValArray !== undefined && searchValArray.includes(searchTerm))) {
						emojiFound = true;
						break;
					}
				}
			}

			if (emojiFound) {
				const image = emoji.packages[emojiPackage].renderPicker(`:${current}${tone}:`);
				html += getEmojiElement(current, image);
				totalFound++;
			}
		}

		if (totalFound >= limit) {
			html += loadMoreLink();
			break;
		}
	}
	html += '</ul>';

	return html;
}

Template.emojiPicker.helpers({
	emojiCategories() {
		return Template.instance().categoriesList;
	},
	emojiByCategory(category) {
		let emojisByCategory = [];
		for (const emojiPackage in emoji.packages) {
			if (emoji.packages.hasOwnProperty(emojiPackage)) {
				if (emoji.packages[emojiPackage].emojisByCategory.hasOwnProperty(category)) {
					emojisByCategory = emojisByCategory.concat(emoji.packages[emojiPackage].emojisByCategory[category]);
				}
			}
		}
		return emojisByCategory;
	},
	searching() {
		return Template.instance().currentSearchTerm.get().length > 0;
	},
	searchResults() {
		return getEmojisBySearchTerm(Template.instance().currentSearchTerm.get(), Template.instance().searchTermItems.get());
	},
	emojiList() {
		emojiListByCategory.all();

		return (category) => {
			return emojiListByCategory.get(category);
		};
	},
	currentTone() {
		return `tone-${Template.instance().tone}`;
	},
	/**
	 * Returns true if a given emoji category is active
	 *
	 * @param {string} category hash
	 * @return {boolean} true if active, false otherwise
	 */
	activeCategory(category) {
		return EmojiPicker.currentCategory.get() === category ? 'active' : '';
	},
	/**
	 * Returns currently active emoji category hash
	 *
	 * @return {string} category hash
	 */
	currentCategory() {
		return EmojiPicker.currentCategory.get();
	},
	baseUrl: isBaseUrlFixNeeded() ? baseUrlFix : undefined,
});

Template.emojiPicker.events({
	'click .emoji-picker'(event) {
		event.stopPropagation();
		event.preventDefault();
	},
	'click .add-custom'(event) {
		event.stopPropagation();
		event.preventDefault();
		FlowRouter.go('/admin/emoji-custom/new');
		EmojiPicker.close();
	},
	'click .category-link'(event) {
		event.stopPropagation();
		event.preventDefault();

		EmojiPicker.showCategory(event.currentTarget.hash.substr(1));

		return false;
	},
	'scroll .emojis': withThrottling({ wait: 300 })((event, instance) => {
		if (EmojiPicker.scrollingToCategory) {
			return;
		}

		const container = instance.$(event.currentTarget);
		const scrollTop = container.scrollTop() + 8;

		const last = EmojiPicker.getCategoryPositions()
			.filter((pos) => pos.top <= scrollTop)
			.pop();

		if (!last) {
			return;
		}

		const { el } = last;

		const category = el.id.replace('emoji-list-category-', '');

		EmojiPicker.currentCategory.set(category);
	}),
	'click .change-tone > a'(event, instance) {
		event.stopPropagation();
		event.preventDefault();

		instance.$('.tone-selector').toggleClass('show');
	},
	'click .emoji-picker-load-more > a'(event, instance) {
		event.stopPropagation();
		event.preventDefault();

		if (instance.currentSearchTerm.get().length > 0) {
			instance.searchTermItems.set(instance.searchTermItems.get() + 90);
			return;
		}

		customItems += 90;
		emojiListByCategory.set('rocket', createEmojiList('rocket', null, customItems));
	},
	'click .tone-selector .tone'(event, instance) {
		event.stopPropagation();
		event.preventDefault();

		const tone = parseInt(event.currentTarget.dataset.tone);
		let newTone;

		if (tone > 0) {
			newTone = `_tone${tone}`;
		} else {
			newTone = '';
		}

		for (const emojiPackage in emoji.packages) {
			if (emoji.packages.hasOwnProperty(emojiPackage)) {
				if (emoji.packages[emojiPackage].hasOwnProperty('toneList')) {
					for (const _emoji in emoji.packages[emojiPackage].toneList) {
						if (emoji.packages[emojiPackage].toneList.hasOwnProperty(_emoji)) {
							$(`.emoji-${_emoji}`).html(emoji.packages[emojiPackage].render(`:${_emoji}${newTone}:`));
						}
					}
				}
			}
		}

		EmojiPicker.setTone(tone);

		instance.setCurrentTone(tone);

		$('.tone-selector').toggleClass('show');
	},
	'click .emoji-list .emoji-picker-item'(event, instance) {
		event.stopPropagation();

		const _emoji = event.currentTarget.dataset.emoji;
		const actualTone = instance.tone;
		let tone = '';

		for (const emojiPackage in emoji.packages) {
			if (emoji.packages.hasOwnProperty(emojiPackage)) {
				if (actualTone > 0 && emoji.packages[emojiPackage].toneList.hasOwnProperty(_emoji)) {
					tone = `_tone${actualTone}`;
				}
			}
		}

		const input = $('.emoji-picker .js-emojipicker-search');
		if (input) {
			input.val('');
		}
		instance.currentSearchTerm.set('');
		instance.searchTermItems.set(90);

		EmojiPicker.pickEmoji(_emoji + tone);
	},
	'keyup .js-emojipicker-search, change .js-emojipicker-search'(event, instance) {
		event.preventDefault();
		event.stopPropagation();

		if (event.keyCode === ESCAPE) {
			return EmojiPicker.close();
		}

		const value = event.target.value.trim();
		const cst = instance.currentSearchTerm;
		if (value === cst.get()) {
			return;
		}
		cst.set(value);
	},
});

Template.emojiPicker.onCreated(function () {
	this.tone = EmojiPicker.getTone();
	const recent = EmojiPicker.getRecent();

	this.currentSearchTerm = new ReactiveVar('');
	this.searchTermItems = new ReactiveVar(90);

	this.categoriesList = [];
	for (const emojiPackage in emoji.packages) {
		if (emoji.packages.hasOwnProperty(emojiPackage)) {
			if (emoji.packages[emojiPackage].emojiCategories) {
				if (typeof emoji.packages[emojiPackage].categoryIndex !== 'undefined') {
					this.categoriesList.splice(emoji.packages[emojiPackage].categoryIndex, 0, ...emoji.packages[emojiPackage].emojiCategories);
				} else {
					this.categoriesList = this.categoriesList.concat(emoji.packages[emojiPackage].emojiCategories);
				}
			}
		}
	}

	recent.forEach((_emoji) => {
		emoji.packages.base.emojisByCategory.recent.push(_emoji);
	});

	this.setCurrentTone = (newTone) => {
		$('.current-tone').removeClass(`tone-${this.tone}`);
		$('.current-tone').addClass(`tone-${newTone}`);
		this.tone = newTone;
	};

	createPickerEmojis(this);
});
