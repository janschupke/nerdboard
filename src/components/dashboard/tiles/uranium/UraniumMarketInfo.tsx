import React from 'react';
import { URANIUM_MARKET_INFO } from './constants';
import type { UraniumPriceData } from './types';
import type { TileSize } from '../../../../types/dashboard';

interface UraniumMarketInfoProps {
  uraniumData: UraniumPriceData;
  size: TileSize;
}

export const UraniumMarketInfo = React.memo<UraniumMarketInfoProps>(({ uraniumData, size }) => {
  const getTextSizeClass = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'medium':
        return 'text-sm';
      case 'large':
        return 'text-sm';
      default:
        return 'text-sm';
    }
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return value.toLocaleString();
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Volume */}
      <div className="text-center">
        <div className={`${getTextSizeClass()} text-theme-secondary`}>
          {URANIUM_MARKET_INFO.VOLUME_LABEL}
        </div>
        <div className={`${getTextSizeClass()} font-medium text-theme-primary`}>
          {formatNumber(uraniumData.volume)}
        </div>
      </div>

      {/* Supply */}
      <div className="text-center">
        <div className={`${getTextSizeClass()} text-theme-secondary`}>
          {URANIUM_MARKET_INFO.SUPPLY_LABEL}
        </div>
        <div className={`${getTextSizeClass()} font-medium text-theme-primary`}>
          {formatNumber(uraniumData.supply)}
        </div>
      </div>

      {/* Demand */}
      <div className="text-center">
        <div className={`${getTextSizeClass()} text-theme-secondary`}>
          {URANIUM_MARKET_INFO.DEMAND_LABEL}
        </div>
        <div className={`${getTextSizeClass()} font-medium text-theme-primary`}>
          {formatNumber(uraniumData.demand)}
        </div>
      </div>

      {/* Market Status */}
      <div className="text-center">
        <div className={`${getTextSizeClass()} text-theme-secondary`}>
          {URANIUM_MARKET_INFO.STATUS_LABEL}
        </div>
        <div className={`${getTextSizeClass()} font-medium text-success-600`}>
          {uraniumData.marketStatus || 'Active'}
        </div>
      </div>
    </div>
  );
});

UraniumMarketInfo.displayName = 'UraniumMarketInfo'; 
