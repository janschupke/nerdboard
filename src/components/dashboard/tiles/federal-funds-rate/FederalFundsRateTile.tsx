import React, { useMemo } from 'react';
import { useFederalFundsRateData } from './hooks/useFederalFundsRateData';
import { ChartComponent } from '../../generic-tile/ChartComponent';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { GenericTile } from '../../generic-tile/GenericTile';
import { FEDERAL_FUNDS_UI_CONFIG, TIME_RANGE_CONFIG } from './constants';
import type { DashboardTile } from '../../../../types/dashboard';
import type { TileMeta } from '../../generic-tile/GenericTile';
import type { FederalFundsRateTileConfig } from './types';

function isValidFederalFundsRateTileConfig(config: unknown): config is FederalFundsRateTileConfig {
  return Boolean(config && typeof config === 'object');
}

export const FederalFundsRateTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    const configError = !isValidFederalFundsRateTileConfig(tile.config);
    const safeConfig: FederalFundsRateTileConfig = configError
      ? { timeRange: '1M', refreshInterval: 0 }
      : (tile.config as FederalFundsRateTileConfig);

    const { data, loading, error, timeRange, setTimeRange, refetch } = useFederalFundsRateData(
      safeConfig.refreshInterval,
    );

    const chartData: [] = [];

    // Memoize the current rate change
    const rateChange = useMemo(() => {
      if (!data?.historicalData || data.historicalData.length < 2) return 0;
      const current = data.historicalData[data.historicalData.length - 1].rate;
      const previous = data.historicalData[data.historicalData.length - 2].rate;
      return current - previous;
    }, [data?.historicalData]);

    let content: React.ReactNode = null;
    if (configError) {
      content = (
        <div className="text-error-600 p-2">
          <span className="font-semibold">Tile Error:</span> Invalid or missing config for
          FederalFundsRateTile.
        </div>
      );
    } else if (loading) {
      const tileSize = typeof tile.size === 'string' ? tile.size : 'medium';
      content = <LoadingSkeleton tileSize={tileSize as 'small' | 'medium' | 'large'} />;
    } else if (error) {
      content = (
        <div className="p-4 text-center">
          <p className="text-error-600 mb-2">Error loading federal funds rate data</p>
          <Button variant="primary" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      );
    } else if (!data) {
      content = (
        <div className="p-4 text-center">
          <p className="text-theme-muted">No federal funds rate data available</p>
        </div>
      );
    } else {
      content = (
        <div className="space-y-4">
          {/* Header with Current Rate */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-theme-primary">Federal Funds Rate</span>
            </div>
            <div className="">
              <div className="text-lg font-semibold">{data.currentRate.toFixed(2)}%</div>
              <div
                className={`text-sm flex items-center space-x-1 ${rateChange >= 0 ? 'text-success-600' : 'text-error-600'}`}
              >
                <span>{rateChange >= 0 ? '\u2197' : '\u2198'}</span>
                <span>
                  {rateChange >= 0 ? '+' : ''}
                  {rateChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Time Range Controls */}
          <div className="flex flex-wrap gap-1">
            {FEDERAL_FUNDS_UI_CONFIG.TIME_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  timeRange === range
                    ? 'bg-accent-primary text-white'
                    : 'bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary'
                }`}
                aria-label={`Select ${TIME_RANGE_CONFIG[range].label} time range`}
                aria-pressed={timeRange === range}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="h-32">
            <ChartComponent
              data={chartData}
              title={`Federal Funds Rate (${timeRange})`}
              color="var(--color-primary-500)"
              height={tile.size === 'large' ? 200 : 120}
            />
          </div>

          {/* Last Update */}
          <div className="text-xs text-theme-muted text-center">
            Last updated: {data.lastUpdate.toLocaleString()}
          </div>
        </div>
      );
    }

    return (
      <GenericTile tile={tile} meta={meta} {...rest}>
        {content}
      </GenericTile>
    );
  },
);

FederalFundsRateTile.displayName = 'FederalFundsRateTile';
