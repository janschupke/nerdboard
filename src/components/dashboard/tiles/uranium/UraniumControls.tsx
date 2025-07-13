import React from 'react';
import { URANIUM_UI_CONFIG } from './constants';
import type { UraniumTimeRange } from './types';
import type { TileSize } from '../../../../types/dashboard';

interface UraniumControlsProps {
  timeRange: UraniumTimeRange;
  onTimeRangeChange: (timeRange: UraniumTimeRange) => void;
  size: TileSize;
}

export const UraniumControls = React.memo<UraniumControlsProps>(({
  timeRange,
  onTimeRangeChange,
  size,
}) => {
  const getButtonSizeClass = () => {
    switch (size) {
      case 'small':
        return 'text-xs px-2 py-1';
      case 'medium':
        return 'text-sm px-3 py-1';
      case 'large':
        return 'text-sm px-3 py-2';
      default:
        return 'text-sm px-3 py-1';
    }
  };

  return (
    <div className="flex justify-center space-x-1">
      {URANIUM_UI_CONFIG.TIME_RANGES.map((range) => (
        <button
          key={range}
          onClick={() => onTimeRangeChange(range)}
          className={`${getButtonSizeClass()} rounded font-medium transition-colors ${
            timeRange === range
              ? 'bg-accent-primary text-accent-contrast'
              : 'bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary'
          }`}
          aria-label={`Select ${range} time range`}
        >
          {range}
        </button>
      ))}
    </div>
  );
});

UraniumControls.displayName = 'UraniumControls'; 
