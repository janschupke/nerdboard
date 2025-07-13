import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimeTile } from './TimeTile';
import { useTimeData } from './hooks/useTimeData';
import type { TimeData } from './types';

// Mock the useTimeData hook
vi.mock('./hooks/useTimeData');

const mockUseTimeData = vi.mocked(useTimeData);

const mockTimeData: TimeData = {
  currentTime: '14:30:25',
  timezone: 'Europe/Helsinki',
  abbreviation: 'EET',
  offset: '+2:00',
  dayOfWeek: 'Monday',
  date: 'Jan 15, 2024',
  isBusinessHours: true,
  businessStatus: 'open',
  timeUntilNextDay: '6h 30m',
  lastUpdate: '2024-01-15T14:30:25.000Z',
};

const defaultProps = {
  id: 'test-time-tile',
  size: 'medium' as const,
  config: {
    city: 'helsinki' as const,
    showBusinessHours: true,
  },
};

describe('TimeTile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockUseTimeData.mockReturnValue({
      timeData: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<TimeTile {...defaultProps} />);
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders time data when loaded successfully', () => {
    mockUseTimeData.mockReturnValue({
      timeData: mockTimeData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TimeTile {...defaultProps} />);
    
    expect(screen.getByText('Helsinki')).toBeInTheDocument();
    expect(screen.getByText('14:30:25')).toBeInTheDocument();
    expect(screen.getByText('Monday, Jan 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('EET')).toBeInTheDocument();
    expect(screen.getByText('UTC+2:00')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders error state with retry button', () => {
    const mockRefetch = vi.fn();
    mockUseTimeData.mockReturnValue({
      timeData: null,
      loading: false,
      error: 'Timezone error',
      refetch: mockRefetch,
    });

    render(<TimeTile {...defaultProps} />);
    
    expect(screen.getByText('Unable to display time for this timezone')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('calls refetch when retry button is clicked', () => {
    const mockRefetch = vi.fn();
    mockUseTimeData.mockReturnValue({
      timeData: null,
      loading: false,
      error: 'Timezone error',
      refetch: mockRefetch,
    });

    render(<TimeTile {...defaultProps} />);
    
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    fireEvent.click(retryButton);
    
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('toggles time format when format button is clicked', () => {
    mockUseTimeData.mockReturnValue({
      timeData: mockTimeData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TimeTile {...defaultProps} />);
    
    const formatButton = screen.getByRole('button', { name: /Switch to 12-hour format/i });
    fireEvent.click(formatButton);
    
    expect(screen.getByRole('button', { name: /Switch to 24-hour format/i })).toBeInTheDocument();
  });

  it('hides business hours when showBusinessHours is false', () => {
    mockUseTimeData.mockReturnValue({
      timeData: mockTimeData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <TimeTile
        {...defaultProps}
        config={{ ...defaultProps.config, showBusinessHours: false }}
      />
    );
    
    expect(screen.queryByText('Open')).not.toBeInTheDocument();
  });

  it('shows last update info for large tiles', () => {
    mockUseTimeData.mockReturnValue({
      timeData: mockTimeData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TimeTile {...defaultProps} size="large" />);
    
    expect(screen.getByText(/Last update:/)).toBeInTheDocument();
  });

  it('handles different city configurations', () => {
    const pragueTimeData = {
      ...mockTimeData,
      timezone: 'Europe/Prague',
      abbreviation: 'CET',
      offset: '+1:00',
    };

    mockUseTimeData.mockReturnValue({
      timeData: pragueTimeData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <TimeTile
        {...defaultProps}
        config={{ ...defaultProps.config, city: 'prague' }}
      />
    );
    
    expect(screen.getByText('Prague')).toBeInTheDocument();
    expect(screen.getByText('CET')).toBeInTheDocument();
    expect(screen.getByText('UTC+1:00')).toBeInTheDocument();
  });

  it('handles missing time data gracefully', () => {
    mockUseTimeData.mockReturnValue({
      timeData: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TimeTile {...defaultProps} />);
    
    expect(screen.getByText('No time data available')).toBeInTheDocument();
  });

  it('renders with different tile sizes', () => {
    mockUseTimeData.mockReturnValue({
      timeData: mockTimeData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { rerender } = render(<TimeTile {...defaultProps} size="small" />);
    expect(screen.getByText('14:30:25')).toBeInTheDocument();

    rerender(<TimeTile {...defaultProps} size="large" />);
    expect(screen.getByText('14:30:25')).toBeInTheDocument();
    expect(screen.getByText(/Last update:/)).toBeInTheDocument();
  });

  it('handles timezone names with underscores', () => {
    const taipeiTimeData = {
      ...mockTimeData,
      timezone: 'Asia/Taipei',
      abbreviation: 'CST',
      offset: '+8:00',
    };

    mockUseTimeData.mockReturnValue({
      timeData: taipeiTimeData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <TimeTile
        {...defaultProps}
        config={{ ...defaultProps.config, city: 'taipei' }}
      />
    );
    
    expect(screen.getByText('Taipei')).toBeInTheDocument();
  });
}); 
