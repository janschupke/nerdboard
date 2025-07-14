import React, { useMemo } from 'react';
import { useGDXETFData } from './hooks/useGDXETFData';
import { ChartComponent } from '../ChartComponent';
import { PriceDisplay } from '../../../ui/PriceDisplay';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { GenericTile } from '../GenericTile';
import { GDX_UI_CONFIG, GDX_ERROR_MESSAGES, GDX_MARKET_MESSAGES } from './constants';
import type { GDXETFTileProps, GDXETFTileConfig } from './types';

function isValidGDXETFTileConfig(config: unknown): config is GDXETFTileConfig {
  return config && typeof config === 'object';
}

export const GDXETFTile = React.memo<GDXETFTileProps>(({ size, config, ...rest }) => {
  const configError = !isValidGDXETFTileConfig(config);
  const safeConfig: GDXETFTileConfig = configError
    ? { chartPeriod: '1D', refreshInterval: 0, showVolume: false }
    : config;

  const { data, priceHistory, loading, error, selectedPeriod } = useGDXETFData(
    safeConfig.refreshInterval,
  );

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    return priceHistory.map((item) => ({
      timestamp: item.timestamp,
      price: item.price,
    }));
  }, [priceHistory]);

  // Memoize the trading status display
  const tradingStatusDisplay = useMemo(() => {
    if (!data) return '';
    const statusMap = {
      open: 'Market Open',
      closed: 'Market Closed',
      'pre-market': 'Pre-Market',
      'after-hours': 'After Hours',
    };
    return statusMap[data.tradingStatus];
  }, [data]);

  let content: React.ReactNode = null;
  if (configError) {
    content = (
      <div className="text-error-600 p-2">
        <span className="font-semibold">Tile Error:</span> Invalid or missing config for GDXETFTile.
      </div>
    );
  } else if (loading) {
    const tileSize = typeof size === 'string' ? size : 'medium';
    content = <LoadingSkeleton tileSize={tileSize as 'small' | 'medium' | 'large'} />;
  } else if (error) {
    content = (
      <div className="p-4 text-center">
        <p className="text-error-600 mb-2">Error loading GDX ETF data</p>
        <Button variant="primary" size="sm" onClick={() => {}}>
          Retry
        </Button>
      </div>
    );
  } else if (!data) {
    content = (
      <div className="p-4 text-center">
        <p className="text-theme-muted">No GDX ETF data available</p>
      </div>
    );
  } else {
    content = (
      <div className="space-y-4">
        {/* Header with current price and trading status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div>
              <h3 className="font-medium text-theme-primary">{data.symbol}</h3>
              <p className="text-xs text-theme-muted">{data.name}</p>
            </div>
          </div>
          <div className="text-right">
            <PriceDisplay
              price={data.currentPrice}
              showChange={true}
              changeValue={data.priceChangePercent}
              changePercent={data.priceChangePercent}
            />
            <div className="text-xs text-theme-muted mt-1">{tradingStatusDisplay}</div>
          </div>
        </div>

        {/* Time period selector */}
        <div className="flex flex-wrap gap-1">
          {GDX_UI_CONFIG.CHART_PERIODS.map((period) => (
            <button
              key={period}
              onClick={() => {}}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedPeriod === period
                  ? 'bg-accent-primary text-white'
                  : 'bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary'
              }`}
              aria-label={`Select ${period} time period`}
              aria-pressed={selectedPeriod === period}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-32">
          <ChartComponent
            data={chartData}
            title={`${data.symbol} Price (${selectedPeriod})`}
            color="var(--color-primary-500)"
            height={
              size === 'large'
                ? 200
                : 120
            }
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-theme-muted">Volume:</span>
            <span className="ml-1 text-theme-primary">{data.volume.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-theme-muted">Market Cap:</span>
            <span className="ml-1 text-theme-primary">
              ${(data.marketCap / 1000000000).toFixed(2)}B
            </span>
          </div>
          <div>
            <span className="text-theme-muted">High:</span>
            <span className="ml-1 text-theme-primary">${data.high.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-theme-muted">Low:</span>
            <span className="ml-1 text-theme-primary">${data.low.toFixed(2)}</span>
          </div>
        </div>

        {/* Last updated */}
        <div className="text-xs text-theme-muted text-center">
          Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </div>
      </div>
    );
  }

  return (
    <GenericTile
      tile={{
        id: 'gdx-etf',
        type: 'gdx_etf',
        size,
        config: safeConfig as Record<string, unknown>,
        position: { x: 0, y: 0 },
      }}
      {...rest}
    >
      {content}
    </GenericTile>
  );
});

GDXETFTile.displayName = 'GDXETFTile';
