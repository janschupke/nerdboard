export interface PreciousMetalsMockData {
  metal: string;
  price: number;
  unit: string;
  change_24h: number;
  change_percentage: number;
  last_updated: string;
}

export function createPreciousMetalsMockData(
  overrides: Partial<PreciousMetalsMockData> = {}
): PreciousMetalsMockData {
  return {
    metal: 'gold',
    price: 1950.50,
    unit: 'USD/oz',
    change_24h: 15.25,
    change_percentage: 0.79,
    last_updated: new Date().toISOString(),
    ...overrides,
  };
}

export function createPreciousMetalsListMockData(): PreciousMetalsMockData[] {
  return [
    createPreciousMetalsMockData({ metal: 'gold', price: 1950.50 }),
    createPreciousMetalsMockData({ metal: 'silver', price: 24.75 }),
    createPreciousMetalsMockData({ metal: 'platinum', price: 950.00 }),
    createPreciousMetalsMockData({ metal: 'palladium', price: 1200.00 }),
  ];
}

export function createPreciousMetalsErrorData(): { error: string } {
  return {
    error: 'Failed to fetch precious metals data'
  };
}

export function createPreciousMetalsLoadingData(): null {
  return null;
} 
