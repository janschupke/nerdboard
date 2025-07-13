# PRP-1752409929000-04: GDX ETF Stock Monitoring

## Feature Overview

### Feature Name
GDX ETF Stock Monitoring Tile

### Brief Description
A real-time dashboard tile that displays current GDX (VanEck Vectors Gold Miners ETF) stock price with interactive charts and historical data. This tile provides insight into the performance of gold mining companies and serves as a proxy for gold market sentiment and mining sector health.

### User Value
Users can monitor the performance of gold mining companies through GDX ETF tracking, understand gold market sentiment, and make informed decisions about precious metals investments and mining sector exposure.

## User Stories

### Primary User Story
**As a** financial dashboard user
**I want** to view real-time GDX ETF stock price with historical charts
**So that** I can monitor gold mining sector performance and market sentiment

### Additional User Stories
- **As a** precious metals investor, **I want** to track GDX performance, **So that** I can assess gold mining sector health
- **As a** financial analyst, **I want** to see GDX price trends, **So that** I can analyze gold market sentiment
- **As a** dashboard user, **I want** to compare GDX with gold prices, **So that** I can understand mining sector leverage

## Acceptance Criteria

### Functional Requirements
- [ ] Display current GDX stock price prominently
- [ ] Show historical price data in interactive line chart
- [ ] Provide time range selector (1D, 1W, 1M, 3M, 6M, 1Y, 5Y, Max)
- [ ] Display price change indicators (up/down arrows with percentages)
- [ ] Show volume data and market cap information
- [ ] Display last update timestamp
- [ ] Implement data refresh every 1 minute during market hours
- [ ] Handle API failures gracefully with cached data fallback
- [ ] Support web scraping fallback if API is unavailable
- [ ] Display trading status (open/closed) indicator

### Non-Functional Requirements
- [ ] Chart renders in <200ms on initial load
- [ ] Data updates without full page refresh
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Responsive design for mobile/tablet/desktop
- [ ] Error handling with user-friendly messages
- [ ] Caching strategy to minimize API calls

## Technical Requirements

### Implementation Details

#### Component Structure
```typescript
// src/components/dashboard/tiles/gdx-etf/
├── GDXETFTile.tsx                    // Main tile component
├── GDXETFChart.tsx                   // Chart component
├── GDXETFHeader.tsx                  // Header with current price
├── GDXETFControls.tsx                // Time range controls
├── GDXETFStats.tsx                   // Volume and market stats
├── hooks/
│   └── useGDXETFData.ts              // Data fetching hook
├── services/
│   └── gdxEtfApi.ts                  // API service
├── types.ts                           // TypeScript types
└── constants.ts                       // Constants and configuration
```

#### State Management
- Use React hooks for local state management
- Implement data caching with localStorage
- Handle loading, error, and success states
- Manage chart time range selection state
- Track market hours and trading status

#### API Integration
- Primary: Alpha Vantage API (5 calls/minute, 500/day free tier)
- Fallback: Yahoo Finance API
- Secondary Fallback: IEX Cloud API free tier
- Final Fallback: Web scraping from Yahoo Finance or similar
- Symbol: GDX (VanEck Vectors Gold Miners ETF)
- Data format: Real-time price, volume, historical charts
- Update frequency: Real-time during market hours

#### Data Persistence
- Cache API responses in localStorage
- Store user preferences (time range, chart settings)
- Implement cache invalidation after 1 hour

### Technical Constraints
- Must use free API tier or implement web scraping
- Respect API rate limits (Alpha Vantage: 5 calls/minute)
- Handle CORS issues with web scraping fallback
- Support offline mode with cached data
- Track market hours (9:30 AM - 4:00 PM ET)

### Dependencies
- Recharts library for chart visualization
- Date-fns for date manipulation
- Axios for HTTP requests (if not using fetch)
- React-query for data fetching (optional enhancement)

## UI/UX Considerations

### User Interface
- **Layout**: Tile format consistent with existing dashboard tiles
- **Components**: Header with current price, interactive chart, time controls, stats
- **Responsive Design**: Chart adapts to tile size, mobile-friendly controls
- **Visual Design**: Follow existing tile design system

### User Experience
- **Interaction Flow**: 
  1. User sees current GDX price prominently displayed
  2. User can interact with chart to explore historical data
  3. User can change time range to view different periods
  4. User receives visual feedback for data updates
- **Feedback Mechanisms**: Loading states, error messages, success indicators
- **Error Handling**: Graceful degradation with cached data
- **Loading States**: Skeleton loader for chart, spinner for data updates

### Accessibility Requirements
- **Keyboard Navigation**: Full keyboard accessibility for chart interactions
- **Screen Reader Support**: ARIA labels for chart elements, price announcements
- **Color Contrast**: WCAG AA compliance for all text and chart elements
- **Focus Management**: Clear focus indicators for interactive elements

## Testing Requirements

### Unit Testing
- **Coverage Target**: >80% for all components and hooks
- **Component Tests**: GDXETFTile, GDXETFChart, GDXETFHeader, GDXETFStats
- **Utility Tests**: Data transformation functions, market hours calculation
- **Hook Tests**: useGDXETFData hook with mocked API responses

### Integration Testing
- **User Flow Tests**: Complete tile interaction flow
- **State Management Tests**: Dashboard integration, tile state persistence
- **Data Fetching Tests**: API integration, error handling, caching

### Performance Testing
- **Render Performance**: <200ms initial render, <100ms chart updates
- **Data Update Performance**: Smooth chart animations during data refresh
- **Memory Usage**: Proper cleanup of chart instances and event listeners
- **Bundle Size**: Minimal impact on overall bundle size

## Performance Considerations

### Performance Benchmarks
- **Initial Load Time**: <500ms for tile to display with cached data
- **Component Render Time**: <200ms for chart component
- **Data Refresh Rate**: Every 1 minute during market hours
- **Memory Usage**: <10MB additional memory for chart components

### Optimization Strategies
- **Code Splitting**: Lazy load chart components
- **Memoization**: React.memo for chart components, useMemo for data processing
- **Bundle Optimization**: Tree shaking for chart library imports
- **Asset Optimization**: Efficient chart rendering with canvas optimization

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- **Perceivable**: High contrast chart colors, text alternatives for chart data
- **Operable**: Keyboard navigation for all chart interactions
- **Understandable**: Clear labels, predictable behavior
- **Robust**: Compatible with screen readers and assistive technologies

### Specific Accessibility Features
- **Keyboard Navigation**: Arrow keys for chart navigation, Enter for interactions
- **Screen Reader Support**: Descriptive ARIA labels for chart elements
- **High Contrast Mode**: Chart colors adapt to high contrast theme
- **Reduced Motion**: Respect user motion preferences for chart animations

## Risk Assessment

### Technical Risks
- **Risk**: Alpha Vantage API rate limits exceeded
  - **Impact**: Medium
  - **Mitigation**: Implement robust caching, fallback to alternative APIs, then web scraping

- **Risk**: Web scraping fails due to website structure changes
  - **Impact**: Medium
  - **Mitigation**: Implement multiple scraping strategies, robust error handling

- **Risk**: Chart library performance issues on mobile devices
  - **Impact**: Low
  - **Mitigation**: Test on various devices, implement responsive chart options

### User Experience Risks
- **Risk**: Data loading delays impact user experience
  - **Impact**: Medium
  - **Mitigation**: Implement skeleton loaders, cached data display

- **Risk**: Chart interactions are not intuitive
  - **Impact**: Low
  - **Mitigation**: User testing, clear visual feedback, accessibility compliance

## Implementation Plan

### Phase 1: Foundation (Week 1)
- [ ] Create basic tile component structure
- [ ] Implement data fetching hook with Alpha Vantage API
- [ ] Add basic chart display with Recharts
- [ ] Implement error handling and loading states
- [ ] Add basic styling and responsive design

### Phase 2: Enhancement (Week 2)
- [ ] Add interactive chart features (zoom, pan, tooltips)
- [ ] Implement time range selector controls
- [ ] Add alternative API fallback implementations
- [ ] Implement web scraping fallback
- [ ] Add data caching strategy

### Phase 3: Polish (Week 3)
- [ ] Add market hours tracking and trading status
- [ ] Add accessibility features and keyboard navigation
- [ ] Performance optimization and memoization
- [ ] Comprehensive testing implementation
- [ ] Integration testing with dashboard

## Success Metrics

### User Experience Metrics
- **User Engagement**: Chart interaction rate, time spent viewing tile
- **Completion Rate**: Successful data loading and display
- **Error Rate**: API failure rate, user-reported issues

### Technical Metrics
- **Performance**: <200ms chart render time, <500ms tile load time
- **Accessibility**: WCAG 2.1 AA compliance score
- **Test Coverage**: >80% test coverage for all components

## Documentation Requirements

### Code Documentation
- **Component Documentation**: JSDoc comments for all components and hooks
- **API Documentation**: Alpha Vantage API integration details and rate limits
- **README Updates**: Update project documentation with new tile feature

### User Documentation
- **Help Text**: Tooltips for chart interactions and data interpretation
- **User Guide**: Documentation for GDX ETF significance
- **Tutorial**: Onboarding content explaining the tile's purpose

## Post-Implementation

### Monitoring
- **Performance Monitoring**: Chart render times, API response times
- **Error Tracking**: API failures, scraping errors, user-reported issues
- **User Analytics**: Tile usage patterns, interaction metrics

### Maintenance
- **Regular Updates**: Monitor Alpha Vantage API changes, update scraping logic
- **Bug Fixes**: Address chart rendering issues, API integration problems
- **Feature Enhancements**: Additional time ranges, export functionality

## Code Examples

### Basic Tile Component Structure
```typescript
// src/components/dashboard/tiles/gdx-etf/GDXETFTile.tsx
import React from 'react';
import { useGDXETFData } from './hooks/useGDXETFData';
import { GDXETFHeader } from './GDXETFHeader';
import { GDXETFChart } from './GDXETFChart';
import { GDXETFControls } from './GDXETFControls';
import { GDXETFStats } from './GDXETFStats';

export const GDXETFTile: React.FC = () => {
  const { data, loading, error, timeRange, setTimeRange, isMarketOpen } = useGDXETFData();

  if (error) {
    return <div className="tile-error">Unable to load GDX ETF data</div>;
  }

  return (
    <div className="tile gdx-etf-tile">
      <GDXETFHeader 
        currentPrice={data?.currentPrice}
        priceChange={data?.priceChange}
        lastUpdate={data?.lastUpdate}
        loading={loading}
        isMarketOpen={isMarketOpen}
      />
      <GDXETFChart 
        data={data?.historicalData}
        timeRange={timeRange}
        loading={loading}
      />
      <GDXETFStats 
        volume={data?.volume}
        marketCap={data?.marketCap}
        loading={loading}
      />
      <GDXETFControls 
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
    </div>
  );
};
```

### Data Fetching Hook
```typescript
// src/components/dashboard/tiles/gdx-etf/hooks/useGDXETFData.ts
import { useState, useEffect } from 'react';
import { fetchGDXETFData } from '../services/gdxEtfApi';
import { GDXETFData, TimeRange } from '../types';
import { isMarketOpen } from '../utils/marketHours';

export const useGDXETFData = () => {
  const [data, setData] = useState<GDXETFData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchGDXETFData(timeRange);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Check market hours and set refresh interval
    const checkMarketHours = () => {
      const marketOpen = isMarketOpen();
      setIsMarketOpen(marketOpen);
      
      if (marketOpen) {
        // Refresh every minute during market hours
        const interval = setInterval(loadData, 60 * 1000);
        return () => clearInterval(interval);
      }
    };

    checkMarketHours();
    const marketCheckInterval = setInterval(checkMarketHours, 60 * 1000);

    return () => clearInterval(marketCheckInterval);
  }, [timeRange]);

  return { data, loading, error, timeRange, setTimeRange, isMarketOpen };
};
```

### API Service Implementation
```typescript
// src/components/dashboard/tiles/gdx-etf/services/gdxEtfApi.ts
import { GDXETFData, TimeRange } from '../types';

const ALPHA_VANTAGE_API_BASE = 'https://www.alphavantage.co/query';
const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
const SYMBOL = 'GDX';

export const fetchGDXETFData = async (timeRange: TimeRange): Promise<GDXETFData> => {
  try {
    // Try Alpha Vantage API first
    const response = await fetch(
      `${ALPHA_VANTAGE_API_BASE}?function=TIME_SERIES_DAILY&symbol=${SYMBOL}&apikey=${API_KEY}&outputsize=compact`
    );
    
    if (!response.ok) {
      throw new Error('Alpha Vantage API request failed');
    }

    const data = await response.json();
    return transformAlphaVantageData(data);
  } catch (error) {
    // Fallback to alternative APIs
    return await fetchAlternativeGDXData(timeRange);
  }
};

const transformAlphaVantageData = (alphaData: any): GDXETFData => {
  const timeSeries = alphaData['Time Series (Daily)'];
  const dates = Object.keys(timeSeries).sort().reverse();
  
  const historicalData = dates.slice(0, 100).map((date: string) => {
    const dayData = timeSeries[date];
    return {
      date: new Date(date),
      price: parseFloat(dayData['4. close']),
      volume: parseInt(dayData['5. volume'])
    };
  });

  const currentPrice = historicalData[0]?.price || 0;
  const previousPrice = historicalData[1]?.price || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = ((priceChange / previousPrice) * 100);

  return {
    currentPrice,
    priceChange,
    priceChangePercent,
    volume: historicalData[0]?.volume || 0,
    marketCap: 0, // Would need additional API call for market cap
    lastUpdate: new Date(),
    historicalData
  };
};
```

### Types Definition
```typescript
// src/components/dashboard/tiles/gdx-etf/types.ts
export interface GDXETFData {
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  marketCap: number;
  lastUpdate: Date;
  historicalData: GDXETFPoint[];
}

export interface GDXETFPoint {
  date: Date;
  price: number;
  volume: number;
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'Max';

export interface AlphaVantageResponse {
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}
```

### Market Hours Utility
```typescript
// src/components/dashboard/tiles/gdx-etf/utils/marketHours.ts
export const isMarketOpen = (): boolean => {
  const now = new Date();
  const easternTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  
  const hour = easternTime.getHours();
  const minute = easternTime.getMinutes();
  const dayOfWeek = easternTime.getDay();
  
  // Market is closed on weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }
  
  // Market hours: 9:30 AM - 4:00 PM ET
  const marketOpen = 9 * 60 + 30; // 9:30 AM in minutes
  const marketClose = 16 * 60; // 4:00 PM in minutes
  const currentTime = hour * 60 + minute;
  
  return currentTime >= marketOpen && currentTime < marketClose;
};
```

This PRP provides comprehensive implementation details for the GDX ETF Stock Monitoring tile, ensuring all requirements are met while maintaining code quality and accessibility standards. 
