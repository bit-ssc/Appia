import type { IRoom } from '@rocket.chat/core-typings';
import { Box, Button } from '@rocket.chat/fuselage';
import React, { useRef, useState } from 'react';

import { APIClient } from '../../../../../../app/utils/client';
import FileIcon from '../../../../../components/FileIcon';
import VerticalBar from '../../../../../components/VerticalBar';
// import { useToastMessageDispatch } from '../../../contexts/ToastMessagesContext';
import { useEndpointActionExperimental } from '../../../../../hooks/useEndpointActionExperimental';
import { useTabBarClose } from '../../../contexts/ToolboxContext';

const separator = '\u0001\u0002';

export interface IFileInfo {
	fileName: string;
	fileUrl: string;
}

const Edit: React.FC<{ room: IRoom; type: string; rid: string; onPreview: () => void; reload: () => Promise<void> }> = ({
	room,
	rid,
	onPreview,
	reload,
}) => {
	const onClickClose = useTabBarClose();
	// @ts-ignore
	// const dispatchToastMessage = useToastMessageDispatch();
	const [announcement, ...fileArr] = (room.announcement?.message || '').split(separator);
	const saveAction = useEndpointActionExperimental('POST', 'v1/rooms.saveRoomSettings', announcement || name ? '更新成功' : '添加成功');
	const textRef = useRef<HTMLTextAreaElement>();
	// const fileUrl = useRef<Promise<string>>(url);
	// const [fileName, setFileName] = useState(name);
	const [submitting, setSubmitting] = useState(false);
	const filesDefault: IFileInfo[] = [];
	for (let index = 0; index < fileArr.length; index++) {
		if (index + 1 === fileArr.length) {
			break;
		}
		const element1 = fileArr[index];
		const element2 = fileArr[index + 1];
		const eles: IFileInfo = { fileName: element1, fileUrl: element2 };
		filesDefault.push(eles);
		index++;
	}
	const [fileInfos, setFileInfos] = useState(filesDefault);
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

	const onSubmit = async () => {
		// @ts-ignore
		const text = textRef.current?.value || '';

		setSubmitting(true);
		try {
			let roomAnnouncement = text;
			if (fileInfos.length > 0) {
				const fileInfoTemp = fileInfos.map((element) => `${element.fileName.trimRight()}${separator}${element.fileUrl.trimRight()}`);
				roomAnnouncement = [text.trimRight(), fileInfoTemp.join(separator)].join(` ${separator}`);
			}

			await saveAction({
				rid,
				// @ts-ignore
				roomAnnouncement,
			});
			await reload();
			onPreview();
		} finally {
			setSubmitting(false);
		}
	};
	const picExts = ['.png', '.jpg', '.jpeg', '.gif', 'svg'];
	const pictures = fileInfos.filter((a) => picExts.some((b) => a.fileUrl.endsWith(b)));
	const files = fileInfos.filter((a) => !picExts.some((b) => a.fileUrl.endsWith(b)));
	return (
		<>
			<VerticalBar.Content p='x24'>
				<textarea
					placeholder={room.teamMain ? '群公告' : '频道公告'}
					style={{ maxHeight: '300px', border: 0, width: '100%', height: '90%', resize: 'none' }}
					rows={1}
					defaultValue={announcement}
					ref={textRef}
				/>
			</VerticalBar.Content>

			<VerticalBar.Footer p={0}>
				<Box display='flex' justifyContent='center' p='x24' flexDirection='column'>
					<Box display='flex' flexDirection='row' flexWrap='wrap'>
						{pictures.map((element) => (
							<Box
								margin='5px 5px 5px 0'
								width={100}
								height={100}
								textAlign='right'
								padding={5}
								style={{ background: `url(${element.fileUrl}) center center / cover no-repeat` }}
							>
								<svg
									onClick={(e) => onCancel(e, element.fileUrl)}
									style={{ cursor: 'pointer' }}
									width='17'
									height='16'
									viewBox='0 0 17 16'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M15.5 8C15.5 4.13401 12.366 1 8.5 1C4.63401 0.999998 1.5 4.134 1.5 8C1.5 11.866 4.634 15 8.5 15C12.366 15 15.5 11.866 15.5 8ZM6.17091 4.94754L8.50001 7.29075L10.8291 4.94754L11.5384 5.65251L9.20499 8L11.5383 10.3475L10.8291 11.0525L8.50001 8.70925L6.17092 11.0525L5.46168 10.3475L7.79503 8L5.46167 5.65251L6.17091 4.94754Z'
										fill='#E5E6EB'
									/>
								</svg>
							</Box>
						))}
					</Box>
					{files.map((element) => (
						<Box display='flex' flexGrow={1} alignItems='center' margin='0 0 5px 0' style={{ cursor: 'pointer', width: '100%' }}>
							<FileIcon fileName={element.fileName} fontSize={20} style={{ flexShrink: 0 }} />
							<Box flexGrow={1} color='#5297FF' textAlign='left' margin=' 0 10px'>
								{element.fileName}
							</Box>
							<Box onClick={(e) => onCancel(e, element.fileUrl)}>x</Box>
						</Box>
					))}
					<Button
						display='flex'
						disabled={currentFileName !== ''}
						h='32px'
						alignItems='center'
						justifyContent='center'
						onClick={onSelectFile}
						margin='0 10px 0 0'
						style={{ borderWidth: '1px' }}
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
				<Box display='flex' flexDirection='row' p='x24' style={{ borderTop: '1px solid #E5E6EB' }}>
					<Button flexGrow={1} margin='0 10px 0 0' bg='#fff' style={{ borderWidth: '1px' }} onClick={onClickClose}>
						取消
					</Button>
					<Button primary flexGrow={1} onClick={onSubmit} disabled={submitting}>
						发布
					</Button>
				</Box>
			</VerticalBar.Footer>
		</>
	);
};

export default Edit;
