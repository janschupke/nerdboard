import React, { useState, useMemo } from 'react';
import { usePreciousMetalsData } from './hooks/usePreciousMetalsData';
import { ChartComponent } from '../ChartComponent';
import { PriceDisplay } from '../../../ui/PriceDisplay';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { GenericTile } from '../GenericTile';
import {
  PRECIOUS_METALS_UI_CONFIG,
  PRECIOUS_METALS_CHART_CONFIG,
  PRECIOUS_METALS_ERROR_MESSAGES,
} from './constants';
import type { PreciousMetalsTileProps, ChartPeriod, MetalType, PreciousMetalsTileConfig } from './types';

function isValidPreciousMetalsTileConfig(config: unknown): config is PreciousMetalsTileConfig {
  return config && typeof config === 'object';
}

export const PreciousMetalsTile = React.memo<PreciousMetalsTileProps>(({ size, config, ...rest }) => {
  const configError = !isValidPreciousMetalsTileConfig(config);
  const safeConfig: PreciousMetalsTileConfig = configError
    ? { chartPeriod: '7d', selectedMetal: 'gold', refreshInterval: 0 }
    : config;

  const { data, loading, error, refetch } = usePreciousMetalsData(safeConfig.refreshInterval);
  const [selectedMetal, setSelectedMetal] = useState<MetalType>(
    safeConfig.selectedMetal || 'gold',
  );
  const [chartPeriod] = useState<ChartPeriod>(
    safeConfig.chartPeriod || '7d',
  );

  // Memoize the selected metal data
  const selectedMetalData = useMemo(() => {
    if (!data) return null;
    return data[selectedMetal];
  }, [data, selectedMetal]);

  // Memoize the chart color based on selected metal
  const chartColor = useMemo(() => {
    return selectedMetal === 'gold'
      ? '#FFD700'
      : '#C0C0C0';
  }, [selectedMetal]);

  let content: React.ReactNode = null;
  if (configError) {
    content = (
      <div className="text-error-600 p-2">
        <span className="font-semibold">Tile Error:</span> Invalid or missing config for PreciousMetalsTile.
      </div>
    );
  } else if (loading) {
    const tileSize = typeof size === 'string' ? size : 'medium';
    content = <LoadingSkeleton tileSize={tileSize as 'small' | 'medium' | 'large'} />;
  } else if (error) {
    content = (
      <div className="p-4 text-center">
        <p className="text-error-600 mb-2">Error loading precious metals data</p>
        <Button variant="primary" size="sm" onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  } else if (!data) {
    content = (
      <div className="p-4 text-center">
        <p className="text-theme-muted">No precious metals data available</p>
      </div>
    );
  } else {
    content = (
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
                    ? 200
                    : 120
                }
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <GenericTile
      tile={{
        id: 'precious-metals',
        type: 'precious-metals',
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

PreciousMetalsTile.displayName = 'PreciousMetalsTile';
