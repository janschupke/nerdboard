import React, { useMemo } from 'react';
import { useGDXETFData } from './hooks/useGDXETFData';
import { ChartComponent } from '../ChartComponent';
import { PriceDisplay } from '../../../ui/PriceDisplay';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { GDX_UI_CONFIG, GDX_ERROR_MESSAGES, GDX_MARKET_MESSAGES } from './constants';
import type { GDXETFTileProps } from './types';

export const GDXETFTile = React.memo<GDXETFTileProps>(({ size, config }) => {
  const { data, priceHistory, loading, error, selectedPeriod, refetch, changePeriod } =
    useGDXETFData(config.refreshInterval);

  // Helper to create a deep content hash for priceHistory
  function priceHistoryContentHash(arr: typeof priceHistory): string {
    if (!arr || arr.length === 0) return '';
    return arr.map(item => `${item.timestamp}:${item.price}`).join('|');
  }

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    return priceHistory.map((item) => ({
      timestamp: item.timestamp,
      price: item.price,
    }));
  }, [priceHistoryContentHash(priceHistory)]);

  // Memoize the trading status display
  const tradingStatusDisplay = useMemo(() => {
    if (!data) return '';

    const statusMap = {
      open: GDX_MARKET_MESSAGES.MARKET_OPEN,
      closed: GDX_MARKET_MESSAGES.MARKET_CLOSED,
      'pre-market': GDX_MARKET_MESSAGES.PRE_MARKET,
      'after-hours': GDX_MARKET_MESSAGES.AFTER_HOURS,
    };

    return statusMap[data.tradingStatus];
  }, [data?.tradingStatus]);

  if (loading) {
    const tileSize = typeof size === 'string' ? size : 'medium';
    return <LoadingSkeleton tileSize={tileSize as 'small' | 'medium' | 'large'} />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-error-600 mb-2">{GDX_ERROR_MESSAGES.FETCH_FAILED}</p>
        <Button variant="primary" size="sm" onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-center">
        <p className="text-theme-muted">{GDX_ERROR_MESSAGES.NO_DATA}</p>
      </div>
    );
  }

  return (
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
            onClick={() => changePeriod(period)}
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
              ? GDX_UI_CONFIG.CHART_HEIGHTS.LARGE
              : GDX_UI_CONFIG.CHART_HEIGHTS.MEDIUM
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
});

GDXETFTile.displayName = 'GDXETFTile';
