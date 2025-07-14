import React, { useMemo } from 'react';
import { useGDXETFData } from './hooks/useGDXETFData';
import { ChartComponent } from '../ChartComponent';
import { PriceDisplay } from '../../../ui/PriceDisplay';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { GenericTile } from '../GenericTile';
import { GDX_UI_CONFIG } from './constants';
import type { DashboardTile } from '../../../../types/dashboard';
import { gdxEtfTileMeta } from './meta';

function isValidGDXETFTileConfig(config: unknown): config is Record<string, unknown> {
  return Boolean(config && typeof config === 'object');
}

export const GDXETFTile = React.memo<{ tile: DashboardTile }>(({ tile, ...rest }) => {
  const configError = !isValidGDXETFTileConfig(tile.config);
  const safeConfig = configError
    ? { chartPeriod: '1D', refreshInterval: 0, showVolume: false }
    : (tile.config as Record<string, unknown>);

  const refreshInterval =
    typeof safeConfig.refreshInterval === 'number' ? safeConfig.refreshInterval : 0;

  const { data, priceHistory, loading, error, selectedPeriod } = useGDXETFData(refreshInterval);

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
    const tileSize = typeof tile.size === 'string' ? tile.size : 'medium';
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
            color="#fbbf24" // Tailwind amber-400 as example; replace with theme if available
          />
        </div>
      </div>
    );
  }

  return (
    <GenericTile tile={tile} meta={gdxEtfTileMeta} {...rest}>
      {content}
    </GenericTile>
  );
});
