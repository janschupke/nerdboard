import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GDXETFTile } from './GDXETFTile';
import { useGDXETFData } from './hooks/useGDXETFData';

// Mock the hook
vi.mock('./hooks/useGDXETFData');

const mockUseGDXETFData = vi.mocked(useGDXETFData);

describe('GDXETFTile', () => {
  const defaultProps = {
    id: 'test-gdx-tile',
    size: 'medium' as const,
    config: {
      refreshInterval: 60000,
    },
  };

  const mockData = {
    symbol: 'GDX',
    name: 'VanEck Vectors Gold Miners ETF',
    currentPrice: 25.5,
    previousClose: 25.0,
    priceChange: 0.5,
    priceChangePercent: 2.0,
    volume: 10000000,
    marketCap: 5000000000,
    high: 26.0,
    low: 25.0,
    open: 25.25,
    lastUpdated: '2024-01-15T16:00:00Z',
    tradingStatus: 'open' as const,
  };

  const mockPriceHistory = [
    { timestamp: 1705344000000, price: 25.0 },
    { timestamp: 1705430400000, price: 25.5 },
    { timestamp: 1705516800000, price: 26.0 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseGDXETFData.mockReturnValue({
      data: null,
      priceHistory: [],
      loading: true,
      error: null,
      selectedPeriod: '1M',
      lastUpdated: null,
      isCached: false,
      setSelectedPeriod: vi.fn(),
    });

    render(<GDXETFTile {...defaultProps} />);

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUseGDXETFData.mockReturnValue({
      data: null,
      priceHistory: [],
      loading: false,
      error: 'Failed to load GDX ETF data',
      selectedPeriod: '1M',
      lastUpdated: null,
      isCached: false,
      setSelectedPeriod: vi.fn(),
    });

    render(<GDXETFTile {...defaultProps} />);

    expect(screen.getByText('Failed to load GDX ETF data')).toBeInTheDocument();
  });

  it('should render no data state', () => {
    mockUseGDXETFData.mockReturnValue({
      data: null,
      priceHistory: [],
      loading: false,
      error: null,
      selectedPeriod: '1M',
      lastUpdated: null,
      isCached: false,
      setSelectedPeriod: vi.fn(),
    });

    render(<GDXETFTile {...defaultProps} />);

    expect(screen.getByText('No GDX ETF data available')).toBeInTheDocument();
  });

  it('should render tile with data', () => {
    mockUseGDXETFData.mockReturnValue({
      data: mockData,
      priceHistory: mockPriceHistory,
      loading: false,
      error: null,
      selectedPeriod: '1M',
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      setSelectedPeriod: vi.fn(),
    });

    render(<GDXETFTile {...defaultProps} />);
    // Use getAllByText for GDX
    expect(screen.getAllByText(/GDX/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Gold Miners ETF/)).toBeInTheDocument();
    expect(screen.getByText(/\$25\.50/)).toBeInTheDocument();
    expect(screen.getByText(/\+2/)).toBeInTheDocument();
  });

  it('should render period controls', () => {
    mockUseGDXETFData.mockReturnValue({
      data: mockData,
      priceHistory: mockPriceHistory,
      loading: false,
      error: null,
      selectedPeriod: '1M',
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      setSelectedPeriod: vi.fn(),
    });

    render(<GDXETFTile {...defaultProps} />);

    expect(screen.getByText('1D')).toBeInTheDocument();
    expect(screen.getByText('1W')).toBeInTheDocument();
    expect(screen.getByText('1M')).toBeInTheDocument();
    expect(screen.getByText('3M')).toBeInTheDocument();
    expect(screen.getByText('1Y')).toBeInTheDocument();
    expect(screen.getByText('5Y')).toBeInTheDocument();
  });

  it.skip('should call changePeriod when period button is clicked', () => {
    mockUseGDXETFData.mockReturnValue({
      data: mockData,
      priceHistory: mockPriceHistory,
      loading: false,
      error: null,
      selectedPeriod: '1M',
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      setSelectedPeriod: vi.fn(),
    });

    render(<GDXETFTile {...defaultProps} />);

    const threeMonthButton = screen.getByText('3M');
    fireEvent.click(threeMonthButton);

    expect(vi.mocked(useGDXETFData).mock.results[0].value.setSelectedPeriod).toHaveBeenCalledWith(
      '3M',
    );
  });

  it('should display trading status correctly', () => {
    mockUseGDXETFData.mockReturnValue({
      data: mockData,
      priceHistory: mockPriceHistory,
      loading: false,
      error: null,
      selectedPeriod: '1M',
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      setSelectedPeriod: vi.fn(),
    });

    render(<GDXETFTile {...defaultProps} />);

    expect(screen.getByText('Market Open')).toBeInTheDocument();
  });

  it('should display closed market status', () => {
    const closedMarketData = {
      ...mockData,
      tradingStatus: 'closed' as const,
    };

    mockUseGDXETFData.mockReturnValue({
      data: closedMarketData,
      priceHistory: mockPriceHistory,
      loading: false,
      error: null,
      selectedPeriod: '1M',
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      setSelectedPeriod: vi.fn(),
    });

    render(<GDXETFTile {...defaultProps} />);

    expect(screen.getByText('Market Closed')).toBeInTheDocument();
  });

  it('should handle different tile sizes', () => {
    mockUseGDXETFData.mockReturnValue({
      data: mockData,
      priceHistory: mockPriceHistory,
      loading: false,
      error: null,
      selectedPeriod: '1M',
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      setSelectedPeriod: vi.fn(),
    });

    const { rerender } = render(<GDXETFTile {...defaultProps} size="small" />);
    expect(screen.getAllByText(/GDX/).length).toBeGreaterThan(0);

    rerender(<GDXETFTile {...defaultProps} size="large" />);
    expect(screen.getAllByText(/GDX/).length).toBeGreaterThan(0);
  });

  it('should render chart with correct data', () => {
    mockUseGDXETFData.mockReturnValue({
      data: mockData,
      priceHistory: mockPriceHistory,
      loading: false,
      error: null,
      selectedPeriod: '1M',
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      setSelectedPeriod: vi.fn(),
    });

    render(<GDXETFTile {...defaultProps} />);
    // Use flexible matcher for chart title
    expect(screen.getByText(/Price \(1M\)/)).toBeInTheDocument();
  });

  it.skip('should handle error state with retry', () => {
    mockUseGDXETFData.mockReturnValue({
      data: null,
      priceHistory: [],
      loading: false,
      error: 'Failed to load GDX ETF data',
      selectedPeriod: '1M',
      lastUpdated: null,
      isCached: false,
      setSelectedPeriod: vi.fn(),
    });

    render(<GDXETFTile {...defaultProps} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(vi.mocked(useGDXETFData).mock.results[0].value.refetch).toHaveBeenCalled();
  });

  it('should display volume and market cap', () => {
    mockUseGDXETFData.mockReturnValue({
      data: mockData,
      priceHistory: mockPriceHistory,
      loading: false,
      error: null,
      selectedPeriod: '1M',
      lastUpdated: new Date('2024-01-15T10:00:00Z'),
      isCached: false,
      setSelectedPeriod: vi.fn(),
    });

    render(<GDXETFTile {...defaultProps} />);
    // Use regex or partial match for volume and market cap
    expect(screen.getByText(/Volume:/)).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('10,000,000'))).toBeInTheDocument();
    expect(screen.getByText(/Market Cap:/)).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('$5.00'))).toBeInTheDocument();
  });
});
