import type { ReactElement, ReactNode } from 'react';
import React from 'react';

import { useChatMessagesInstance } from './hooks/useChatMessagesInstance';
import { ChatContext } from '../contexts/ChatContext';
import { useRoom } from '../contexts/RoomContext';

type ChatProviderProps = {
	children: ReactNode;
	tmid?: string;
};

const ChatProvider = ({ children, tmid }: ChatProviderProps): ReactElement => {
	const { _id: rid } = useRoom();
	const value = useChatMessagesInstance({ rid, tmid });

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatProvider;
