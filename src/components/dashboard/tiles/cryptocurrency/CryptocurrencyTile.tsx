import React, { useState, useMemo } from 'react';
import { useCryptocurrencyData } from '../../../../hooks/useCryptocurrencyData';
import { ChartComponent } from '../ChartComponent';
import { PriceDisplay } from '../../../ui/PriceDisplay';
import { Button } from '../../../ui/Button';
import { GenericTile } from '../GenericTile';
import type { DashboardTile } from '../../../../types/dashboard';
import type { TileMeta } from '../GenericTile';
import type { CryptocurrencyTileConfig, ChartPeriod } from './types';

function isValidCryptocurrencyTileConfig(config: unknown): config is CryptocurrencyTileConfig {
  return Boolean(config && typeof config === 'object');
}

export const CryptocurrencyTile = React.memo<{ tile: DashboardTile; meta: TileMeta }>(
  ({ tile, meta, ...rest }) => {
    const configError = !isValidCryptocurrencyTileConfig(tile.config);
    const safeConfig: CryptocurrencyTileConfig = configError
      ? { chartPeriod: '7d', selectedCoin: 'bitcoin', refreshInterval: 0 }
      : (tile.config as CryptocurrencyTileConfig);

    const { data, loading, error, refetch } = useCryptocurrencyData({
      refreshInterval: safeConfig.refreshInterval,
    });
    const [selectedCoin, setSelectedCoin] = useState<string>(safeConfig.selectedCoin || 'bitcoin');
    const [chartPeriod] = useState<ChartPeriod>(safeConfig.chartPeriod || '7d');

    // Memoize the top coins to prevent unnecessary re-renders
    const topCoins = useMemo(() => {
      return data.slice(0, 10);
    }, [data]);

    // Memoize the selected coin data
    const selectedCoinData = useMemo(() => {
      return data.find((coin) => coin.id === selectedCoin);
    }, [data, selectedCoin]);

    let content: React.ReactNode = null;
    if (configError) {
      content = (
        <div className="text-error-600 p-2">
          <span className="font-semibold">Tile Error:</span> Invalid or missing config for
          CryptocurrencyTile.
        </div>
      );
    } else if (loading) {
      content = (
        <div className="flex items-center justify-center h-full text-theme-secondary">
          <div className="flex items-center space-x-2">
            <span className="animate-spin">⏳</span>
            <span>Loading...</span>
          </div>
        </div>
      );
    } else if (error) {
      content = (
        <div className="flex flex-col items-center justify-center h-full text-theme-secondary space-y-4">
          <div className="text-center">
            <p className="text-sm">Failed to load cryptocurrency data</p>
            <p className="text-xs text-theme-tertiary mt-1">Unable to load data</p>
          </div>
          <Button variant="primary" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      );
    } else if (data && data.length > 0) {
      content = (
        <div className="space-y-4">
          {/* Coin Selector */}
          <div className="flex flex-wrap gap-2">
            {topCoins.map((coin) => (
              <button
                key={coin.id}
                onClick={() => setSelectedCoin(coin.id)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedCoin === coin.id
                    ? 'bg-accent-primary text-white'
                    : 'bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary'
                }`}
                aria-label={`Select ${coin.name} for detailed view`}
                aria-pressed={selectedCoin === coin.id}
              >
                {coin.symbol.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Selected Coin Details */}
          {selectedCoinData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-theme-primary">{selectedCoinData.name}</span>
                </div>
                <PriceDisplay
                  price={selectedCoinData.current_price}
                  showChange={true}
                  changeValue={selectedCoinData.price_change_percentage_24h}
                  changePercent={selectedCoinData.price_change_percentage_24h}
                />
              </div>

              {/* Chart */}
              <div className="h-32">
                <ChartComponent
                  data={[]}
                  title={`${selectedCoinData.name} Price (${chartPeriod})`}
                  color={'#00BFFF'}
                  height={tile.size === 'large' ? 200 : 120}
                />
              </div>
            </div>
          )}
        </div>
      );
    } else {
      content = (
        <div className="p-4 text-center">
          <p className="text-theme-muted">No cryptocurrency data available</p>
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

CryptocurrencyTile.displayName = 'CryptocurrencyTile';
