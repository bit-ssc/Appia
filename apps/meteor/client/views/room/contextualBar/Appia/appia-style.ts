import { css } from '@rocket.chat/css-in-js';

export const appiaSearchMessagesStyle = css`
	background-color：rgb(245, 245, 245);
	height: 100%;

	.rocket-search {
		display: flex;
		flex: 1;

		padding: 0 !important;
	}

	.rocket-search-tab {
		display: flex;
		flex-direction: column;
		flex: 1;

		padding-top: 8px;
	}

	.rocket-default-search-results {
		/* overflow: auto; */
		overflow-x: hidden;
		overflow-y: auto;
	}

	.rocket-search-result {
		display: flex;
		overflow-x: hidden;
		flex-direction: column;
		flex: 1 1 0;
	}

	.rocket-search-result-new {
		display: flex;
		flex-direction: column;

		height: calc(85vh - 50px);
	}

	.rocket-default-search-settings {
		padding-bottom: 20px;
	}

	.rocket-default-search-results .list .message {
		padding-right: 8px !important;
		padding-left: 70px !important;
	}

	.rocket-search-error {
		padding: 0 24px;
	}

	.rocket-default-search-results .js-list {
		overflow: scroll;
	}

	#rocket-search-suggestions {
		position: absolute;
		z-index: 1000;
		top: 58px;

		right: 24px;
		left: 24px;

		padding: 10px 0;

		border-radius: 0;

		background-color: white;

		box-shadow: 0 1px 10px #aaaaaa;
	}

	.rocket-search-suggestion-item {
		width: 100%;

		cursor: pointer;
	}

	.rocket-search-suggestion-item.active,
	.rocket-search-suggestion-item:hover {
		color: white;
		background-color: var(--button-primary-background);
	}

	.rocket-search-tabs {
		width: 100%;
		height: 100%;
	}

	.rocket-search-tab-list {
		display: flex;
		flex-direction: row;
		flex: 1;
	}

	.rocket-search-icon {
		height: 40px;
	}

	.rocket-search-tablist {
		display: flex;
		flex-direction: row;
		flex: 1;

		height: 40px;

		border-bottom: 1px solid #c7c8c9;
		align-items: center;
	}

	.rocket-search-tab-list-item {
		width: max-content;
		min-width: 80px;
		height: 39px;

		cursor: pointer;
		text-align: center;

		line-height: 39px;
		align-items: center;
		justify-content: center;
	}

	.rocket-search-tab-list-item.selected {
		color: #2878ff;
		border-bottom: 1px solid #2878ff;
	}

	.rocket-search-tab-pannel {
		width: 100%;
		height: 100%;


		.rcx-vertical-bar__content {
			padding: 0 !important;
		}
	}

	.rocket-search-tab-panel-item {
		width: 100%;
		height: 100%;
	}

	.rocket-search-tab-panel-item-metion {
		width: 100%;
		height: 100%;
		padding-top: 16px;
	}

	.rocket-search-file-list {
		width: 100%;
		height: calc(100% - 50px);
	}

	.rocket-search-media-item {
		aspect-ratio: 1.78;
	}

	.rocket-search-media-list {
		overflow-x: hidden;
		overflow-y: auto;

		height: calc(100% - 80px);
		margin-top: 10px;
		margin-bottom: 5px;
	}

	.rocket-search-media-list-center {
		overflow-x: hidden;
	}

	.rocket-search-media-image {
		width: 100%;
		height: 100%;
		padding: 5px;
		object-fit: cover;
	}

	.rocket-search-media-bg {
		display: flex;

		width: 100%;
		height: 100%;
		padding: 5px;

		background-color: black;
		background-clip: content-box;
		align-items: center;
		justify-content: center;
	}

	.rcx-message {
		padding-right: 0;
		padding-left: 0;
	}
`;
