# PRP-1752356252000-02-Data-Integration

## Feature Overview

### Feature Name

Data Integration - Cryptocurrency and Precious Metals Tiles

### Brief Description

Implement cryptocurrency and precious metals tiles with real-time data fetching from CoinGecko API and other public data sources, including historical chart visualization using Recharts library.

### User Value

Users can view real-time cryptocurrency market data and precious metals prices with historical charts, providing valuable financial information directly on their dashboard.

## Functional Requirements

### Cryptocurrency Tile

- [ ] Display top 10 cryptocurrencies by market cap
- [ ] Show current price, 24h change percentage, and market cap
- [ ] Real-time data from CoinGecko API (free tier)
- [ ] Historical price charts with 7-day, 30-day, and 1-year views
- [ ] Auto-refresh data every 30 seconds
- [ ] Error handling for API failures with fallback data

### Precious Metals Tile

- [ ] Display gold and silver spot prices
- [ ] Historical price charts for both metals
- [ ] Data from public APIs or reliable financial sources
- [ ] Price change indicators (up/down arrows with colors)
- [ ] Auto-refresh data every 5 minutes
- [ ] Graceful error handling with cached data

### Chart Visualization

- [ ] Line charts for historical price data
- [ ] Responsive chart sizing within tiles
- [ ] Interactive tooltips on chart hover
- [ ] Color-coded price changes (green for positive, red for negative)
- [ ] Smooth animations for data updates
- [ ] Accessibility support for screen readers

### Data Management

- [ ] Centralized API service layer
- [ ] Request caching to minimize API calls
- [ ] Rate limiting for API requests
- [ ] Error boundaries for failed data fetching
- [ ] Loading states during data refresh
- [ ] Offline support with cached data

## Technical Requirements

### API Integration

```typescript
// src/services/api.ts
interface ApiService {
  // Cryptocurrency API
  getCryptocurrencyData(): Promise<CryptocurrencyData[]>;
  getCryptocurrencyHistory(coinId: string, days: number): Promise<PriceHistory[]>;

  // Precious Metals API
  getPreciousMetalsData(): Promise<PreciousMetalsData>;
  getPreciousMetalsHistory(metal: 'gold' | 'silver', days: number): Promise<PriceHistory[]>;
}

interface CryptocurrencyData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

interface PreciousMetalsData {
  gold: {
    price: number;
    change_24h: number;
    change_percentage_24h: number;
  };
  silver: {
    price: number;
    change_24h: number;
    change_percentage_24h: number;
  };
}

interface PriceHistory {
  timestamp: number;
  price: number;
}
```

### Tile Components

```typescript
// src/components/dashboard/tiles/CryptocurrencyTile.tsx
interface CryptocurrencyTileProps {
  id: string;
  size: TileSize;
  config: {
    selectedCoins?: string[];
    chartPeriod?: '7d' | '30d' | '1y';
  };
}

// src/components/dashboard/tiles/PreciousMetalsTile.tsx
interface PreciousMetalsTileProps {
  id: string;
  size: TileSize;
  config: {
    selectedMetals?: ('gold' | 'silver')[];
    chartPeriod?: '7d' | '30d' | '1y';
  };
}
```

### Data Fetching Hooks

```typescript
// src/hooks/useCryptocurrencyData.ts
export function useCryptocurrencyData(refreshInterval: number = 30000) {
  const [data, setData] = useState<CryptocurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Implementation with caching and error handling
}

// src/hooks/usePreciousMetalsData.ts
export function usePreciousMetalsData(refreshInterval: number = 300000) {
  const [data, setData] = useState<PreciousMetalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Implementation with caching and error handling
}
```

## UI/UX Considerations

### User Interface

- **Tile Layout**: Clean card design with data tables and charts
- **Data Display**: Clear price formatting with currency symbols
- **Chart Integration**: Responsive charts that fit tile boundaries
- **Loading States**: Skeleton loaders during data fetching
- **Error States**: User-friendly error messages with retry options

### User Experience

- **Data Refresh**: Smooth updates without jarring layout changes
- **Chart Interaction**: Hover tooltips and responsive interactions
- **Error Recovery**: Automatic retry mechanisms for failed requests
- **Performance**: Fast data loading with cached responses

### Accessibility Requirements

- **Screen Reader Support**: Proper ARIA labels for charts and data
- **Keyboard Navigation**: Full keyboard accessibility for chart interactions
- **Color Contrast**: WCAG AA compliance for all text and chart elements
- **Alternative Text**: Descriptive text for chart data and trends

## Implementation Details

### File Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── tiles/
│   │   │   ├── CryptocurrencyTile.tsx
│   │   │   ├── PreciousMetalsTile.tsx
│   │   │   └── ChartComponent.tsx
│   │   └── ui/
│   │       ├── DataTable.tsx
│   │       ├── PriceDisplay.tsx
│   │       └── LoadingSkeleton.tsx
├── services/
│   ├── api.ts
│   ├── coinGeckoApi.ts
│   └── preciousMetalsApi.ts
├── hooks/
│   ├── useCryptocurrencyData.ts
│   ├── usePreciousMetalsData.ts
│   └── useChartData.ts
├── types/
│   ├── cryptocurrency.ts
│   ├── preciousMetals.ts
│   └── charts.ts
└── utils/
    ├── formatters.ts
    ├── cache.ts
    └── constants.ts
```

### API Service Implementation

```typescript
// src/services/coinGeckoApi.ts
export class CoinGeckoApiService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  async getTopCryptocurrencies(limit: number = 10): Promise<CryptocurrencyData[]> {
    const cacheKey = `top-crypto-${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch cryptocurrency data:', error);
      throw error;
    }
  }

  async getPriceHistory(coinId: string, days: number): Promise<PriceHistory[]> {
    const cacheKey = `price-history-${coinId}-${days}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const formattedData = data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
      }));

      this.setCachedData(cacheKey, formattedData);
      return formattedData;
    } catch (error) {
      console.error('Failed to fetch price history:', error);
      throw error;
    }
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
```

### Chart Component Implementation

```typescript
// src/components/dashboard/tiles/ChartComponent.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartComponentProps {
  data: PriceHistory[];
  title: string;
  color: string;
  height?: number;
}

const ChartComponent: React.FC<ChartComponentProps> = ({
  data,
  title,
  color,
  height = 200
}) => {
  const formatTooltip = (value: any, name: string) => {
    return [`$${value.toFixed(2)}`, name];
  };

  const formatXAxis = (tickItem: number) => {
    return new Date(tickItem).toLocaleDateString();
  };

  return (
    <div className="w-full h-full">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={formatTooltip}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

### Cryptocurrency Tile Implementation

```typescript
// src/components/dashboard/tiles/CryptocurrencyTile.tsx
import React from 'react';
import { useCryptocurrencyData } from '../../../hooks/useCryptocurrencyData';
import { ChartComponent } from './ChartComponent';
import { DataTable } from '../ui/DataTable';
import { PriceDisplay } from '../ui/PriceDisplay';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

interface CryptocurrencyTileProps {
  id: string;
  size: TileSize;
  config: {
    selectedCoins?: string[];
    chartPeriod?: '7d' | '30d' | '1y';
  };
}

const CryptocurrencyTile: React.FC<CryptocurrencyTileProps> = ({
  id,
  size,
  config
}) => {
  const { data, loading, error } = useCryptocurrencyData();
  const [selectedCoin, setSelectedCoin] = useState<string>('bitcoin');
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '1y'>(
    config.chartPeriod || '7d'
  );

  if (loading) {
    return <LoadingSkeleton tileSize={size} />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Failed to load cryptocurrency data</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const topCoins = data.slice(0, 10);
  const selectedCoinData = data.find(coin => coin.id === selectedCoin);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Cryptocurrency Market</h2>
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          {topCoins.map(coin => (
            <option key={coin.id} value={coin.id}>
              {coin.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 p-4">
        {selectedCoinData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Price</p>
                <PriceDisplay
                  price={selectedCoinData.current_price}
                  change={selectedCoinData.price_change_percentage_24h}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">Market Cap</p>
                <p className="text-lg font-semibold">
                  ${selectedCoinData.market_cap.toLocaleString()}
                </p>
              </div>
            </div>

            <ChartComponent
              data={[]} // Will be populated with historical data
              title={`${selectedCoinData.name} Price (${chartPeriod})`}
              color="#3B82F6"
              height={size === 'large' ? 300 : 200}
            />
          </div>
        )}
      </div>
    </div>
  );
};
```

## Testing Requirements

### Unit Testing

- **Coverage Target**: >80% for all new components and services
- **Component Tests**: CryptocurrencyTile, PreciousMetalsTile, ChartComponent
- **Service Tests**: CoinGeckoApiService, data fetching hooks
- **Utility Tests**: Formatters, cache utilities

### Integration Testing

- **API Integration Tests**: Test API calls and error handling
- **Chart Rendering Tests**: Verify chart components render correctly
- **Data Flow Tests**: Test data fetching and state management

### Performance Testing

- **API Performance**: <500ms for API responses
- **Chart Rendering**: <200ms for chart component rendering
- **Memory Usage**: <30MB for dashboard with data tiles
- **Bundle Size**: <300KB additional for chart library

## Performance Considerations

### Performance Benchmarks

- **Data Fetch Time**: <500ms for cryptocurrency data, <1s for precious metals
- **Chart Render Time**: <200ms for chart component rendering
- **Cache Hit Rate**: >80% for cached API responses
- **Memory Usage**: <30MB for dashboard with 5 data tiles

### Optimization Strategies

- **API Caching**: Implement request caching to minimize API calls
- **Chart Optimization**: Lazy load chart components and optimize re-renders
- **Data Compression**: Compress cached data to reduce localStorage usage
- **Bundle Splitting**: Code split chart library to reduce initial bundle size

## Risk Assessment

### Technical Risks

- **Risk**: CoinGecko API rate limits exceeded
  - **Impact**: Medium
  - **Mitigation**: Implement aggressive caching and fallback data sources

- **Risk**: Precious metals APIs require paid access
  - **Impact**: Medium
  - **Mitigation**: Research alternative free data sources or implement web scraping

- **Risk**: Chart library increases bundle size significantly
  - **Impact**: Low
  - **Mitigation**: Implement code splitting and tree shaking

### User Experience Risks

- **Risk**: Slow data loading frustrates users
  - **Impact**: Medium
  - **Mitigation**: Implement skeleton loaders and progressive loading

- **Risk**: API failures leave tiles empty
  - **Impact**: Medium
  - **Mitigation**: Provide cached fallback data and retry mechanisms

## Success Metrics

### User Experience Metrics

- **Data Load Time**: <1 second for initial data loading
- **Chart Interaction**: <100ms response time for chart interactions
- **Error Recovery**: >95% successful data refresh after errors

### Technical Metrics

- **API Reliability**: >99% successful API calls
- **Cache Efficiency**: >80% cache hit rate
- **Performance**: Charts render in <200ms

## Implementation Checklist

### Phase 1: API Services

- [ ] Implement CoinGecko API service with caching
- [ ] Create precious metals API service
- [ ] Add error handling and retry mechanisms
- [ ] Implement rate limiting for API requests

### Phase 2: Data Hooks

- [ ] Create useCryptocurrencyData hook
- [ ] Create usePreciousMetalsData hook
- [ ] Implement data caching and refresh logic
- [ ] Add error state management

### Phase 3: Chart Components

- [ ] Install and configure Recharts library
- [ ] Create reusable ChartComponent
- [ ] Implement responsive chart sizing
- [ ] Add accessibility features for charts

### Phase 4: Tile Components

- [ ] Implement CryptocurrencyTile component
- [ ] Implement PreciousMetalsTile component
- [ ] Add loading and error states
- [ ] Create data table components

### Phase 5: Data Integration

- [ ] Connect tiles to API services
- [ ] Implement real-time data refresh
- [ ] Add historical data fetching
- [ ] Test data flow and error handling

### Phase 6: Polish

- [ ] Add smooth animations for data updates
- [ ] Implement chart interactions and tooltips
- [ ] Add keyboard navigation for charts
- [ ] Create comprehensive test suite

## Dependencies

### New Dependencies

- **Recharts**: React charting library for data visualization
- **date-fns**: Date utility library for chart formatting

### Existing Dependencies

- React 19 with TypeScript
- Tailwind CSS for styling
- Existing dashboard foundation components

## Documentation Requirements

### Code Documentation

- **API Documentation**: Document all API service methods and error handling
- **Component Documentation**: JSDoc comments for all tile components
- **Hook Documentation**: Documentation for data fetching hooks

### README Updates

- Update project README with data integration features
- Document API usage and rate limits
- Add troubleshooting guide for API issues

## Post-Implementation

### Monitoring

- **API Monitoring**: Track API response times and error rates
- **Performance Monitoring**: Monitor chart rendering performance
- **Error Tracking**: Monitor data fetching failures and user impact

### Maintenance

- **API Updates**: Monitor for API changes and updates
- **Chart Library**: Keep Recharts library updated
- **Performance Optimization**: Continuously optimize data fetching and caching
