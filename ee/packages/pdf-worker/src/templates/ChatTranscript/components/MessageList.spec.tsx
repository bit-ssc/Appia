import { render } from '@testing-library/react';

import '@testing-library/jest-dom';
import { MessageList } from './MessageList';
import { invalidFile, validFile, validMessage } from '../ChatTranscript.fixtures';

jest.mock('@react-pdf/renderer', () => ({
	Image: () => <div>Image</div>,
	StyleSheet: { create: () => ({ style: '' }) },
	Text: ({ children }: { children: string }) => <div>{children}</div>,
	View: ({ children }: { children: string }) => <div>{children}</div>,
	Files: ({ children }: { children: string }) => <div>{children}</div>,
}));

describe('components/MessageList', () => {
	it('should render correctly', () => {
		const { getByText } = render(<MessageList messages={[validMessage]} invalidFileMessage='' />);
		expect(getByText(validMessage.msg)).toBeInTheDocument();
	});

	it('should render divider', () => {
		const { getByText } = render(<MessageList messages={[{ ...validMessage, divider: 'divider' }]} invalidFileMessage='' />);
		expect(getByText(validMessage.msg)).toBeInTheDocument();
		expect(getByText('divider')).toBeInTheDocument();
	});

	it('should render file', () => {
		const { getByText } = render(<MessageList messages={[{ ...validMessage, files: [validFile] }]} invalidFileMessage='' />);
		expect(getByText(validMessage.msg)).toBeInTheDocument();
		expect(getByText(validFile.name)).toBeInTheDocument();
	});

	it('should render invalid file message', () => {
		const { getByText } = render(
			<MessageList messages={[{ ...validMessage, files: [invalidFile] }]} invalidFileMessage='invalid message' />,
		);
		expect(getByText(validMessage.msg)).toBeInTheDocument();
		expect(getByText('invalid message')).toBeInTheDocument();
	});
});
