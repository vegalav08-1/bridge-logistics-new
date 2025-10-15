import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatSettingsDrawer from '../ChatSettingsDrawer';
import type { ChatSettings } from '@/lib/chat2/types';

const mockChatSettings: ChatSettings = {
  allowInvites: true,
  allowMentions: true
};

describe('ChatSettingsDrawer', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    initial: mockChatSettings,
    onSave: jest.fn(),
    canEdit: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    render(<ChatSettingsDrawer {...defaultProps} />);
    
    expect(screen.getByText('Настройки чата')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ChatSettingsDrawer {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Настройки чата')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<ChatSettingsDrawer {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /закрыть/i });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onSave when save button is clicked', async () => {
    render(<ChatSettingsDrawer {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /сохранить/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith(mockChatSettings);
    });
  });

  it('should disable inputs when canEdit is false', () => {
    render(<ChatSettingsDrawer {...defaultProps} canEdit={false} />);
    
    const inputs = screen.getAllByRole('checkbox');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('should show save button only when canEdit is true', () => {
    render(<ChatSettingsDrawer {...defaultProps} canEdit={false} />);
    
    expect(screen.queryByRole('button', { name: /сохранить/i })).not.toBeInTheDocument();
  });
});

