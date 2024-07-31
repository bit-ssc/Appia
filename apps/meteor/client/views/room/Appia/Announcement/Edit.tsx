import type { IRoomAnnouncement } from '@rocket.chat/core-typings';
import { Box, Button, Modal } from '@rocket.chat/fuselage';
import React, { useEffect, useRef, useState } from 'react';

import { APIClient, t } from '../../../../../app/utils/client';
import FileIcon from '../../../../components/FileIcon';
import VerticalBar from '../../../../components/VerticalBar';
import { useEndpointActionExperimental } from '../../../../hooks/useEndpointActionExperimental';
import { dispatchToastMessage } from '../../../../lib/toast';
import { headerStyles } from './appia-style';

export interface IFileInfo {
	fileName: string;
	fileUrl: string;
	fileType: string;
}

const Edit: React.FC<{
	announcement?: IRoomAnnouncement;
	rid: string;
	onClose: () => void;
}> = ({ announcement, rid, onClose }) => {
	const saveAction = useEndpointActionExperimental('POST', 'v1/rooms.saveRoomSettings');
	const textRef = useRef<HTMLTextAreaElement>();

	const [submitting, setSubmitting] = useState(false);

	const [fileInfos, setFileInfos] = useState(announcement?.files ?? []);
	const [currentFileName, setCurrentFileName] = useState('');
	const [cancelUploadFiles, setCancelUploadFiles] = useState<string[]>();

	// @ts-ignore
	const onSelectFile = (e: MouseEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();
		const $input = $(document.createElement('input'));

		$input.css('display', 'none');
		$input.attr({
			type: 'file',
			accept:
				'image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.slideshow,application/vnd.openxmlformats-officedocument.presentationml.presentation',
		});
		$input.one('change', async (e) => {
			if (e.target?.files?.length) {
				const file = e.target.files[0];
				const data = {
					file,
				};

				if (!cancelUploadFiles?.includes(file.name)) {
					let newArr = cancelUploadFiles ? [...cancelUploadFiles] : [];
					newArr = newArr.filter((item) => item !== file.name);
					setCancelUploadFiles(newArr);
				}
				setCurrentFileName(file.name);

				const fileUrl = await new Promise((resolve, reject) => {
					const xhr = APIClient.upload(`v1/admin/file/upload/announcement.bot`, data, {});
					xhr.onreadystatechange = function () {
						if (this.readyState === 4 && this.status === 200) {
							try {
								const res = JSON.parse(this.responseText);

								resolve(res.url.replace(new RegExp('/file-upload'), '/file-proxy'));
							} catch (e) {
								reject(e);
							}
						}
					};
				});

				setCurrentFileName('');

				if (!cancelUploadFiles?.includes(file.name)) {
					const newFileInfos = [...fileInfos, { fileName: file.name, fileUrl }];
					setFileInfos(newFileInfos);
				}
			}
			$input.remove();
		});

		$(document.body).append($input);
		$input.click();
	};

	const onCancelUpload = () => {
		const newArr = cancelUploadFiles ? [...cancelUploadFiles] : [];
		newArr.push(currentFileName);
		setCancelUploadFiles(newArr);
		setCurrentFileName('');
	};

	const onCancel = (e: MouseEvent, fileUrl: string) => {
		e.preventDefault();
		e.stopPropagation();

		const index = fileInfos.findIndex((a) => a.fileUrl === fileUrl);
		const newFileInfos = [...fileInfos];
		newFileInfos.splice(index, 1);
		setFileInfos(newFileInfos);
	};

	const isBlank = (str: string) => {
		return !str || /^\s*$/.test(str);
	};

	const onSubmit = async () => {
		// @ts-ignore
		const text = textRef.current?.value || '';

		setSubmitting(true);
		try {
			let message = text;

			if (isBlank(message)) {
				message = '';
			}

			if (message.length === 0 && fileInfos.length === 0) {
				dispatchToastMessage({ type: 'info', message: '公告不能为空' });
				return;
			}

			const roomAnnouncementData = {
				...(announcement && { _id: announcement._id }),
				message,
				files: fileInfos,
			};

			await saveAction({
				rid,
				// @ts-ignore
				roomAnnouncementData,
			});
		} finally {
			setSubmitting(false);
			onClose();
		}
	};

	useEffect(() => {
		if (textRef.current) {
			const input = textRef.current;
			input.focus();
			input.value = ''; // 先清空输入值
			input.value = input.defaultValue; // 然后重新设置默认值
		}
	}, []);

	return (
		<Modal width='50%' height='50%' minWidth='x720' padding={0} className={headerStyles}>
			<VerticalBar.Content paddingInline={24} paddingBlockStart={24}>
				<div className='title'>{t('Announcement_New')}</div>
				<textarea
					placeholder={'公告'}
					style={{ width: '100%', flex: 1, resize: 'none', border: '1px solid #dcdcdc', borderRadius: '4px' }}
					defaultValue={announcement?.message ?? ''}
					ref={textRef}
				/>
			</VerticalBar.Content>

			<Box display='flex' justifyContent='center' flexDirection='column' paddingInline={24}>
				<Box display='flex' flexDirection='row' flexWrap='wrap' margin='10px 0 0 0'>
					{fileInfos.map((element) => (
						<Box display='flex' flexGrow={1} alignItems='center' margin='0 0 5px 0' style={{ cursor: 'pointer', width: '100%' }}>
							<FileIcon fileName={element.fileName} fontSize={20} style={{ flexShrink: 0 }} />
							<Box flexGrow={1} color='#5297FF' textAlign='left' margin=' 0 10px'>
								{element.fileName}
							</Box>
							<Box onClick={(e) => onCancel(e, element.fileUrl)}>x</Box>
						</Box>
					))}
				</Box>
				<Button
					display='flex'
					disabled={currentFileName !== ''}
					h='32px'
					w='112px'
					alignItems='center'
					justifyContent='center'
					onClick={onSelectFile}
					style={{ borderWidth: '1px', marginTop: '10px' }}
					bg='#fff'
				>
					<svg style={{ margin: '0 5px 0 0' }} width='17' height='16' viewBox='0 0 17 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
						<path
							d='M4.23759 6.6778L8.00118 2.91421L8.0012 11.5L9.0012 11.5L9.00118 2.91422L12.7648 6.6778L13.4719 5.97069L8.85473 1.35355C8.65947 1.15829 8.34289 1.15829 8.14762 1.35355L3.53048 5.9707L4.23759 6.6778Z'
							fill={currentFileName !== '' ? '#dddddd' : 'black'}
							fillOpacity='0.9'
						/>
						<path
							d='M2.5 11V13C2.5 13.5523 2.94772 14 3.5 14H13.5C14.0523 14 14.5 13.5523 14.5 13V11H13.5V13H3.5V11H2.5Z'
							fill={currentFileName !== '' ? '#dddddd' : 'black'}
							fillOpacity='0.9'
						/>
					</svg>
					上传
				</Button>
				{currentFileName === '' ? null : (
					<Box display='flex' flexDirection='row' margin='10px 0 0 0' alignItems='center' justifyContent='center'>
						<Box>{currentFileName}</Box>
						<Box color='#2878FF' margin='0 0 0 10px'>
							上传中
						</Box>
						<Box display='flex' alignItems='center' justifyContent='center' onClick={onCancelUpload} margin='0 0 0 10px' bg='#fff'>
							<svg width='15' height='14' viewBox='0 0 15 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
								<path
									d='M14.5 7C14.5 3.13401 11.366 1.18292e-06 7.5 0C3.63401 -2.14186e-06 0.500001 3.134 0.5 7C0.499998 10.866 3.634 14 7.5 14C11.366 14 14.5 10.866 14.5 7ZM5.17091 3.94754L7.50001 6.29075L9.82912 3.94754L10.5384 4.65251L8.20499 7L10.5383 9.34749L9.82911 10.0525L7.50001 7.70925L5.17092 10.0525L4.46168 9.34749L6.79503 7L4.46167 4.65251L5.17091 3.94754Z'
									fill='black'
									fill-opacity='0.26'
								/>
							</svg>
						</Box>
					</Box>
				)}
			</Box>
			<Box display='flex' flexDirection='row' paddingBlock={12} paddingInline={24}>
				<Button flexGrow={1} margin='0 10px 0 0' width='120px' bg='#fff' style={{ borderWidth: '1px' }} onClick={onClose}>
					取消
				</Button>
				<Button primary width='120px' flexGrow={1} onClick={onSubmit} disabled={submitting}>
					发布
				</Button>
			</Box>
		</Modal>
	);
};

export default Edit;
