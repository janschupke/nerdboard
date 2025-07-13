# Nerdboard

A modern dashboard application built with React 19, TypeScript, and Vite that displays real-time market data in an interactive, accessible interface.

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite with optimized bundling
- **Styling**: Tailwind CSS with custom theme system
- **Testing**: Vitest with React Testing Library
- **State Management**: React hooks and context API
- **Data Fetching**: Fetch API with comprehensive error handling
- **Smart Storage**: Intelligent local storage manager for offline and cache
- **Charts**: Recharts library for data visualization
- **Deployment**: Vercel-ready configuration

## Features

- **Real-time Market Data**: Cryptocurrency, precious metals, and Federal Funds rate tracking
- **Interactive Dashboard**: Drag-and-drop tile layout with responsive design
- **Data Visualization**: Interactive charts with historical price and rate data
- **Smart Data Management**: Local storage caching, background refresh, and storage cleanup
- **Offline Support**: Dashboard works with cached data when offline
- **Enhanced Refresh Controls**: Countdown timer and manual refresh for all tiles
- **Accessibility**: WCAG 2.1 AA compliance with full keyboard navigation
- **Error Handling**: Comprehensive error boundaries and recovery mechanisms
- **API Logging System**: All API warnings and errors are logged to a user-accessible log view, not the browser console, with real-time removal and automatic cleanup.
- **Performance**: Optimized components with React.memo and useMemo
- **Theme Support**: Light and dark theme with custom Tailwind configuration
- **Local Storage**: Automatic persistence of dashboard configuration
- **Sidebar state persistence and tile count display**: Sidebar saves active tiles and collapse state to local storage, restores preferences, and displays total tile count with robust error handling and accessibility.

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd nerdboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test:run     # Run tests with coverage
npm run test:ui      # Run tests with UI

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Project Structure

```
src/
├── components/
│   ├── dashboard/          # Dashboard components
│   │   ├── Dashboard.tsx   # Main dashboard container
│   │   ├── TileGrid.tsx    # Responsive tile grid
│   │   ├── Sidebar.tsx     # Collapsible sidebar
│   │   ├── Tile.tsx        # Base tile component
│   │   └── tiles/          # Tile implementations
│   │       ├── cryptocurrency/
│   │       ├── precious-metals/
│   │       └── federal-funds-rate/
│   └── ui/                 # Reusable UI components
├── contexts/               # React contexts
├── hooks/                  # Custom React hooks
├── services/               # API services
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
└── test/                   # Test setup and utilities
```

## API Integration

The application uses a comprehensive API proxy system to handle CORS issues and ensure reliable data fetching:

### API Proxy System

- **Local Development**: Uses Vite proxy configuration for seamless development
- **Production (Vercel)**: Uses serverless functions as API proxies
- **CORS-Free**: No CORS errors in any environment
- **Automatic Deployment**: Works with Vercel's automatic deployment

### Available APIs

| Service              | Purpose             | Used By                 |
| -------------------- | ------------------- | ----------------------- |
| **CoinGecko**        | Cryptocurrency data | Cryptocurrency tile     |
| **TradingEconomics** | Commodity prices    | Uranium tile            |
| **Yahoo Finance**    | Stock/ETF data      | GDX ETF tile            |
| **FRED**             | Economic indicators | Federal Funds Rate tile |
| **ECB/EMMI**         | European rates      | Euribor Rate tile       |
| **OpenWeatherMap**   | Weather data        | Weather tiles           |
| **Alpha Vantage**    | Financial data      | GDX ETF tile (fallback) |
| **IEX Cloud**        | Market data         | GDX ETF tile (fallback) |

### Data Sources

#### Cryptocurrency Data

- **Source**: CoinGecko API via proxy
- **Features**: Real-time price data, market cap, 24h changes
- **Caching**: 30-second cache with automatic refresh
- **Error Handling**: Retry logic with timeout handling

#### Precious Metals Data

- **Source**: Mock data (ready for real API integration)
- **Features**: Gold and silver price tracking
- **Caching**: 5-minute cache with validation
- **Error Handling**: Comprehensive data validation

#### Federal Funds Rate Data

- **Source**: FRED API via proxy with fallback
- **Features**: Real-time Federal Funds rate monitoring with historical trends
- **Caching**: 24-hour cache with automatic refresh
- **Error Handling**: Graceful fallback to mock data with user-friendly messages

#### Uranium Data

- **Source**: TradingEconomics API via proxy
- **Features**: Real-time uranium price tracking
- **Fallbacks**: Quandl and UXC APIs
- **Error Handling**: Multiple fallback sources with mock data

#### GDX ETF Data

- **Source**: Yahoo Finance API via proxy
- **Features**: Real-time ETF price and volume data
- **Fallbacks**: Alpha Vantage and IEX Cloud APIs
- **Error Handling**: Multiple data sources with historical charts

#### Weather Data

- **Source**: OpenWeatherMap API via proxy
- **Features**: Current weather and forecasts for multiple cities
- **Fallbacks**: WeatherAPI and AccuWeather
- **Error Handling**: Graceful degradation with mock data

### API Proxy Configuration

The application includes serverless functions in the `api/` directory that act as CORS proxies:

```bash
api/
├── coingecko.ts           # CoinGecko API proxy
├── tradingeconomics.ts    # TradingEconomics API proxy
├── yahoo-finance.ts       # Yahoo Finance API proxy
├── fred.ts               # FRED API proxy
├── emmi.ts               # EMMI API proxy
├── ecb.ts                # ECB API proxy
├── openweathermap.ts     # OpenWeatherMap API proxy
└── ...                   # Additional API proxies
```

For detailed API proxy documentation, see [api/README.md](api/README.md).

## Accessibility

The application is built with accessibility in mind:

- **Keyboard Navigation**: Full keyboard accessibility for all interactions
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: WCAG AA compliance for all text and interactive elements
- **Error Recovery**: Graceful error handling with user-friendly messages
- **API Logging System**: All API warnings and errors are captured in a dedicated log view, not the browser console, for easier troubleshooting and user transparency.

## Performance

- **Component Optimization**: React.memo for expensive components
- **Bundle Optimization**: Tree shaking and code splitting
- **Caching**: API response caching to reduce network requests
- **Lazy Loading**: Deferred loading of non-critical components
- **Memory Management**: Proper cleanup of intervals and event listeners

## Testing

The project maintains >80% test coverage with:

- **Unit Tests**: Component, hook, and utility function tests
- **Integration Tests**: API service and data flow tests
- **Accessibility Tests**: Keyboard navigation and screen reader tests
- **Error Handling Tests**: Error boundary and recovery tests

## Deployment

The application is configured for deployment on Vercel:

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## Contributing

1. Follow the established code patterns and conventions
2. Maintain >80% test coverage for new code
3. Ensure accessibility compliance for UI changes
4. Use TypeScript strict mode for all new code
5. Follow the error handling patterns established in the codebase

## License

MIT License - see LICENSE file for details.
