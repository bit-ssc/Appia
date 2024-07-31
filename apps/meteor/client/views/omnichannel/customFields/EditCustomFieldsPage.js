import { Box, Button, Icon, ButtonGroup, FieldGroup } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useToastMessageDispatch, useRoute, useMethod, useTranslation } from '@rocket.chat/ui-contexts';
import React, { useCallback, useState } from 'react';

import CustomFieldsForm from './CustomFieldsForm';
import Page from '../../../components/Page';
import { useForm } from '../../../hooks/useForm';
import { useFormsSubscription } from '../additionalForms';

const getInitialValues = (cf) => ({
	id: cf._id,
	field: cf._id,
	label: cf.label,
	scope: cf.scope,
	visibility: cf.visibility === 'visible',
	searchable: !!cf.searchable,
	regexp: cf.regexp,
});

const EditCustomFieldsPage = ({ customField, id, reload }) => {
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const [additionalValues, setAdditionalValues] = useState({});

	const { useCustomFieldsAdditionalForm = () => {} } = useFormsSubscription();
	const AdditionalForm = useCustomFieldsAdditionalForm();

	const router = useRoute('omnichannel-customfields');

	const handleReturn = useCallback(() => {
		router.push({});
	}, [router]);

	const { values, handlers, hasUnsavedChanges } = useForm(getInitialValues(customField));

	const save = useMethod('livechat:saveCustomField');

	const { hasError, data: additionalData, hasUnsavedChanges: additionalFormChanged } = additionalValues;

	const { label, field } = values;

	const canSave = !hasError && label && field && (additionalFormChanged || hasUnsavedChanges);

	const handleSave = useMutableCallback(async () => {
		try {
			await save(id, {
				...additionalData,
				...values,
				visibility: values.visibility ? 'visible' : 'hidden',
			});

			dispatchToastMessage({ type: 'success', message: t('Saved') });
			reload();
			router.push({});
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	});

	const handleAdditionalForm = useMutableCallback((val) => {
		setAdditionalValues({ ...additionalValues, ...val });
	});

	return (
		<Page>
			<Page.Header title={t('Edit_Custom_Field')}>
				<ButtonGroup align='end'>
					<Button onClick={handleReturn}>
						<Icon size='x16' name='back' />
						{t('Back')}
					</Button>
					<Button data-qa-id='BtnSaveEditCustomFieldsPage' primary onClick={handleSave} disabled={!canSave}>
						{t('Save')}
					</Button>
				</ButtonGroup>
			</Page.Header>
			<Page.ScrollableContentWithShadow>
				<Box maxWidth='x600' w='full' alignSelf='center'>
					<FieldGroup>
						<CustomFieldsForm values={values} handlers={handlers} />
						{AdditionalForm && <AdditionalForm onChange={handleAdditionalForm} state={values} data={customField} />}
					</FieldGroup>
				</Box>
			</Page.ScrollableContentWithShadow>
		</Page>
	);
};

export default EditCustomFieldsPage;
