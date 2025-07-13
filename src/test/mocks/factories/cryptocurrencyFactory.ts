import type { CryptocurrencyData } from '../../../types/cryptocurrency';

export function createCryptocurrencyMockData(
  overrides: Partial<CryptocurrencyData> = {},
): CryptocurrencyData {
  return {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 45000,
    market_cap: 850000000000,
    price_change_percentage_24h: 2.5,
    last_updated: new Date().toISOString(),
    ...overrides,
  };
}

export function createCryptocurrencyListMockData(count: number = 10): CryptocurrencyData[] {
  const cryptocurrencies = ['bitcoin', 'ethereum', 'cardano', 'solana', 'polkadot'];

  return Array.from({ length: count }, (_, index) =>
    createCryptocurrencyMockData({
      id: cryptocurrencies[index % cryptocurrencies.length],
      symbol: cryptocurrencies[index % cryptocurrencies.length].substring(0, 3).toUpperCase(),
      name:
        cryptocurrencies[index % cryptocurrencies.length].charAt(0).toUpperCase() +
        cryptocurrencies[index % cryptocurrencies.length].slice(1),
      current_price: 10000 + index * 1000,
      market_cap: 1000000000 + index * 100000000,
      price_change_percentage_24h: (Math.random() - 0.5) * 20,
      last_updated: new Date().toISOString(),
    }),
  );
}

export function createCryptocurrencyErrorData(): { error: string } {
  return {
    error: 'Failed to fetch cryptocurrency data',
  };
}

export function createCryptocurrencyLoadingData(): null {
  return null;
}
