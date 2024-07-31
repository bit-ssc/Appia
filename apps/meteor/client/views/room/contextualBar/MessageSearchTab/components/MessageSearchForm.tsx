import type { IMessageSearchProvider } from '@rocket.chat/core-typings';
// import { Box, Field, Icon, TextInput, ToggleSwitch } from '@rocket.chat/fuselage';
import { Box, Field, Icon, TextInput } from '@rocket.chat/fuselage';
// import { useDebouncedCallback, useMutableCallback, useUniqueId } from '@rocket.chat/fuselage-hooks';
import { useDebouncedCallback, useMutableCallback } from '@rocket.chat/fuselage-hooks';
// import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

type MessageSearchFormProps = {
	provider: IMessageSearchProvider;
	onSearch: (params: { searchText: string; globalSearch: boolean }) => void;
};

const MessageSearchForm = ({ onSearch }: MessageSearchFormProps) => {
	const { handleSubmit, register, setFocus, control } = useForm({
		defaultValues: {
			searchText: '',
			globalSearch: false,
		},
	});

	useEffect(() => {
		setFocus('searchText');
	}, [setFocus]);

	const debouncedOnSearch = useDebouncedCallback(useMutableCallback(onSearch), 300);

	const submitHandler = handleSubmit(({ searchText, globalSearch }) => {
		debouncedOnSearch.cancel();
		onSearch({ searchText, globalSearch });
	});

	const searchText = useWatch({ control, name: 'searchText' });
	const globalSearch = useWatch({ control, name: 'globalSearch' });

	useEffect(() => {
		debouncedOnSearch({ searchText, globalSearch });
	}, [debouncedOnSearch, searchText, globalSearch]);

	// const globalSearchEnabled = provider.settings.GlobalSearchEnabled;
	// const globalSearchToggleId = useUniqueId();

	const t = useTranslation();

	return (
		<Box
			display='flex'
			flexGrow={0}
			flexShrink={1}
			flexDirection='column'
			pb={12}
			borderBlockEndWidth={2}
			borderBlockEndStyle='solid'
			borderBlockEndColor='extra-light'
		>
			<Box is='form' onSubmit={submitHandler}>
				<Field>
					<Field.Row>
						<TextInput
							addon={<Icon name='magnifier' size='x20' />}
							placeholder={t('Search_Messages')}
							aria-label={t('Search_Messages')}
							autoComplete='off'
							{...register('searchText')}
						/>
					</Field.Row>
					{/**
					{provider.description && <Field.Hint dangerouslySetInnerHTML={{ __html: t(provider.description as TranslationKey) }} />}
					 */}
				</Field>
				{/**
				{globalSearchEnabled && (
					<Field>
						<Field.Row>
							<ToggleSwitch id={globalSearchToggleId} {...register('globalSearch')} />
							<Field.Label htmlFor={globalSearchToggleId}>{t('Global_Search')}</Field.Label>
						</Field.Row>
					</Field>
				)}
				 */}
			</Box>
		</Box>
	);
};

export default MessageSearchForm;
