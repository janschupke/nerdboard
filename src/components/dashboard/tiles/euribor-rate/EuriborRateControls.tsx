import React from 'react';
import { EURIBOR_RATE_UI_CONFIG, TIME_RANGE_CONFIG } from './constants';
import type { TimeRange } from './types';

interface EuriborRateControlsProps {
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const EuriborRateControls: React.FC<EuriborRateControlsProps> = ({
  timeRange,
  onTimeRangeChange,
  onRefresh,
  loading = false
}) => {
  const handleTimeRangeClick = (newTimeRange: TimeRange) => {
    if (!loading && newTimeRange !== timeRange) {
      onTimeRangeChange(newTimeRange);
    }
  };

  const handleRefreshClick = () => {
    if (!loading) {
      onRefresh();
    }
  };

  return (
    <div className="euribor-rate-controls">
      <div className="time-range-controls">
        {EURIBOR_RATE_UI_CONFIG.TIME_RANGES.map((range) => (
          <button
            key={range}
            onClick={() => handleTimeRangeClick(range)}
            className={`time-range-button ${timeRange === range ? 'active' : ''} ${loading ? 'disabled' : ''}`}
            disabled={loading}
            aria-label={`View ${TIME_RANGE_CONFIG[range].label} data`}
          >
            {TIME_RANGE_CONFIG[range].label}
          </button>
        ))}
      </div>
      <div className="refresh-control">
        <button
          onClick={handleRefreshClick}
          className={`refresh-button ${loading ? 'loading' : ''}`}
          disabled={loading}
          aria-label="Refresh Euribor rate data"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}; 
