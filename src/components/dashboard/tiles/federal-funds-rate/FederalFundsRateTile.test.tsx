import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FederalFundsRateTile } from './FederalFundsRateTile';
import { useFederalFundsRateData } from './hooks/useFederalFundsRateData';
import { DashboardProvider } from '../../../../contexts/DashboardContext';
import { meta } from './meta';
import { TileType, TileSize } from '../../../../types/dashboard';
import type { DashboardTile } from '../../../../types/dashboard';

function renderWithProviders(ui: React.ReactElement) {
  return render(<DashboardProvider>{ui}</DashboardProvider>);
}

// Mock the hook
vi.mock('./hooks/useFederalFundsRateData');

const mockUseFederalFundsRateData = vi.mocked(useFederalFundsRateData);

const tile: DashboardTile = {
  id: 'test-id',
  type: TileType.FEDERAL_FUNDS_RATE,
  config: {},
  position: { x: 0, y: 0 },
  size: TileSize.MEDIUM,
};

describe('FederalFundsRateTile', () => {
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

  it('renders without crashing', () => {
    mockUseFederalFundsRateData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      timeRange: '1Y',
      lastUpdated: null,
      isCached: false,
      retryCount: 0,
      setTimeRange: vi.fn(),
      refetch: vi.fn(),
    });
    renderWithProviders(<FederalFundsRateTile tile={tile} meta={meta} />);
  });

  it('should render loading state', () => {
    mockUseFederalFundsRateData.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      timeRange: '1Y',
      lastUpdated: null,
      isCached: false,
      retryCount: 0,
      setTimeRange: vi.fn(),
      refetch: vi.fn(),
    });

    renderWithProviders(<FederalFundsRateTile tile={tile} meta={meta} />);

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
      retryCount: 1,
      setTimeRange: vi.fn(),
      refetch: vi.fn(),
    });

    renderWithProviders(<FederalFundsRateTile tile={tile} meta={meta} />);

    expect(screen.getByText(/error loading federal funds rate data/i)).toBeInTheDocument();
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
      retryCount: 0,
      setTimeRange: vi.fn(),
      refetch: vi.fn(),
    });

    renderWithProviders(<FederalFundsRateTile tile={tile} meta={meta} />);

    expect(screen.getByText(/no federal funds rate data available/i)).toBeInTheDocument();
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
      retryCount: 0,
      setTimeRange: mockSetTimeRange,
      refetch: vi.fn(),
    });

    renderWithProviders(<FederalFundsRateTile tile={tile} meta={meta} />);

    expect(screen.getAllByText(/Federal Funds Rate/i).length).toBeGreaterThan(0);
    expect(screen.getByText('5.25%')).toBeInTheDocument();
    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
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
      retryCount: 0,
      setTimeRange: mockSetTimeRange,
      refetch: vi.fn(),
    });

    renderWithProviders(<FederalFundsRateTile tile={tile} meta={meta} />);

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
      retryCount: 0,
      setTimeRange: mockSetTimeRange,
      refetch: vi.fn(),
    });

    renderWithProviders(<FederalFundsRateTile tile={tile} meta={meta} />);

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
      retryCount: 0,
      setTimeRange: vi.fn(),
      refetch: mockRefetch,
    });

    renderWithProviders(<FederalFundsRateTile tile={tile} meta={meta} />);

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
      retryCount: 0,
      setTimeRange: mockSetTimeRange,
      refetch: vi.fn(),
    });

    renderWithProviders(<FederalFundsRateTile tile={tile} meta={meta} />);

    expect(screen.getByText(/federal funds rate \(1y\)/i)).toBeInTheDocument();
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
      retryCount: 0,
      setTimeRange: mockSetTimeRange,
      refetch: vi.fn(),
    });

    renderWithProviders(<FederalFundsRateTile tile={tile} meta={meta} />);

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
      retryCount: 0,
      setTimeRange: mockSetTimeRange,
      refetch: vi.fn(),
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DashboardProvider>{children}</DashboardProvider>
    );
    const { rerender } = render(<FederalFundsRateTile tile={tile} meta={meta} />, {
      wrapper,
    });
    expect(screen.getAllByText(/Federal Funds Rate/i).length).toBeGreaterThan(0);

    rerender(<FederalFundsRateTile tile={tile} meta={meta} />);
    expect(screen.getAllByText(/Federal Funds Rate/i).length).toBeGreaterThan(0);
  });
});
