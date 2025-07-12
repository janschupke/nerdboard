import { useState } from 'react';
import { useCryptocurrencyData } from './hooks/useCryptocurrencyData';
import { ChartComponent } from '../ChartComponent';
import { PriceDisplay } from '../../../ui/PriceDisplay';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { CRYPTO_UI_CONFIG, CRYPTO_CHART_CONFIG, CRYPTO_ERROR_MESSAGES } from './constants';
import type { CryptocurrencyTileProps, ChartPeriod } from './types';

export function CryptocurrencyTile({ size, config }: CryptocurrencyTileProps) {
  const { data, loading, error, refetch } = useCryptocurrencyData(config.refreshInterval);
  const [selectedCoin, setSelectedCoin] = useState<string>(config.selectedCoin || 'bitcoin');
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>(
    config.chartPeriod || CRYPTO_UI_CONFIG.DEFAULT_CHART_PERIOD
  );

  if (loading) {
    return <LoadingSkeleton tileSize={size} />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-error-600 mb-2">{CRYPTO_ERROR_MESSAGES.FETCH_FAILED}</p>
        <Button
          variant="primary"
          size="sm"
          onClick={refetch}
        >
          Retry
        </Button>
      </div>
    );
  }

  const topCoins = data.slice(0, CRYPTO_UI_CONFIG.TOP_COINS_DISPLAY_LIMIT);
  const selectedCoinData = data.find(coin => coin.id === selectedCoin);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Cryptocurrency Market</h2>
        <select
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {topCoins.map(coin => (
            <option key={coin.id} value={coin.id}>
              {coin.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex-1 p-4">
        {selectedCoinData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Price</p>
                <PriceDisplay 
                  price={selectedCoinData.current_price}
                  changePercentage={selectedCoinData.price_change_percentage_24h}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Market Cap</p>
                <p className="text-lg font-semibold">
                  ${selectedCoinData.market_cap.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {CRYPTO_UI_CONFIG.CHART_PERIODS.map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-3 py-1 text-xs rounded ${
                    chartPeriod === period
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            
            <ChartComponent
              data={[]} // Will be populated with historical data in future implementation
              title={`${selectedCoinData.name} Price (${chartPeriod})`}
              color={CRYPTO_CHART_CONFIG.COLORS.PRIMARY}
              height={size === 'large' ? CRYPTO_UI_CONFIG.CHART_HEIGHTS.LARGE : CRYPTO_UI_CONFIG.CHART_HEIGHTS.MEDIUM}
            />
          </div>
        )}
      </div>
    </div>
  );
} 
