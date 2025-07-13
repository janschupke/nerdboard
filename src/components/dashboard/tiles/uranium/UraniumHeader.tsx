import React from 'react';
import { PriceDisplay } from '../../../ui/PriceDisplay';
import { Icon } from '../../../ui/Icon';
import type { UraniumPriceData } from './types';
import type { TileSize } from '../../../../types/dashboard';

interface UraniumHeaderProps {
  uraniumData: UraniumPriceData;
  size: TileSize;
}

export const UraniumHeader = React.memo<UraniumHeaderProps>(({ uraniumData, size }) => {
  const isPositive = uraniumData.change >= 0;

  const getPriceSizeClass = () => {
    switch (size) {
      case 'small':
        return 'text-lg';
      case 'medium':
        return 'text-xl';
      case 'large':
        return 'text-2xl';
      default:
        return 'text-xl';
    }
  };

  const getChangeSizeClass = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'medium':
        return 'text-sm';
      case 'large':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  return (
    <div className="flex items-center justify-between">
      {/* Price Display */}
      <div className="flex-1">
        <div className={`font-bold ${getPriceSizeClass()} text-theme-primary`}>
          <PriceDisplay
            price={uraniumData.spotPrice}
            change={uraniumData.change}
            changePercentage={uraniumData.changePercent}
            currency="$"
          />
        </div>
        <div className={`${getChangeSizeClass()} text-theme-secondary`}>Uranium Spot Price</div>
      </div>

      {/* Change Indicator */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Icon
            name={isPositive ? 'trending-up' : 'trending-down'}
            size="sm"
            className={isPositive ? 'text-success-600' : 'text-error-600'}
          />
          <span
            className={`${getChangeSizeClass()} font-medium ${
              isPositive ? 'text-success-600' : 'text-error-600'
            }`}
          >
            {isPositive ? '+' : ''}
            {uraniumData.change.toFixed(2)}
          </span>
        </div>
        <div className={`${getChangeSizeClass()} text-theme-muted`}>
          ({isPositive ? '+' : ''}
          {uraniumData.changePercent.toFixed(2)}%)
        </div>
      </div>
    </div>
  );
});

UraniumHeader.displayName = 'UraniumHeader';
