import React, { useState, useMemo } from 'react';
import { usePreciousMetalsData } from './hooks/usePreciousMetalsData';
import { ChartComponent } from '../ChartComponent';
import { PriceDisplay } from '../../../ui/PriceDisplay';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import {
  PRECIOUS_METALS_UI_CONFIG,
  PRECIOUS_METALS_CHART_CONFIG,
  PRECIOUS_METALS_ERROR_MESSAGES,
} from './constants';
import type { PreciousMetalsTileProps, ChartPeriod, MetalType } from './types';

export const PreciousMetalsTile = React.memo<PreciousMetalsTileProps>(({ size, config }) => {
  const { data, loading, error, refetch } = usePreciousMetalsData(config.refreshInterval);
  const [selectedMetal, setSelectedMetal] = useState<MetalType>(
    config.selectedMetal || PRECIOUS_METALS_UI_CONFIG.DEFAULT_METAL,
  );
  const [chartPeriod] = useState<ChartPeriod>(
    config.chartPeriod || PRECIOUS_METALS_UI_CONFIG.DEFAULT_CHART_PERIOD,
  );

  // Memoize the selected metal data
  const selectedMetalData = useMemo(() => {
    if (!data) return null;
    return data[selectedMetal];
  }, [data, selectedMetal]);

  // Memoize the chart color based on selected metal
  const chartColor = useMemo(() => {
    return selectedMetal === 'gold'
      ? PRECIOUS_METALS_CHART_CONFIG.COLORS.GOLD
      : PRECIOUS_METALS_CHART_CONFIG.COLORS.SILVER;
  }, [selectedMetal]);

  if (loading) {
    const tileSize = typeof size === 'string' ? size : 'medium';
    return <LoadingSkeleton tileSize={tileSize as 'small' | 'medium' | 'large'} />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-error-600 mb-2">{PRECIOUS_METALS_ERROR_MESSAGES.FETCH_FAILED}</p>
        <Button variant="primary" size="sm" onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-center">
        <p className="text-theme-muted">No precious metals data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metal Selector */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(data).map((metal) => (
          <button
            key={metal}
            onClick={() => setSelectedMetal(metal as MetalType)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedMetal === metal
                ? 'bg-accent-primary text-white'
                : 'bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary'
            }`}
            aria-label={`Select ${metal} for detailed view`}
            aria-pressed={selectedMetal === metal}
          >
            {metal.charAt(0).toUpperCase() + metal.slice(1)}
          </button>
        ))}
      </div>

      {/* Selected Metal Details */}
      {selectedMetalData && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-theme-primary">
                {selectedMetal.charAt(0).toUpperCase() + selectedMetal.slice(1)}
              </span>
            </div>
            <PriceDisplay
              price={selectedMetalData.price}
              showChange={true}
              changeValue={selectedMetalData.change_24h}
              changePercent={selectedMetalData.change_24h}
            />
          </div>

          {/* Chart */}
          <div className="h-32">
            <ChartComponent
              data={[]} // Will be populated with historical data in future implementation
              title={`${selectedMetal.charAt(0).toUpperCase() + selectedMetal.slice(1)} Price (${chartPeriod})`}
              color={chartColor}
              height={
                size === 'large'
                  ? PRECIOUS_METALS_UI_CONFIG.CHART_HEIGHTS.LARGE
                  : PRECIOUS_METALS_UI_CONFIG.CHART_HEIGHTS.MEDIUM
              }
            />
          </div>
        </div>
      )}
    </div>
  );
});

PreciousMetalsTile.displayName = 'PreciousMetalsTile';
