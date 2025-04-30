import Editor from '@appia/editor';
import type { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { Modal, Box, Field, FieldGroup, TextInput, Button } from '@rocket.chat/fuselage';
import { useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import React, { memo, useEffect, useState, useMemo, useRef } from 'react';
import type { ReactElement, ChangeEvent, FormEventHandler, ComponentProps } from 'react';

import type { ChatAPI } from '../../../../lib/chats/ChatAPI';
import { formatMentionsStr } from '../../components/body/composer/messageBox/helper';
import { useEditor } from '../../components/body/composer/messageBox/hooks/useEditor';
import FilePreview from './FilePreview';
import { css } from '@rocket.chat/css-in-js';
import { covertStr } from '../../../../../app/ui-message/client/messageBox/createComposerAPI';

type FileUploadModalProps = {
	onClose: () => void;
	onSubmit: (name: string, description?: string, json: unknown) => void;
	file: File;
	fileName: string;
	fileDescription?: string;
	invalidContentType: boolean;
	showDescription?: boolean;
	resend?: boolean;
	room?: IRoom;
	chat?: ChatAPI;
};
const editorStyle = css``;

const FileUploadModal = ({
	onClose,
	file,
	fileName,
	fileDescription,
	onSubmit,
	invalidContentType,
	showDescription = true,
	resend,
	room,
}: FileUploadModalProps): ReactElement => {
	const [name, setName] = useState<string>(fileName);
	const editorRef = useRef();
	const editorWrapperRef = useRef();
	const contentRef = useRef({ md: '', html: '', json: [] });
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();
	const anchorElementContainerRef = useRef();

	const parentRef = useRef(null);

	const handleName = (e: ChangeEvent<HTMLInputElement>): void => {
		setName(e.currentTarget.value);
	};

	const handleSubmit: FormEventHandler<HTMLFormElement> = (e): void => {
		e.preventDefault();
		if (!name) {
			return dispatchToastMessage({
				type: 'error',
				message: t('error-the-field-is-required', { field: t('Name') }),
			});
		}

		onSubmit(name, formatMentionsStr(contentRef.current), contentRef.current.json);
	};
	const editorProps = useEditor(handleSubmit, room, { editorRef, wrapperRef: editorWrapperRef });

	useEffect(() => {
		if (invalidContentType) {
			dispatchToastMessage({
				type: 'error',
				message: t('FileUpload_MediaType_NotAccepted__type__', { type: file.type }),
			});
			onClose();
			return;
		}

		if (file.size === 0) {
			dispatchToastMessage({
				type: 'error',
				message: t('FileUpload_File_Empty'),
			});
			onClose();
		}
	}, [file, dispatchToastMessage, invalidContentType, t, onClose]);

	const contentValue = useMemo(() => ({ value: covertStr(fileDescription) }), [fileDescription]);

	useEffect(() => {
		setTimeout(() => {
			editorRef.current?.setContent(contentValue.value);
		}, 100);
	}, [contentValue]);

	useEffect(() => {
		const observer = new ResizeObserver(() => {
			if (editorWrapperRef.current) {
				if (parentRef.current) {
					const editorRect = editorWrapperRef.current.getBoundingClientRect();
					const parentRect = parentRef.current.getBoundingClientRect();

					anchorElementContainerRef.current.style.width = `${editorRect.width}px`;
					anchorElementContainerRef.current.style.top = `${editorRect.top - parentRect.top}px`;
					anchorElementContainerRef.current.style.left = `${editorRect.left - parentRect.left}px`;
				}
			}
		});

		if (editorWrapperRef.current) {
			observer.observe(editorWrapperRef.current);
		}

		if (parentRef.current) {
			observer.observe(parentRef.current);
		}

		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<Modal
			wrapperFunction={(props: ComponentProps<typeof Box>) => (
				<Box is='form' onSubmit={handleSubmit} ref={parentRef} position='relative' {...props} />
			)}
		>
			<Box display='flex' flexDirection='column' height='100%'>
				<Modal.Header>
					<Modal.Title>{t(resend ? 'ResendFile' : 'Upload_File')}</Modal.Title>
					<Modal.Close onClick={onClose} />
				</Modal.Header>
				<Modal.Content>
					<Box display='flex' maxHeight='x360' w='full' justifyContent='center' alignContent='center' mbe='x16'>
						<FilePreview file={file} />
					</Box>
					<FieldGroup>
						<Field>
							<Field.Label>{t('Upload_file_name')}</Field.Label>
							<Field.Row>
								<TextInput value={name} onChange={handleName} disabled={resend} />
							</Field.Row>
							{!name && <Field.Error>{t('Upload_file_name_prompt')}</Field.Error>}
						</Field>
						{showDescription && (
							<Field>
								<Field.Label>{t('Upload_file_description')}</Field.Label>
								<Field.Row style={{ position: 'relative' }}>
									<Box w='100%' ref={editorWrapperRef} className={editorStyle}>
										<Editor
											{...editorProps}
											ref={editorRef}
											autoFocus={false}
											// content={contentValue}
											onChange={(value) => {
												contentRef.current = {
													md: value.md,
													html: value.html,
													json: value.json,
												};
											}}
											placeholder={<div style={{ color: 'rgba(158, 162, 168, 0.5)' }}>{t('Upload_file_description_prompt')}</div>}
											style={{ minHeight: '100px' }}
											anchorElementContainer={anchorElementContainerRef}
										/>
									</Box>
								</Field.Row>
							</Field>
						)}
					</FieldGroup>
				</Modal.Content>
				<Modal.Footer>
					<Modal.FooterControllers>
						<Button secondary onClick={onClose}>
							{t('Cancel')}
						</Button>
						<Button primary type='submit' disabled={!name}>
							{t('Send')}
						</Button>
					</Modal.FooterControllers>
				</Modal.Footer>
			</Box>
			<Box
				ref={anchorElementContainerRef}
				style={{
					position: 'absolute',
					zIndex: 1,
				}}
			/>
		</Modal>
	);
};

export default memo(FileUploadModal);
