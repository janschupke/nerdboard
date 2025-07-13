import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FederalFundsRateTile } from './FederalFundsRateTile';
import { useFederalFundsRateData } from './hooks/useFederalFundsRateData';

// Mock the hook
vi.mock('./hooks/useFederalFundsRateData');

const mockUseFederalFundsRateData = vi.mocked(useFederalFundsRateData);

describe('FederalFundsRateTile', () => {
  const defaultProps = {
    id: 'test-tile',
    size: 'medium' as const,
    config: {
      refreshInterval: 86400000,
    },
  };

  const mockData = {
    currentRate: 5.25,
    lastUpdate: new Date('2024-01-15T10:00:00Z'),
    historicalData: [
      { date: new Date('2024-01-01T00:00:00Z'), rate: 5.0 },
      { date: new Date('2024-01-15T00:00:00Z'), rate: 5.25 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseFederalFundsRateData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      timeRange: '1Y',
      lastUpdated: null,
      isCached: false,
      setTimeRange: vi.fn(),
      refetch: vi.fn(),
    });

    render(<FederalFundsRateTile {...defaultProps} />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render error state with retry button', () => {
    mockUseFederalFundsRateData.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load Federal Funds rate data',
      timeRange: '1Y',
      lastUpdated: null,
      isCached: false,
      setTimeRange: vi.fn(),
      refetch: vi.fn(),
    });

    render(<FederalFundsRateTile {...defaultProps} />);

    expect(screen.getByText('Failed to load Federal Funds rate data')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should render no data state', () => {
    mockUseFederalFundsRateData.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      timeRange: '1Y',
      lastUpdated: null,
      isCached: false,
      setTimeRange: vi.fn(),
      refetch: vi.fn(),
    });

    render(<FederalFundsRateTile {...defaultProps} />);

    expect(screen.getByText('No Federal Funds rate data available')).toBeInTheDocument();
  });

  it('should render tile with data', () => {
    const mockSetTimeRange = vi.fn();

    mockUseFederalFundsRateData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      timeRange: '1Y',
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      setTimeRange: mockSetTimeRange,
      refetch: vi.fn(),
    });

    render(<FederalFundsRateTile {...defaultProps} />);

    expect(screen.getByText('Federal Funds Rate')).toBeInTheDocument();
    expect(screen.getByText('5.25%')).toBeInTheDocument();
    expect(screen.getByText('Last updated: 1/15/2024, 10:00:00 AM')).toBeInTheDocument();
  });

  it('should render time range controls', () => {
    const mockSetTimeRange = vi.fn();

    mockUseFederalFundsRateData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      timeRange: '1Y',
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      setTimeRange: mockSetTimeRange,
      refetch: vi.fn(),
    });

    render(<FederalFundsRateTile {...defaultProps} />);

    expect(screen.getByText('1M')).toBeInTheDocument();
    expect(screen.getByText('3M')).toBeInTheDocument();
    expect(screen.getByText('6M')).toBeInTheDocument();
    expect(screen.getByText('1Y')).toBeInTheDocument();
    expect(screen.getByText('5Y')).toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
  });

  it('should call setTimeRange when time range button is clicked', () => {
    const mockSetTimeRange = vi.fn();

    mockUseFederalFundsRateData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      timeRange: '1Y',
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      setTimeRange: mockSetTimeRange,
      refetch: vi.fn(),
    });

    render(<FederalFundsRateTile {...defaultProps} />);

    const threeMonthButton = screen.getByText('3M');
    fireEvent.click(threeMonthButton);

    expect(mockSetTimeRange).toHaveBeenCalledWith('3M');
  });

  it('should call refetch when retry button is clicked', () => {
    const mockRefetch = vi.fn();

    mockUseFederalFundsRateData.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load Federal Funds rate data',
      timeRange: '1Y',
      lastUpdated: null,
      isCached: false,
      setTimeRange: vi.fn(),
      refetch: mockRefetch,
    });

    render(<FederalFundsRateTile {...defaultProps} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should render chart with correct data', () => {
    const mockSetTimeRange = vi.fn();

    mockUseFederalFundsRateData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      timeRange: '1Y',
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      setTimeRange: mockSetTimeRange,
      refetch: vi.fn(),
    });

    render(<FederalFundsRateTile {...defaultProps} />);

    expect(screen.getByText('Federal Funds Rate (1 Year)')).toBeInTheDocument();
  });

  it('should display rate change correctly', () => {
    const mockSetTimeRange = vi.fn();

    mockUseFederalFundsRateData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      timeRange: '1Y',
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      setTimeRange: mockSetTimeRange,
      refetch: vi.fn(),
    });

    render(<FederalFundsRateTile {...defaultProps} />);

    // Should show the rate change (5.25 - 5.0 = 0.25)
    expect(screen.getByText('+0.25%')).toBeInTheDocument();
  });

  it('should handle different tile sizes', () => {
    const mockSetTimeRange = vi.fn();

    mockUseFederalFundsRateData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      timeRange: '1Y',
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      setTimeRange: mockSetTimeRange,
      refetch: vi.fn(),
    });

    const { rerender } = render(<FederalFundsRateTile {...defaultProps} size="small" />);
    expect(screen.getByText('Federal Funds Rate')).toBeInTheDocument();

    rerender(<FederalFundsRateTile {...defaultProps} size="large" />);
    expect(screen.getByText('Federal Funds Rate')).toBeInTheDocument();
  });


});
