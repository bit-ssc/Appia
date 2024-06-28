import type { IOmnichannelRoom } from '@rocket.chat/core-typings';
import { Field, Button, TextInput, Modal, Box } from '@rocket.chat/fuselage';
import { useAutoFocus } from '@rocket.chat/fuselage-hooks';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { useCallback, useEffect, useState, useMemo } from 'react';

import { useComponentDidUpdate } from '../../../hooks/useComponentDidUpdate';
import { useForm } from '../../../hooks/useForm';

type TranscriptModalProps = {
	email: string;
	room: IOmnichannelRoom;
	onRequest: (email: string, subject: string) => void;
	onSend?: (email: string, subject: string, token: string) => void;
	onCancel: () => void;
	onDiscard: () => void;
};

const TranscriptModal: FC<TranscriptModalProps> = ({
	email: emailDefault = '',
	room,
	onRequest,
	onSend,
	onCancel,
	onDiscard,
	...props
}) => {
	const t = useTranslation();

	const inputRef = useAutoFocus<HTMLInputElement>(true);

	const { values, handlers } = useForm({
		email: emailDefault || '',
		subject: t('Transcript_of_your_livechat_conversation'),
	});

	const { email, subject } = values as { email: string; subject: string };
	const { handleEmail, handleSubject } = handlers;
	const [emailError, setEmailError] = useState('');
	const [subjectError, setSubjectError] = useState('');
	const { transcriptRequest } = room;
	const roomOpen = room?.open;
	const token = room?.v?.token;

	const handleRequest = useCallback(() => {
		onRequest(email, subject);
	}, [email, onRequest, subject]);

	const handleSend = useCallback(
		(e) => {
			e.preventDefault();
			onSend && token && onSend(email, subject, token);
		},
		[email, onSend, subject, token],
	);

	const handleDiscard = useCallback(() => onDiscard(), [onDiscard]);

	useComponentDidUpdate(() => {
		setEmailError(!email ? t('The_field_is_required', t('Email')) : '');
	}, [t, email]);

	useComponentDidUpdate(() => {
		setSubjectError(!subject ? t('The_field_is_required', t('Subject')) : '');
	}, [t, subject]);

	const canSave = useMemo(() => !!subject, [subject]);

	useEffect(() => {
		if (transcriptRequest) {
			handleEmail(transcriptRequest.email);
			handleSubject(transcriptRequest.subject);
		}
	});

	return (
		<Modal wrapperFunction={(props) => <Box is='form' onSubmit={handleSend} {...props} />} {...props}>
			<Modal.Header>
				<Modal.Icon name='mail-arrow-top-right' />
				<Modal.Title>{t('Transcript')}</Modal.Title>
				<Modal.Close onClick={onCancel} />
			</Modal.Header>
			<Modal.Content fontScale='p2'>
				{!!transcriptRequest && <p>{t('Livechat_transcript_already_requested_warning')}</p>}
				<Field marginBlock='x15'>
					<Field.Label>{t('Email')}*</Field.Label>
					<Field.Row>
						<TextInput
							disabled={!!emailDefault || !!transcriptRequest}
							error={emailError}
							flexGrow={1}
							value={email}
							onChange={handleEmail}
						/>
					</Field.Row>
					<Field.Error>{emailError}</Field.Error>
				</Field>
				<Field marginBlock='x15'>
					<Field.Label>{t('Subject')}*</Field.Label>
					<Field.Row>
						<TextInput
							ref={inputRef}
							disabled={!!transcriptRequest}
							error={subjectError}
							flexGrow={1}
							value={subject}
							onChange={handleSubject}
						/>
					</Field.Row>
					<Field.Error>{subjectError}</Field.Error>
				</Field>
			</Modal.Content>
			<Modal.Footer>
				<Modal.FooterControllers>
					<Button onClick={onCancel}>{t('Cancel')}</Button>
					{roomOpen && transcriptRequest && (
						<Button danger onClick={handleDiscard}>
							{t('Undo_request')}
						</Button>
					)}
					{roomOpen && !transcriptRequest && (
						<Button disabled={!canSave} primary onClick={handleRequest}>
							{t('Request')}
						</Button>
					)}
					{!roomOpen && (
						<Button disabled={!canSave} primary type='submit'>
							{t('Send')}
						</Button>
					)}
				</Modal.FooterControllers>
			</Modal.Footer>
		</Modal>
	);
};

export default TranscriptModal;
