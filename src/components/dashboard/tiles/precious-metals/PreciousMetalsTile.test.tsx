import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { PreciousMetalsTile } from './PreciousMetalsTile';
import { TileSize } from '../../../../types/dashboard';

// Mock the smart data fetcher
vi.mock('../../../../utils/smartDataFetcher', () => ({
  SmartDataFetcher: {
    fetchWithBackgroundRefresh: vi.fn(),
  },
}));

describe('PreciousMetalsTile', () => {
  const baseProps = {
    id: 'test',
    size: TileSize.MEDIUM,
    config: {},
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state', () => {
    render(<PreciousMetalsTile {...baseProps} />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders data when loaded', async () => {
    const { SmartDataFetcher } = await import('../../../../utils/smartDataFetcher');

    // Mock the smart data fetcher to return success
    vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh).mockResolvedValue({
      data: {
        gold: { price: 1950.5, change_24h: 12.3, change_percentage_24h: 0.63 },
        silver: { price: 24.75, change_24h: -0.15, change_percentage_24h: -0.6 },
      },
      isCached: false,
      error: null,
      lastUpdated: new Date(),
      retryCount: 0,
    });

    render(<PreciousMetalsTile {...baseProps} />);
    await waitFor(() => {
      expect(screen.getByText('Silver')).toBeInTheDocument();
      expect(screen.getByText('$1,950.50')).toBeInTheDocument();
    });
  });

  it('renders error state', async () => {
    const { SmartDataFetcher } = await import('../../../../utils/smartDataFetcher');

    // Mock the smart data fetcher to return an error
    vi.mocked(SmartDataFetcher.fetchWithBackgroundRefresh).mockResolvedValue({
      data: null,
      isCached: false,
      error: 'Failed to load precious metals data',
      lastUpdated: null,
      retryCount: 0,
    });

    render(<PreciousMetalsTile {...baseProps} />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load precious metals data/i)).toBeInTheDocument();
    });
  });
});
