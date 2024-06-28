import { Box, ButtonGroup, Callout, Chip, Margins } from '@rocket.chat/fuselage';
import { ExternalLink } from '@rocket.chat/ui-client';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React from 'react';

import AppDetailsAPIs from './AppDetailsAPIs';
import ScreenshotCarouselAnchor from '../../../components/ScreenshotCarouselAnchor';
import type { AppInfo } from '../../../definitions/AppInfo';

const AppDetails = ({ app }: { app: AppInfo }): ReactElement => {
	const t = useTranslation();
	const {
		author: { homepage, support },
		detailedDescription,
		description,
		categories = [],
		screenshots,
		apis,
		documentationUrl,
	} = app;

	const isMarkdown = detailedDescription && Object.keys(detailedDescription).length !== 0 && detailedDescription.rendered;
	const isCarouselVisible = screenshots && Boolean(screenshots.length);

	return (
		<Box maxWidth='x640' w='full' marginInline='auto' color='default'>
			{app.licenseValidation && (
				<>
					{Object.entries(app.licenseValidation.warnings).map(([key]) => (
						<Callout key={key} type='warning'>
							{t(`Apps_License_Message_${key}` as TranslationKey)}
						</Callout>
					))}

					{Object.entries(app.licenseValidation.errors).map(([key]) => (
						<Callout key={key} type='danger'>
							{t(`Apps_License_Message_${key}` as TranslationKey)}
						</Callout>
					))}
				</>
			)}

			<Box display='flex' flexDirection='column'>
				<Margins block='x17'>
					{isCarouselVisible && <ScreenshotCarouselAnchor screenshots={screenshots} />}

					<Box is='section'>
						<Box fontScale='h4' mbe='x8' color='titles-labels'>
							{t('Description')}
						</Box>
						<Box dangerouslySetInnerHTML={{ __html: isMarkdown ? detailedDescription.rendered : description }} withRichContent />
					</Box>

					<Box is='section'>
						<Box fontScale='h4' mbe='x8' color='titles-labels'>
							{t('Categories')}
						</Box>
						<ButtonGroup flexWrap='wrap'>
							{categories?.map((current) => (
								<Chip key={current} textTransform='uppercase'>
									{current}
								</Chip>
							))}
						</ButtonGroup>
					</Box>

					<Box is='section'>
						<Box fontScale='h4' mbe='x8'>
							{t('Contact')}
						</Box>
						<Box display='flex' flexDirection='row' flexGrow={1} justifyContent='space-around' flexWrap='wrap' mbe='x24'>
							<Box display='flex' flexDirection='column' mie='x12' flexGrow={1}>
								<Box fontScale='h4' color='hint'>
									{t('Author_Site')}
								</Box>
								<ExternalLink to={homepage} />
							</Box>
							<Box display='flex' flexDirection='column' flexGrow={1}>
								<Box fontScale='h4' color='hint'>
									{t('Support')}
								</Box>
								<ExternalLink to={support} />
							</Box>
						</Box>
						{documentationUrl && (
							<>
								<Box fontScale='h4' color='hint'>
									{t('Documentation')}
								</Box>
								<ExternalLink to={documentationUrl} />
							</>
						)}
					</Box>

					{apis?.length ? (
						<Box is='section'>
							<AppDetailsAPIs apis={apis || []} />
						</Box>
					) : null}
				</Margins>
			</Box>
		</Box>
	);
};

export default AppDetails;
