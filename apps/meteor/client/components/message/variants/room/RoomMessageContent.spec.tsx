import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { expect } from 'chai';
import proxyquire from 'proxyquire';
import type { ReactNode } from 'react';
import React, { useMemo } from 'react';

import type * as RoomMessageContentModule from './RoomMessageContent';
import FakeChatProvider from '../../../../../tests/mocks/client/FakeChatProvider';
import FakeRoomProvider from '../../../../../tests/mocks/client/FakeRoomProvider';
import RouterContextMock from '../../../../../tests/mocks/client/RouterContextMock';
import { createFakeMessageWithMd } from '../../../../../tests/mocks/data';
import { UserPresenceContext } from '../../../../contexts/UserPresenceContext';
import { queryClient } from '../../../../lib/queryClient';

describe('RoomMessageContent', () => {
	const fakeMessage = createFakeMessageWithMd({
		msg: 'message',
	});

	const { default: RoomMessageContent } = proxyquire.noCallThru().load<typeof RoomMessageContentModule>('./RoomMessageContent', {
		'../../content/UiKitSurface': () => null,
		'../../content/Attachments': () => null,
		'../../MessageContentBody': () => fakeMessage.msg,
		'../../content/DiscussionMetrics': () => null,
		'../../content/MessageActions': () => null,
		'../../hooks/useNormalizedMessage': { useNormalizedMessage: (args: any) => ({ md: fakeMessage.md, ...args }) },
	});

	const ProvidersMock = ({ children }: { children: ReactNode }) => {
		return (
			<QueryClientProvider client={queryClient}>
				<RouterContextMock>
					<FakeRoomProvider>
						<FakeChatProvider>
							<UserPresenceContext.Provider
								value={useMemo(
									() => ({
										queryUserData: () => ({
											subscribe: () => () => undefined,
											get: () => undefined,
										}),
									}),
									[],
								)}
							>
								{children}
							</UserPresenceContext.Provider>
						</FakeChatProvider>
					</FakeRoomProvider>
				</RouterContextMock>
			</QueryClientProvider>
		);
	};

	it('should render the message when exists', () => {
		render(<RoomMessageContent message={fakeMessage} all={false} mention={false} unread={false} />, {
			wrapper: ProvidersMock,
		});

		expect(screen.getByText(fakeMessage.msg)).to.exist;
	});

	it('should render the message when has an empty message blocks', () => {
		render(<RoomMessageContent message={{ ...fakeMessage, blocks: [] }} all={false} mention={false} unread={false} />, {
			wrapper: ProvidersMock,
		});

		expect(screen.getByText(fakeMessage.msg)).to.exist;
	});

	it('should render the message when replies is undefined', () => {
		render(
			<RoomMessageContent
				message={{ ...fakeMessage, replies: undefined, tcount: 0, tlm: fakeMessage.ts }}
				all={false}
				mention={false}
				unread={false}
			/>,
			{
				wrapper: ProvidersMock,
			},
		);

		expect(screen.getByText(fakeMessage.msg)).to.exist;
		expect(screen.getByTitle('Replies')).to.include.text('0');
	});
});
