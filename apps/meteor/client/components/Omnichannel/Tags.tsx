import { Field, TextInput, Chip, Button } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useEndpoint, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import type { ChangeEvent, ReactElement } from 'react';
import React, { useState } from 'react';

import { FormSkeleton } from './Skeleton';
import { useFormsSubscription } from '../../views/omnichannel/additionalForms';

const Tags = ({
	tags = [],
	handler,
	error,
	tagRequired,
}: {
	tags?: string[];
	handler: (value: string[]) => void;
	error?: string;
	tagRequired?: boolean;
}): ReactElement => {
	const t = useTranslation();
	const forms = useFormsSubscription() as any;

	// TODO: Refactor the formsSubscription to use components instead of hooks (since the only thing the hook does is return a component)
	const { useCurrentChatTags } = forms;
	// Conditional hook was required since the whole formSubscription uses hooks in an incorrect manner
	const EETagsComponent = useCurrentChatTags?.();

	const getTags = useEndpoint('GET', '/v1/livechat/tags');
	const { data: tagsResult, isInitialLoading } = useQuery(['/v1/livechat/tags'], () => getTags({ text: '' }), {
		enabled: Boolean(EETagsComponent),
	});

	const dispatchToastMessage = useToastMessageDispatch();

	const [tagValue, handleTagValue] = useState('');
	const [paginatedTagValue, handlePaginatedTagValue] = useState<{ label: string; value: string }[]>();

	const removeTag = (tagToRemove: string): void => {
		if (tags) {
			const tagsFiltered = tags.filter((tag: string) => tag !== tagToRemove);
			handler(tagsFiltered);
		}
	};

	const handleTagTextSubmit = useMutableCallback(() => {
		if (!tags) {
			return;
		}

		if (!tagValue || tagValue.trim() === '') {
			dispatchToastMessage({ type: 'error', message: t('Enter_a_tag') });
			handleTagValue('');
			return;
		}

		if (tags.includes(tagValue)) {
			dispatchToastMessage({ type: 'error', message: t('Tag_already_exists') });
			return;
		}
		handler([...tags, tagValue]);
		handleTagValue('');
	});

	if (isInitialLoading) {
		return <FormSkeleton />;
	}

	return (
		<>
			<Field.Label required={tagRequired} mb='x4'>
				{t('Tags')}
			</Field.Label>

			{EETagsComponent && tagsResult?.tags && tagsResult?.tags.length ? (
				<Field.Row>
					<EETagsComponent
						value={paginatedTagValue}
						handler={(tags: { label: string; value: string }[]): void => {
							handler(tags.map((tag) => tag.label));
							handlePaginatedTagValue(tags);
						}}
					/>
				</Field.Row>
			) : (
				<>
					<Field.Row>
						<TextInput
							error={error}
							value={tagValue}
							onChange={({ currentTarget }: ChangeEvent<HTMLInputElement>): void => handleTagValue(currentTarget.value)}
							flexGrow={1}
							placeholder={t('Enter_a_tag')}
						/>
						<Button disabled={!tagValue} mis='x8' title={t('Add')} onClick={handleTagTextSubmit}>
							{t('Add')}
						</Button>
					</Field.Row>

					<Field.Row justifyContent='flex-start'>
						{tags?.map((tag, i) => (
							<Chip key={i} onClick={(): void => removeTag(tag)} mie='x8'>
								{tag}
							</Chip>
						))}
					</Field.Row>
				</>
			)}
		</>
	);
};

export default Tags;
