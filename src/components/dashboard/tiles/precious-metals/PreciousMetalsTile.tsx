import { useState } from 'react';
import { usePreciousMetalsData } from './hooks/usePreciousMetalsData';
import { ChartComponent } from '../ChartComponent';
import { PriceDisplay } from '../../../ui/PriceDisplay';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { Button } from '../../../ui/Button';
import { 
  PRECIOUS_METALS_UI_CONFIG, 
  PRECIOUS_METALS_CHART_CONFIG, 
  PRECIOUS_METALS_ERROR_MESSAGES 
} from './constants';
import type { PreciousMetalsTileProps, ChartPeriod, MetalType } from './types';

export function PreciousMetalsTile({ size, config }: PreciousMetalsTileProps) {
  const { data, loading, error, refetch } = usePreciousMetalsData(config.refreshInterval);
  const [selectedMetal, setSelectedMetal] = useState<MetalType>(
    config.selectedMetal || PRECIOUS_METALS_UI_CONFIG.DEFAULT_METAL
  );
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>(
    config.chartPeriod || PRECIOUS_METALS_UI_CONFIG.DEFAULT_CHART_PERIOD
  );

  if (loading) {
    return <LoadingSkeleton tileSize={size} />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-error-600 mb-2">{PRECIOUS_METALS_ERROR_MESSAGES.FETCH_FAILED}</p>
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

  if (!data) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">{PRECIOUS_METALS_ERROR_MESSAGES.NO_DATA_AVAILABLE}</p>
      </div>
    );
  }

  const selectedMetalData = data[selectedMetal];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Precious Metals</h2>
        <div className="flex space-x-2">
          {PRECIOUS_METALS_UI_CONFIG.AVAILABLE_METALS.map((metal) => (
            <button
              key={metal}
              onClick={() => setSelectedMetal(metal)}
              className={`px-3 py-1 text-xs rounded capitalize ${
                selectedMetal === metal
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {metal}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Price</p>
              <PriceDisplay 
                price={selectedMetalData.price}
                change={selectedMetalData.change_24h}
                changePercentage={selectedMetalData.change_percentage_24h}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">24h Change</p>
              <PriceDisplay 
                price={selectedMetalData.change_24h}
                changePercentage={selectedMetalData.change_percentage_24h}
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            {PRECIOUS_METALS_UI_CONFIG.CHART_PERIODS.map((period) => (
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
            title={`${selectedMetal.charAt(0).toUpperCase() + selectedMetal.slice(1)} Price (${chartPeriod})`}
            color={selectedMetal === 'gold' 
              ? PRECIOUS_METALS_CHART_CONFIG.COLORS.GOLD 
              : PRECIOUS_METALS_CHART_CONFIG.COLORS.SILVER}
            height={size === 'large' 
              ? PRECIOUS_METALS_UI_CONFIG.CHART_HEIGHTS.LARGE 
              : PRECIOUS_METALS_UI_CONFIG.CHART_HEIGHTS.MEDIUM}
          />
        </div>
      </div>
    </div>
  );
} 
