import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimeTile } from './TimeTile';
import { useTimeData } from './hooks/useTimeData';
import type { TimeData } from './types';
import { DashboardProvider } from '../../../../contexts/DashboardContext';

function renderWithProviders(ui: React.ReactElement) {
  return render(<DashboardProvider>{ui}</DashboardProvider>);
}

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

  it('should render loading state', () => {
    mockUseTimeData.mockReturnValue({
      timeData: null,
      loading: true,
      error: null,
      lastUpdated: null,
      isCached: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TimeTile {...defaultProps} />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render time data correctly', () => {
    mockUseTimeData.mockReturnValue({
      timeData: mockTimeData,
      loading: false,
      error: null,
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TimeTile {...defaultProps} />);
    expect(screen.getAllByText(/Helsinki/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/14:30:25/)).toBeInTheDocument();
    expect(screen.getByText(/Monday/)).toBeInTheDocument();
  });

  it('should call refetch when retry button is clicked', () => {
    const mockRefetch = vi.fn();

    mockUseTimeData.mockReturnValue({
      timeData: null,
      loading: false,
      error: 'Failed to load time data',
      lastUpdated: null,
      isCached: false,
      refetch: mockRefetch,
    });

    renderWithProviders(<TimeTile {...defaultProps} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should render error state with retry button', () => {
    const mockRefetch = vi.fn();

    mockUseTimeData.mockReturnValue({
      timeData: null,
      loading: false,
      error: 'Failed to load time data',
      lastUpdated: null,
      isCached: false,
      refetch: mockRefetch,
    });

    renderWithProviders(<TimeTile {...defaultProps} />);
    // Use flexible matcher for error message
    expect(screen.getByText(/Unable to display time/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should render business hours status', () => {
    mockUseTimeData.mockReturnValue({
      timeData: mockTimeData,
      loading: false,
      error: null,
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TimeTile {...defaultProps} />);
    // Use flexible matcher for 'Open'
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should render closed business hours', () => {
    const closedTimeData = {
      ...mockTimeData,
      businessStatus: 'closed' as const,
    };

    mockUseTimeData.mockReturnValue({
      timeData: closedTimeData,
      loading: false,
      error: null,
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TimeTile {...defaultProps} />);
    // Use flexible matcher for 'Closed'
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('should handle different tile sizes', () => {
    mockUseTimeData.mockReturnValue({
      timeData: mockTimeData,
      loading: false,
      error: null,
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      refetch: vi.fn(),
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DashboardProvider>{children}</DashboardProvider>
    );
    const { rerender } = render(<TimeTile {...defaultProps} size="small" />, { wrapper });
    expect(screen.getAllByText(/Helsinki/i).length).toBeGreaterThan(0);

    rerender(<TimeTile {...defaultProps} size="large" />);
    expect(screen.getAllByText(/Helsinki/i).length).toBeGreaterThan(0);
  });

  it('should render timezone information', () => {
    mockUseTimeData.mockReturnValue({
      timeData: mockTimeData,
      loading: false,
      error: null,
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TimeTile {...defaultProps} />);
    // Use flexible matcher for timezone
    expect(screen.getByText(/EET/)).toBeInTheDocument();
    expect(screen.getByText(/UTC/)).toBeInTheDocument();
  });

  it('should render Prague time data', () => {
    const pragueTimeData = {
      timezone: 'Europe/Prague',
      abbreviation: 'CET',
      offset: 'UTC+1',
      currentTime: '09:30:00',
      dayOfWeek: 'Monday',
      date: 'January 15, 2024',
      isBusinessHours: true,
      businessStatus: 'open' as const,
      lastUpdate: '2024-01-15T09:30:00Z',
    };

    mockUseTimeData.mockReturnValue({
      timeData: pragueTimeData,
      loading: false,
      error: null,
      lastUpdated: new Date('2024-01-15T09:30:00Z'),
      isCached: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TimeTile {...defaultProps} config={{ city: 'prague' }} />);
    expect(screen.getAllByText(/Prague/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/09:30:00/)).toBeInTheDocument();
  });

  it('should render no data state', () => {
    mockUseTimeData.mockReturnValue({
      timeData: null,
      loading: false,
      error: null,
      lastUpdated: null,
      isCached: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TimeTile {...defaultProps} />);

    expect(screen.getByText('No time data available')).toBeInTheDocument();
  });

  it('should render Taipei time data', () => {
    const taipeiTimeData = {
      timezone: 'Asia/Taipei',
      abbreviation: 'CST',
      offset: 'UTC+8',
      currentTime: '16:30:00',
      dayOfWeek: 'Monday',
      date: 'January 15, 2024',
      isBusinessHours: true,
      businessStatus: 'open' as const,
      lastUpdate: '2024-01-15T16:30:00Z',
    };

    mockUseTimeData.mockReturnValue({
      timeData: taipeiTimeData,
      loading: false,
      error: null,
      lastUpdated: new Date('2024-01-15T16:30:00Z'),
      isCached: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<TimeTile {...defaultProps} config={{ city: 'taipei' }} />);
    expect(screen.getAllByText(/Taipei/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/16:30:00/)).toBeInTheDocument();
  });
});
