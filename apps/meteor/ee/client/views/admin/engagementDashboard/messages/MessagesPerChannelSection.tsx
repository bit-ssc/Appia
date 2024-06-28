import { ResponsivePie } from '@nivo/pie';
import { Box, Flex, Icon, Margins, Skeleton, Table, Tile, Palette } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useMemo } from 'react';

import EngagementDashboardCardFilter from '../EngagementDashboardCardFilter';
import DownloadDataButton from '../dataView/DownloadDataButton';
import LegendSymbol from '../dataView/LegendSymbol';
import PeriodSelector from '../dataView/PeriodSelector';
import { usePeriodSelectorState } from '../dataView/usePeriodSelectorState';
import { useMessageOrigins } from './useMessageOrigins';
import { useTopFivePopularChannels } from './useTopFivePopularChannels';

const colors = {
	warning: Palette.statusColor['status-font-on-warning'].toString(),
	success: Palette.statusColor['status-font-on-success'].toString(),
	info: Palette.statusColor['status-font-on-info'].toString(),
};
const MessagesPerChannelSection = (): ReactElement => {
	const [period, periodSelectorProps] = usePeriodSelectorState('last 7 days', 'last 30 days', 'last 90 days');

	const t = useTranslation();

	const { data: messageOriginsData } = useMessageOrigins({ period });
	const { data: topFivePopularChannelsData } = useTopFivePopularChannels({ period });

	const pie = useMemo(
		() => messageOriginsData?.origins?.reduce<{ [roomType: string]: number }>((obj, { messages, t }) => ({ ...obj, [t]: messages }), {}),
		[messageOriginsData],
	);

	const table = useMemo(
		() =>
			topFivePopularChannelsData?.channels?.reduce<
				{
					i: number;
					t: string;
					name?: string;
					messages: number;
				}[]
			>((entries, { t, messages, name, usernames }, i) => [...entries, { i, t, name: name || usernames?.join(' × '), messages }], []),
		[topFivePopularChannelsData],
	);

	return (
		<>
			<EngagementDashboardCardFilter>
				<PeriodSelector {...periodSelectorProps} />
				<DownloadDataButton
					attachmentName={`MessagesPerChannelSection_start_${messageOriginsData?.start}_end_${messageOriginsData?.end}`}
					headers={['Room Type', 'Messages']}
					dataAvailable={!!messageOriginsData}
					dataExtractor={(): unknown[][] | undefined => messageOriginsData?.origins.map(({ t, messages }) => [t, messages])}
				/>
			</EngagementDashboardCardFilter>

			<Flex.Container>
				<Margins inline='neg-x12'>
					<Box>
						<Margins inline='x12'>
							<Flex.Item grow={1} shrink={0} basis='0'>
								<Box>
									<Flex.Container alignItems='center' wrap='no-wrap'>
										{pie ? (
											<Box>
												<Flex.Item grow={1} shrink={1}>
													<Margins inline='x24'>
														<Box
															style={{
																position: 'relative',
																height: 300,
															}}
														>
															<Box
																style={{
																	position: 'absolute',
																	width: '100%',
																	height: '100%',
																}}
															>
																<ResponsivePie
																	data={[
																		{
																			id: 'd',
																			label: t('Direct_Messages'),
																			value: pie.d,
																			color: colors.warning,
																		},
																		{
																			id: 'p',
																			label: t('Private_Channels'),
																			value: pie.p,
																			color: colors.success,
																		},
																		{
																			id: 'c',
																			label: t('Public_Channels'),
																			value: pie.c,
																			color: colors.info,
																		},
																	]}
																	innerRadius={0.6}
																	colors={[colors.warning, colors.success, colors.info]}
																	// @ts-ignore
																	enableRadialLabels={false}
																	enableSlicesLabels={false}
																	animate={true}
																	motionStiffness={90}
																	motionDamping={15}
																	theme={{
																		// TODO: Get it from theme
																		axis: {
																			ticks: {
																				text: {
																					fill: '#9EA2A8',
																					fontFamily:
																						'Inter, -apple-system, system-ui, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Meiryo UI", Arial, sans-serif',
																					fontSize: 10,
																					fontStyle: 'normal',
																					fontWeight: 600,
																					letterSpacing: '0.2px',
																					lineHeight: '12px',
																				},
																			},
																		},
																		tooltip: {
																			container: {
																				backgroundColor: '#1F2329',
																				boxShadow: '0px 0px 12px rgba(47, 52, 61, 0.12), 0px 0px 2px rgba(47, 52, 61, 0.08)',
																				borderRadius: 2,
																			},
																		},
																	}}
																	tooltip={({ datum }): ReactElement => (
																		<Box fontScale='p1m' color='white'>
																			{t('Value_messages', { value: datum.value })}
																		</Box>
																	)}
																/>
															</Box>
														</Box>
													</Margins>
												</Flex.Item>
												<Flex.Item basis='auto'>
													<Margins block='neg-x4'>
														<Box>
															<Margins block='x4'>
																<Box color='hint' fontScale='p1'>
																	<LegendSymbol color={colors.warning} />
																	{t('Private_Chats')}
																</Box>
																<Box color='hint' fontScale='p1'>
																	<LegendSymbol color={colors.success} />
																	{t('Private_Channels')}
																</Box>
																<Box color='hint' fontScale='p1'>
																	<LegendSymbol color={colors.info} />
																	{t('Public_Channels')}
																</Box>
															</Margins>
														</Box>
													</Margins>
												</Flex.Item>
											</Box>
										) : (
											<Skeleton variant='rect' height={300} />
										)}
									</Flex.Container>
								</Box>
							</Flex.Item>
							<Flex.Item grow={1} shrink={0} basis='0'>
								<Box>
									<Margins blockEnd='x16'>
										{table ? <Box fontScale='p1'>{t('Most_popular_channels_top_5')}</Box> : <Skeleton width='50%' />}
									</Margins>
									{table && !table.length && (
										<Tile fontScale='p1' color='hint' style={{ textAlign: 'center' }}>
											{t('Not_enough_data')}
										</Tile>
									)}
									{(!table || !!table.length) && (
										<Table>
											<Table.Head>
												<Table.Row>
													<Table.Cell>{'#'}</Table.Cell>
													<Table.Cell>{t('Channel')}</Table.Cell>
													<Table.Cell align='end'>{t('Number_of_messages')}</Table.Cell>
												</Table.Row>
											</Table.Head>
											<Table.Body>
												{table?.map(({ i, t, name, messages }) => (
													<Table.Row key={i}>
														<Table.Cell>{i + 1}.</Table.Cell>
														<Table.Cell>
															<Margins inlineEnd='x4'>
																{(t === 'd' && <Icon name='at' />) ||
																	(t === 'p' && <Icon name='lock' />) ||
																	(t === 'c' && <Icon name='hashtag' />)}
															</Margins>
															{name}
														</Table.Cell>
														<Table.Cell align='end'>{messages}</Table.Cell>
													</Table.Row>
												))}
												{!table &&
													Array.from({ length: 5 }, (_, i) => (
														<Table.Row key={i}>
															<Table.Cell>
																<Skeleton width='100%' />
															</Table.Cell>
															<Table.Cell>
																<Skeleton width='100%' />
															</Table.Cell>
															<Table.Cell align='end'>
																<Skeleton width='100%' />
															</Table.Cell>
														</Table.Row>
													))}
											</Table.Body>
										</Table>
									)}
								</Box>
							</Flex.Item>
						</Margins>
					</Box>
				</Margins>
			</Flex.Container>
		</>
	);
};

export default MessagesPerChannelSection;
