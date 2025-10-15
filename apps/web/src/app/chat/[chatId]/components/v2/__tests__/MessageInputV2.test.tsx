import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MessageInputV2 from '../MessageInputV2';

describe('MessageInputV2', () => {
  const defaultProps = {
    onSend: jest.fn(),
    mentionIndex: [
      { id: 'user1', name: 'User One' },
      { id: 'user2', name: 'User Two' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input field', () => {
    render(<MessageInputV2 {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('should call onSend when send button is clicked', async () => {
    render(<MessageInputV2 {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /отправить/i });
    
    fireEvent.change(input, { target: { value: 'Hello world' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(defaultProps.onSend).toHaveBeenCalledWith({
        text: 'Hello world',
        mentions: []
      });
    });
  });

  it('should call onSend when Enter key is pressed', async () => {
    render(<MessageInputV2 {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'Hello world' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(defaultProps.onSend).toHaveBeenCalledWith({
        text: 'Hello world',
        mentions: []
      });
    });
  });

  it('should not send empty message', () => {
    render(<MessageInputV2 {...defaultProps} />);
    
    const sendButton = screen.getByRole('button', { name: /отправить/i });
    fireEvent.click(sendButton);
    
    expect(defaultProps.onSend).not.toHaveBeenCalled();
  });

  it('should handle mentions', async () => {
    render(<MessageInputV2 {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'Hello @user1 how are you?' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(defaultProps.onSend).toHaveBeenCalledWith({
        text: 'Hello @user1 how are you?',
        mentions: [{ id: 'user1', name: 'User One' }]
      });
    });
  });

  it('should show mention suggestions when @ is typed', async () => {
    render(<MessageInputV2 {...defaultProps} />);
    
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: '@' } });
    
    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });
  });
});

