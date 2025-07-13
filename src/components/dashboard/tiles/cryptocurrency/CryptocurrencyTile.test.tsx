import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CryptocurrencyTile } from './CryptocurrencyTile';
import { TileSize } from '../../../../types/dashboard';
import * as coinGeckoApiModule from './services/coinGeckoApi';

describe('CryptocurrencyTile', () => {
  const baseProps = {
    id: 'test',
    size: TileSize.MEDIUM,
    config: {},
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state', () => {
    render(<CryptocurrencyTile {...baseProps} />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders data when loaded', async () => {
    vi.spyOn(coinGeckoApiModule.CoinGeckoApiService.prototype, 'getTopCryptocurrencies').mockResolvedValue([
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 50000,
        market_cap: 1000000000000,
        market_cap_rank: 1,
        price_change_percentage_24h: 2.5,
        price_change_24h: 1000,
        total_volume: 50000000,
        circulating_supply: 19000000,
        total_supply: 21000000,
        max_supply: 21000000,
        ath: 69000,
        ath_change_percentage: -27.5,
        atl: 67.81,
        atl_change_percentage: 73600,
        last_updated: '2024-07-12T23:00:00Z',
      },
    ]);
    render(<CryptocurrencyTile {...baseProps} />);
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      expect(screen.getByText('BTC')).toBeInTheDocument();
    });
  });

  it('renders error state', async () => {
    vi.spyOn(coinGeckoApiModule.CoinGeckoApiService.prototype, 'getTopCryptocurrencies').mockRejectedValue(new Error('Failed to load cryptocurrency data'));
    render(<CryptocurrencyTile {...baseProps} />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load cryptocurrency data/i)).toBeInTheDocument();
    });
  });
}); 
