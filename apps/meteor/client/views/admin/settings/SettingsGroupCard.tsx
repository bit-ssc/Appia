import type { ISetting } from '@rocket.chat/core-typings';
import { css } from '@rocket.chat/css-in-js';
import { Button, Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { Card } from '@rocket.chat/ui-client';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useRoute, useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import MarkdownText from '../../../components/MarkdownText';

const clampStyle = css`
	display: -webkit-box;
	overflow: hidden;
	-webkit-line-clamp: 5;
	-webkit-box-orient: vertical;
`;

type SettingsGroupCardProps = {
	id: ISetting['_id'];
	title: TranslationKey;
	description?: TranslationKey;
};

const SettingsGroupCard = ({ id, title, description }: SettingsGroupCardProps): ReactElement => {
	const t = useTranslation();
	const router = useRoute('admin-settings');

	const handleOpenGroup = useMutableCallback(() => {
		if (id) {
			router.push({
				group: id,
			});
		}
	});

	return (
		<Card data-qa-id={id}>
			<Card.Title>{t(title)}</Card.Title>
			<Card.Body height='x88'>
				<Box className={clampStyle}>
					{description && t.has(description) && <MarkdownText variant='inlineWithoutBreaks' content={t(description)} />}
				</Box>
			</Card.Body>
			<Card.Footer>
				<Button onClick={handleOpenGroup}>{t('Open')}</Button>
			</Card.Footer>
		</Card>
	);
};

export default SettingsGroupCard;
