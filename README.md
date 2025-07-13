# Nerdboard

A modern dashboard application built with React 19, TypeScript, and Vite that displays real-time market data in an interactive, accessible interface.

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite with optimized bundling
- **Styling**: Tailwind CSS with custom theme system
- **Testing**: Vitest with React Testing Library
- **State Management**: React hooks and context API
- **Data Fetching**: Fetch API with comprehensive error handling
- **Charts**: Recharts library for data visualization
- **Deployment**: Vercel-ready configuration

## Features

- **Real-time Market Data**: Cryptocurrency and precious metals price tracking
- **Interactive Dashboard**: Drag-and-drop tile layout with responsive design
- **Data Visualization**: Interactive charts with historical price data
- **Accessibility**: WCAG 2.1 AA compliance with full keyboard navigation
- **Error Handling**: Comprehensive error boundaries and recovery mechanisms
- **Performance**: Optimized components with React.memo and useMemo
- **Theme Support**: Light and dark theme with custom Tailwind configuration
- **Local Storage**: Automatic persistence of dashboard configuration

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
│   │       └── precious-metals/
│   └── ui/                 # Reusable UI components
├── contexts/               # React contexts
├── hooks/                  # Custom React hooks
├── services/               # API services
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
└── test/                   # Test setup and utilities
```

## API Integration

### Cryptocurrency Data

- **Source**: CoinGecko API
- **Features**: Real-time price data, market cap, 24h changes
- **Caching**: 30-second cache with automatic refresh
- **Error Handling**: Retry logic with timeout handling

### Precious Metals Data

- **Source**: Mock data (ready for real API integration)
- **Features**: Gold and silver price tracking
- **Caching**: 5-minute cache with validation
- **Error Handling**: Comprehensive data validation

## Accessibility

The application is built with accessibility in mind:

- **Keyboard Navigation**: Full keyboard accessibility for all interactions
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: WCAG AA compliance for all text and interactive elements
- **Error Recovery**: Graceful error handling with user-friendly messages

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
