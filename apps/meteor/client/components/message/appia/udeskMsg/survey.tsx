import type { IMessage } from '@rocket.chat/core-typings';
import { Button } from '@rocket.chat/fuselage';
import React, { useCallback, useState } from 'react';

import './styles.css';
import { APIClient } from '../../../../../app/utils/client';
import { dispatchToastMessage } from '../../../../lib/toast';
import RadioGroup from '../radio-group';
import { classNames } from '../utils';

interface IState {
	remark: string;
	resolved?: number;
	optionId: number;
	loading: boolean;
}

const options = [
	{
		label: '满意',
		value: 2012,
	},
	{
		label: '不满意',
		value: 2014,
	},
];

const defaultOption = 2012;

interface IPostStaffServiceSurveyData {
	im_sub_session_id: number;
	option_id: number;
	resolved_state_v2?: number;
	remark?: string;
}

export interface IProps {
	messageData: {
		im_sub_session_id: number;
	};
	msg: IMessage;
}

export const Survey: React.FC<IProps> = ({ messageData, msg }) => {
	const [state, setState] = useState<IState>({
		remark: '',
		optionId: defaultOption,
		loading: false,
	});

	return (
		<div className='udesk-survey-wrapper'>
			<div className='udesk-survey-title'>你对本服务的评价是？</div>
			<div className='udesk-survey-subtitle'>你的问题是否已经解决</div>
			<div className='udesk-survey-resolved-wrapper'>
				<div
					className={classNames('udesk-survey-resolved', state.resolved === 1 && 'udesk-survey-resolved-active')}
					onClick={useCallback(() => {
						setState((prevState) => ({
							...prevState,
							resolved: 1,
						}));
					}, [])}
				>
					<div className='udesk-survey-resolved-icon'>
						<svg width='1em' height='1em' viewBox='0 0 33 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M16.7501 29.3332C24.1139 29.3332 30.0834 23.3636 30.0834 15.9998C30.0834 8.63604 24.1139 2.6665 16.7501 2.6665C9.38628 2.6665 3.41675 8.63604 3.41675 15.9998C3.41675 23.3636 9.38628 29.3332 16.7501 29.3332Z'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinejoin='round'
							/>
							<path d='M21.4167 12V12.6667' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
							<path d='M12.0833 12V12.6667' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
							<path
								d='M21.4166 20.6665C21.4166 20.6665 20.0833 23.3332 16.7499 23.3332C13.4166 23.3332 12.0833 20.6665 12.0833 20.6665'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</div>
					<div className='udesk-survey-resolved-text'>已解决</div>
				</div>

				<div
					className={classNames('udesk-survey-resolved udesk-survey-unresolved', state.resolved === 2 && 'udesk-survey-resolved-active')}
					onClick={useCallback(() => {
						setState((prevState) => ({
							...prevState,
							resolved: 2,
						}));
					}, [])}
				>
					<div className='udesk-survey-resolved-icon'>
						<svg width='1em' height='1em' viewBox='0 0 33 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
							<path
								d='M16.2501 29.3332C23.6139 29.3332 29.5834 23.3636 29.5834 15.9998C29.5834 8.63604 23.6139 2.6665 16.2501 2.6665C8.88628 2.6665 2.91675 8.63604 2.91675 15.9998C2.91675 23.3636 8.88628 29.3332 16.2501 29.3332Z'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinejoin='round'
							/>
							<path d='M20.9167 12V12.6667' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
							<path d='M11.5833 12V12.6667' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
							<path
								d='M20.9166 20.6667C20.9166 20.6667 19.5833 18 16.2499 18C12.9166 18 11.5833 20.6667 11.5833 20.6667'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</div>
					<div className='udesk-survey-resolved-text'>未解决</div>
				</div>
			</div>

			<div className='udesk-survey-option-wrapper'>
				<RadioGroup<number>
					options={options}
					initValue={defaultOption}
					onChange={(value): void => {
						setState((prevState) => ({
							...prevState,
							optionId: value,
						}));
					}}
				/>
			</div>

			<div className='udesk-survey-textarea-wrapper'>
				<textarea
					rows={2}
					value={state.remark}
					placeholder='你可填写评价备注'
					onChange={useCallback((e) => {
						const remark = e.currentTarget.value;

						setState((prevState) => ({
							...prevState,
							remark,
						}));
					}, [])}
				/>
			</div>

			<div className='udesk-survey-btn-wrapper'>
				<Button
					primary
					small
					className='udesk-survey-btn'
					disabled={state.loading}
					onClick={async (): Promise<void> => {
						setState((prevState) => ({
							...prevState,
							loading: true,
						}));

						try {
							/* eslint-disable */
						const data: IPostStaffServiceSurveyData = {
							im_sub_session_id: messageData.im_sub_session_id,
							option_id: state.optionId,
						};

						if (state.resolved) {
							data.resolved_state_v2 = state.resolved;
						}

						if (state.remark) {
							data.remark = state.remark;
						}

						await APIClient.post('/v1/robot/staffService/survey', {
							message_id: msg._id,
							assign_type: 'agent',
							data,
						});
						dispatchToastMessage({ type: 'success', message: '评价成功' });
							/* eslint-enable */
						} finally {
							setState((prevState) => ({
								...prevState,
								loading: false,
							}));
						}
					}}
				>
					提交
				</Button>
			</div>
		</div>
	);
};
