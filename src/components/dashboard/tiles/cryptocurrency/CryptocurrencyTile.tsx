import React, { useState, useMemo } from 'react';
import { useCryptocurrencyData } from '../../../../hooks/useCryptocurrencyData';
import { ChartComponent } from '../ChartComponent';
import { PriceDisplay } from '../../../ui/PriceDisplay';
import { Button } from '../../../ui/Button';
import { Tile } from '../../Tile';
import { CRYPTO_UI_CONFIG, CRYPTO_CHART_CONFIG } from './constants';
import type { CryptocurrencyTileProps, ChartPeriod } from './types';

export const CryptocurrencyTile = React.memo<CryptocurrencyTileProps>(({ size, config }) => {
  const { data, loading, error, lastUpdated, isCached, refetch } = useCryptocurrencyData({
    refreshInterval: config.refreshInterval,
  });
  const [selectedCoin, setSelectedCoin] = useState<string>(config.selectedCoin || 'bitcoin');
  const [chartPeriod] = useState<ChartPeriod>(
    config.chartPeriod || CRYPTO_UI_CONFIG.DEFAULT_CHART_PERIOD,
  );

  // Memoize the top coins to prevent unnecessary re-renders
  const topCoins = useMemo(() => {
    return data.slice(0, CRYPTO_UI_CONFIG.TOP_COINS_DISPLAY_LIMIT);
  }, [data]);

  // Memoize the selected coin data
  const selectedCoinData = useMemo(() => {
    return data.find((coin) => coin.id === selectedCoin);
  }, [data, selectedCoin]);

  return (
    <Tile
      tile={{
        id: 'cryptocurrency',
        type: 'cryptocurrency',
        size,
        config: config as Record<string, unknown>,
        position: { x: 0, y: 0 },
      }}
      loading={loading}
      error={error}
      lastUpdated={lastUpdated || undefined}
      isCached={isCached}
      className="h-full"
    >
      {/* Render content when data is available */}
      {data && data.length > 0 && (
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
                  data={[]} // Will be populated with historical data in future implementation
                  title={`${selectedCoinData.name} Price (${chartPeriod})`}
                  color={CRYPTO_CHART_CONFIG.COLORS.PRIMARY}
                  height={
                    size === 'large'
                      ? CRYPTO_UI_CONFIG.CHART_HEIGHTS.LARGE
                      : CRYPTO_UI_CONFIG.CHART_HEIGHTS.MEDIUM
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
      {/* Retry button for error state */}
      {error && (
        <div className="flex justify-center mt-4">
          <Button variant="primary" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}
    </Tile>
  );
});

CryptocurrencyTile.displayName = 'CryptocurrencyTile';
