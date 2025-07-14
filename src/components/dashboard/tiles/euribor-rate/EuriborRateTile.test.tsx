import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EuriborRateTile } from './EuriborRateTile';
import type { EuriborRateData } from './types';

// Extend globalThis to include the mock
declare global {
  var mockUseEuriborRateData: ReturnType<typeof vi.fn> | undefined;
}

// Mock the API service
vi.mock('./services/euriborRateApi');

vi.mock('./hooks/useEuriborRateData', () => {
  const mockUseEuriborRateData = vi.fn();
  globalThis.mockUseEuriborRateData = mockUseEuriborRateData;
  return { useEuriborRateData: mockUseEuriborRateData };
});

// Mock the sub-components
vi.mock('./EuriborRateHeader', () => ({
  EuriborRateHeader: ({
    currentRate,
    lastUpdate,
    loading,
  }: {
    currentRate?: number;
    lastUpdate?: Date;
    loading?: boolean;
  }) => (
    <div data-testid="euribor-rate-header">
      <div data-testid="current-rate">{currentRate}</div>
      <div data-testid="last-update">{lastUpdate?.toISOString()}</div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
    </div>
  ),
}));

vi.mock('./EuriborRateChart', () => ({
  EuriborRateChart: ({
    data,
    timeRange,
    loading,
  }: {
    data?: Array<{ date: Date; rate: number }>;
    timeRange?: string;
    loading?: boolean;
  }) => (
    <div data-testid="euribor-rate-chart">
      <div data-testid="chart-data-points">{data?.length || 0}</div>
      <div data-testid="chart-time-range">{timeRange}</div>
      <div data-testid="chart-loading">{loading ? 'loading' : 'not-loading'}</div>
    </div>
  ),
}));

vi.mock('./EuriborRateControls', () => ({
  EuriborRateControls: ({
    timeRange,
    onTimeRangeChange,
    onRefresh,
    loading,
  }: {
    timeRange?: string;
    onTimeRangeChange?: (range: string) => void;
    onRefresh?: () => void;
    loading?: boolean;
  }) => (
    <div data-testid="euribor-rate-controls">
      <div data-testid="controls-time-range">{timeRange}</div>
      <button data-testid="controls-refresh" onClick={onRefresh} disabled={loading}>
        Refresh
      </button>
      <button
        data-testid="controls-time-1m"
        onClick={() => onTimeRangeChange?.('1M')}
        disabled={loading}
      >
        1M
      </button>
    </div>
  ),
}));

vi.mock('../../../ui/LoadingSkeleton', () => ({
  LoadingSkeleton: () => <div data-testid="loading-skeleton">Loading...</div>,
}));

describe('EuriborRateTile', () => {
  const mockData: EuriborRateData = {
    currentRate: 3.85,
    lastUpdate: new Date('2024-01-15T10:30:00Z'),
    historicalData: [
      { date: new Date('2024-01-01'), rate: 3.8 },
      { date: new Date('2024-01-15'), rate: 3.85 },
    ],
  };

  let mockUseEuriborRateData: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEuriborRateData = globalThis.mockUseEuriborRateData!;
    mockUseEuriborRateData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      timeRange: '1Y',
      setTimeRange: vi.fn(),
      refreshData: vi.fn(),
      hasError: false,
      hasData: false,
    });
  });

  it('should render loading skeleton when loading and no data', () => {
    mockUseEuriborRateData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      timeRange: '1Y',
      setTimeRange: vi.fn(),
      refreshData: vi.fn(),
      hasError: false,
      hasData: false,
    });

    render(<EuriborRateTile />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render error state when there is an error', () => {
    mockUseEuriborRateData.mockReturnValue({
      data: null,
      loading: false,
      error: 'API Error',
      timeRange: '1Y',
      setTimeRange: vi.fn(),
      refreshData: vi.fn(),
      hasError: true,
      hasData: false,
    });

    render(<EuriborRateTile />);

    expect(screen.getByText('API Error')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should render no data state when no data available', () => {
    mockUseEuriborRateData.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      timeRange: '1Y',
      setTimeRange: vi.fn(),
      refreshData: vi.fn(),
      hasError: false,
      hasData: false,
    });

    render(<EuriborRateTile />);

    expect(screen.getByText('No Euribor rate data available')).toBeInTheDocument();
  });

  it('should render tile with data when available', () => {
    mockUseEuriborRateData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      timeRange: '1Y',
      setTimeRange: vi.fn(),
      refreshData: vi.fn(),
      hasError: false,
      hasData: true,
    });

    render(<EuriborRateTile />);

    expect(screen.getByTestId('euribor-rate-header')).toBeInTheDocument();
    expect(screen.getByTestId('euribor-rate-chart')).toBeInTheDocument();
    expect(screen.getByTestId('euribor-rate-controls')).toBeInTheDocument();
  });

  it('should display current rate in header', () => {
    mockUseEuriborRateData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      timeRange: '1Y',
      setTimeRange: vi.fn(),
      refreshData: vi.fn(),
      hasError: false,
      hasData: true,
    });

    render(<EuriborRateTile />);

    expect(screen.getByTestId('current-rate')).toHaveTextContent('3.85');
  });

  it('should display last update time in header', () => {
    mockUseEuriborRateData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      timeRange: '1Y',
      setTimeRange: vi.fn(),
      refreshData: vi.fn(),
      hasError: false,
      hasData: true,
    });

    render(<EuriborRateTile />);

    expect(screen.getByTestId('last-update')).toHaveTextContent('2024-01-15T10:30:00.000Z');
  });

  it('should pass correct data to chart component', () => {
    mockUseEuriborRateData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      timeRange: '1Y',
      setTimeRange: vi.fn(),
      refreshData: vi.fn(),
      hasError: false,
      hasData: true,
    });

    render(<EuriborRateTile />);

    expect(screen.getByTestId('chart-data-points')).toHaveTextContent('2');
    expect(screen.getByTestId('chart-time-range')).toHaveTextContent('1Y');
  });

  it('should pass correct props to controls component', () => {
    mockUseEuriborRateData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      timeRange: '1Y',
      setTimeRange: vi.fn(),
      refreshData: vi.fn(),
      hasError: false,
      hasData: true,
    });

    render(<EuriborRateTile />);

    expect(screen.getByTestId('controls-time-range')).toHaveTextContent('1Y');
    expect(screen.getByTestId('controls-refresh')).toBeInTheDocument();
  });

  it.skip('should handle refresh button click', async () => {
    const mockRefreshData = vi.fn();
    mockUseEuriborRateData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      timeRange: '1Y',
      setTimeRange: vi.fn(),
      refreshData: mockRefreshData,
      hasError: false,
      hasData: true,
    });

    render(<EuriborRateTile />);

    const refreshButton = screen.getByTestId('controls-refresh');
    fireEvent.click(refreshButton);

    expect(mockRefreshData).toHaveBeenCalled();
  });

  it('should handle time range change', async () => {
    const mockSetTimeRange = vi.fn();
    mockUseEuriborRateData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      timeRange: '1Y',
      setTimeRange: mockSetTimeRange,
      refreshData: vi.fn(),
      hasError: false,
      hasData: true,
    });

    render(<EuriborRateTile />);

    const timeRangeButton = screen.getByTestId('controls-time-1m');
    fireEvent.click(timeRangeButton);

    expect(mockSetTimeRange).toHaveBeenCalledWith('1M');
  });
});
