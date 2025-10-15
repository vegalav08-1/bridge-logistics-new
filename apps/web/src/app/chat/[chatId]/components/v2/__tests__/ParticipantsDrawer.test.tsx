import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ParticipantsDrawer from '../ParticipantsDrawer';
import type { Participant } from '@/lib/chat2/types';

const mockParticipants: Participant[] = [
  {
    userId: 'user1',
    role: 'USER',
    joinedAtISO: '2023-01-01T00:00:00Z',
    displayName: 'User One',
    muted: false
  },
  {
    userId: 'admin1',
    role: 'ADMIN',
    joinedAtISO: '2023-01-01T00:00:00Z',
    displayName: 'Admin One',
    muted: true
  }
];

describe('ParticipantsDrawer', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    list: mockParticipants,
    onInvite: jest.fn(),
    onToggleMute: jest.fn(),
    canManage: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    render(<ParticipantsDrawer {...defaultProps} />);
    
    expect(screen.getByText('Участники чата')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ParticipantsDrawer {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Участники чата')).not.toBeInTheDocument();
  });

  it('should display participants', () => {
    render(<ParticipantsDrawer {...defaultProps} />);
    
    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText('Admin One')).toBeInTheDocument();
  });

  it('should show mute status', () => {
    render(<ParticipantsDrawer {...defaultProps} />);
    
    const muteButtons = screen.getAllByRole('button', { name: /mute/i });
    expect(muteButtons).toHaveLength(2);
  });

  it('should call onToggleMute when mute button is clicked', async () => {
    render(<ParticipantsDrawer {...defaultProps} />);
    
    const muteButtons = screen.getAllByRole('button', { name: /mute/i });
    fireEvent.click(muteButtons[0]);
    
    await waitFor(() => {
      expect(defaultProps.onToggleMute).toHaveBeenCalledWith('user1', true);
    });
  });

  it('should show invite button when canManage is true', () => {
    render(<ParticipantsDrawer {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /пригласить/i })).toBeInTheDocument();
  });

  it('should not show invite button when canManage is false', () => {
    render(<ParticipantsDrawer {...defaultProps} canManage={false} />);
    
    expect(screen.queryByRole('button', { name: /пригласить/i })).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<ParticipantsDrawer {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /закрыть/i });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});

