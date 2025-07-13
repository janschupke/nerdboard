import React, { useState, useMemo } from 'react';
import { useCryptocurrencyData } from './hooks/useCryptocurrencyData';
import { ChartComponent } from '../ChartComponent';
import { PriceDisplay } from '../../../ui/PriceDisplay';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { CRYPTO_UI_CONFIG, CRYPTO_CHART_CONFIG, CRYPTO_ERROR_MESSAGES } from './constants';
import type { CryptocurrencyTileProps, ChartPeriod } from './types';

export const CryptocurrencyTile = React.memo<CryptocurrencyTileProps>(({ size, config }) => {
  const { data, loading, error, refetch } = useCryptocurrencyData(config.refreshInterval);
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

  if (loading) {
    const tileSize = typeof size === 'string' ? size : 'medium';
    return <LoadingSkeleton tileSize={tileSize as 'small' | 'medium' | 'large'} />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-error-600 mb-2">{CRYPTO_ERROR_MESSAGES.FETCH_FAILED}</p>
        <Button variant="primary" size="sm" onClick={refetch}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-theme-muted">No cryptocurrency data available</p>
      </div>
    );
  }

  return (
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
              changePercentage={selectedCoinData.price_change_percentage_24h}
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
  );
});

CryptocurrencyTile.displayName = 'CryptocurrencyTile';
