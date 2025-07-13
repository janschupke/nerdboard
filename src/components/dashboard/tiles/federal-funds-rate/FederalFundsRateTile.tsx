import React, { useMemo } from 'react';
import { useFederalFundsRateData } from './hooks/useFederalFundsRateData';
import { ChartComponent } from '../ChartComponent';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import {
  FEDERAL_FUNDS_UI_CONFIG,
  FEDERAL_FUNDS_ERROR_MESSAGES,
  TIME_RANGE_CONFIG,
} from './constants';
import type { FederalFundsRateTileProps, HistoricalRateData } from './types';

export const FederalFundsRateTile = React.memo<FederalFundsRateTileProps>(({ size, config }) => {
  const { data, loading, error, timeRange, setTimeRange, refetch } = useFederalFundsRateData(
    config.refreshInterval,
  );

  // Helper to create a deep content hash for historical data
  function historicalDataContentHash(historicalData: HistoricalRateData[] | undefined): string {
    if (!historicalData || historicalData.length === 0) return '';
    return historicalData.map((item) => `${item.date.getTime()}:${item.rate}`).join('|');
  }

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    if (!data?.historicalData) return [];

    return data.historicalData.map((item) => ({
      timestamp: item.date.getTime(),
      price: item.rate,
    }));
  }, [historicalDataContentHash(data?.historicalData)]);

  // Memoize the current rate change
  const rateChange = useMemo(() => {
    if (!data?.historicalData || data.historicalData.length < 2) return 0;

    const current = data.historicalData[data.historicalData.length - 1].rate;
    const previous = data.historicalData[data.historicalData.length - 2].rate;

    return current - previous;
  }, [historicalDataContentHash(data?.historicalData)]);

  if (loading) {
    const tileSize = typeof size === 'string' ? size : 'medium';
    return <LoadingSkeleton tileSize={tileSize as 'small' | 'medium' | 'large'} />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-error-600 mb-2">{FEDERAL_FUNDS_ERROR_MESSAGES.FETCH_FAILED}</p>
        <Button variant="primary" size="sm" onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-center">
        <p className="text-theme-muted">{FEDERAL_FUNDS_ERROR_MESSAGES.NO_DATA}</p>
      </div>
    );
  }

  return (
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
            <span>{rateChange >= 0 ? '↗' : '↘'}</span>
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
          title={`Federal Funds Rate (${TIME_RANGE_CONFIG[timeRange].label})`}
          color="var(--color-primary-500)"
          height={
            size === 'large'
              ? FEDERAL_FUNDS_UI_CONFIG.CHART_HEIGHTS.LARGE
              : FEDERAL_FUNDS_UI_CONFIG.CHART_HEIGHTS.MEDIUM
          }
        />
      </div>

      {/* Last Update */}
      <div className="text-xs text-theme-muted text-center">
        Last updated: {data.lastUpdate.toLocaleString()}
      </div>
    </div>
  );
});

FederalFundsRateTile.displayName = 'FederalFundsRateTile';
