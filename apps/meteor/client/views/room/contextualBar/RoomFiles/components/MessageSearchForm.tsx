import { Box, Field, Icon, TextInput } from '@rocket.chat/fuselage';
// import { useDebouncedCallback, useMutableCallback, useUniqueId } from '@rocket.chat/fuselage-hooks';
import { useDebouncedCallback, useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

type MessageSearchFormProps = {
	onSearch: (params: { searchText: string; globalSearch: boolean }) => void;
};

const MessageSearchForm = ({ onSearch }: MessageSearchFormProps) => {
	const { handleSubmit, register, setFocus, control } = useForm({
		defaultValues: {
			searchText: '',
		},
	});

	useEffect(() => {
		setFocus('searchText');
	}, [setFocus]);

	const debouncedOnSearch = useDebouncedCallback(useMutableCallback(onSearch), 300);

	const submitHandler = handleSubmit(({ searchText }) => {
		debouncedOnSearch.cancel();
		onSearch({ searchText });
	});

	const searchText = useWatch({ control, name: 'searchText' });

	useEffect(() => {
		debouncedOnSearch({ searchText });
	}, [debouncedOnSearch, searchText]);

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
				</Field>
			</Box>
		</Box>
	);
};

export default MessageSearchForm;
