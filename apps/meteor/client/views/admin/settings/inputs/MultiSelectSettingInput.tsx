import { Field, Flex, Box, MultiSelectFiltered, MultiSelect } from '@rocket.chat/fuselage';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import ResetSettingButton from '../ResetSettingButton';

export type valuesOption = { key: string; i18nLabel: TranslationKey };
type MultiSelectSettingInputProps = {
	_id: string;
	label: string;
	value?: [string, string];
	values: valuesOption[];
	placeholder?: string;
	readonly?: boolean;
	autocomplete?: boolean;
	disabled?: boolean;
	hasResetButton?: boolean;
	onChangeValue?: (value: string[]) => void;
	onResetButtonClick?: () => void;
};

function MultiSelectSettingInput({
	_id,
	label,
	value,
	placeholder,
	readonly,
	disabled,
	values = [],
	hasResetButton,
	onChangeValue,
	onResetButtonClick,
	autocomplete,
}: MultiSelectSettingInputProps): ReactElement {
	const t = useTranslation();

	const handleChange = (value: string[]): void => {
		onChangeValue?.(value);
		// onChangeValue && onChangeValue([...event.currentTarget.querySelectorAll('option')].filter((e) => e.selected).map((el) => el.value));
	};
	const Component = autocomplete ? MultiSelectFiltered : MultiSelect;
	return (
		<>
			<Flex.Container>
				<Box>
					<Field.Label htmlFor={_id} title={_id}>
						{label}
					</Field.Label>
					{hasResetButton && <ResetSettingButton data-qa-reset-setting-id={_id} onClick={onResetButtonClick} />}
				</Box>
			</Flex.Container>
			<Component
				data-qa-setting-id={_id}
				id={_id}
				value={value}
				placeholder={placeholder}
				disabled={disabled}
				readOnly={readonly}
				// autoComplete={autocomplete === false ? 'off' : undefined}
				onChange={handleChange}
				options={values.map(({ key, i18nLabel }) => [key, t(i18nLabel)])}
			/>
		</>
	);
}

export default MultiSelectSettingInput;
