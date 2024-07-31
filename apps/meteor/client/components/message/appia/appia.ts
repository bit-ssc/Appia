import type { IMessage } from '@rocket.chat/core-typings';

import type { IMsgData, IMentionType } from './IAppia';
import { renderMessageBody } from '../../../lib/utils/renderMessageBody';
import './appia.css';

const renders = {
	approval: (msg: IMessage): string => {
		try {
			const msgData = JSON.parse(msg.msgData as string) as IMsgData;

			return `
				<div class="appia-approval-wrapper ${msgData?.linkInfo?.url && 'appia-approval-hover'}">
					<div class="appia-approval-header">
						${msgData.title}
					</div>
					<div class="appia-approval-body">
						${msgData.textList
							.map(
								({ label, value }) => `
								<div class="appia-approval-item">
									<div class="appia-approval-item-label">${label}</div>
									<div class="appia-approval-item-value">${value}</div>
								</div>
						`,
							)
							.join('')}
					</div>
					${
						msgData?.linkInfo?.url
							? `
								<div class="appia-approval-footer">
									<a href="${msgData.linkInfo.url}" target="_blank" rel="nofollow">${msgData.linkInfo.name}</a>
								</div>
							`
							: ''
					}
				</div>
		`;
		} catch (e) {
			return renderMessageBody(msg);
		}
	},
	/*
	udeskMsg: (msg: IMessage) => {
		const data = JSON.parse(msg.msgData as string) as IUdeskMsg;

		console.log(data);
		if (data.assign_type === 'urobot') {
			return `
				<div class="udisk-robot-wrapper">
					<div class="udisk-robot-content">${msg.msg}</div>
					<div class="udisk-robot-actions">
						<div class="udisk-robot-action js-action-useful" data-useful="0"><span>有用</span></div>
						<div class="udisk-robot-action js-action-useful" data-useful="1"><span>没用</span></div>
					</div>
				</div>
			`;
		}

		return `
			<div class="body color-primary-font-color bm-msg">
				${msg.msg}
			</div>
		`;
	},
	*/
	mentionType: (msg: IMessage): string => {
		const data = JSON.parse(msg.msgData as string) as IMentionType;

		return `
			${data.content ? `<div style="padding: 0 0 5px">${data.content}</div>` : ``}
			<button type="button" class="rcx-box rcx-box--full appia-mention-wrapper rcx-box--animated rcx-button--small rcx-button--primary rcx-button">
				${data.buttonText}
			</button>
		`;
	},
};

type IMsgType = keyof typeof renders;

export const renderAwppia = (msg: IMessage): string => {
	const render = renders[msg.msgType as IMsgType];

	if (render) {
		return render(msg);
	}

	return renderMessageBody(msg);
};
