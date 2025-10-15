import { render, screen, fireEvent } from '@testing-library/react';
import MessageBubbleV2 from '../MessageBubbleV2';
import type { Message } from '@/lib/chat2/types';

const mockMessage: Message = {
  id: 'msg1',
  chatId: 'chat1',
  kind: 'text',
  text: 'Hello world',
  authorId: 'user1',
  createdAtISO: '2023-01-01T00:00:00Z',
  mentions: []
};

describe('MessageBubbleV2', () => {
  const defaultProps = {
    message: mockMessage,
    isOwn: false,
    canPin: true,
    onPin: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render message text', () => {
    render(<MessageBubbleV2 {...defaultProps} />);
    
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should show different styling for own messages', () => {
    render(<MessageBubbleV2 {...defaultProps} isOwn={true} />);
    
    const messageElement = screen.getByText('Hello world').closest('div');
    expect(messageElement).toHaveClass('bg-blue-500');
  });

  it('should show different styling for other messages', () => {
    render(<MessageBubbleV2 {...defaultProps} isOwn={false} />);
    
    const messageElement = screen.getByText('Hello world').closest('div');
    expect(messageElement).toHaveClass('bg-gray-200');
  });

  it('should show pin button when canPin is true', () => {
    render(<MessageBubbleV2 {...defaultProps} canPin={true} />);
    
    const pinButton = screen.getByRole('button', { name: /pin/i });
    expect(pinButton).toBeInTheDocument();
  });

  it('should not show pin button when canPin is false', () => {
    render(<MessageBubbleV2 {...defaultProps} canPin={false} />);
    
    expect(screen.queryByRole('button', { name: /pin/i })).not.toBeInTheDocument();
  });

  it('should call onPin when pin button is clicked', () => {
    render(<MessageBubbleV2 {...defaultProps} />);
    
    const pinButton = screen.getByRole('button', { name: /pin/i });
    fireEvent.click(pinButton);
    
    expect(defaultProps.onPin).toHaveBeenCalledWith('msg1', true);
  });

  it('should display mentions', () => {
    const messageWithMentions: Message = {
      ...mockMessage,
      text: 'Hello @user2 how are you?',
      mentions: [{ userId: 'user2', from: 6, to: 12 }]
    };

    render(<MessageBubbleV2 {...defaultProps} message={messageWithMentions} />);
    
    expect(screen.getByText('@user2')).toBeInTheDocument();
  });

  it('should show timestamp', () => {
    render(<MessageBubbleV2 {...defaultProps} />);
    
    // Check if timestamp is displayed (format may vary)
    expect(screen.getByText(/2023/)).toBeInTheDocument();
  });
});

