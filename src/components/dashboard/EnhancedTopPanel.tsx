import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { REFRESH_INTERVALS } from '../../utils/constants';

interface EnhancedTopPanelProps {
  onRefreshAll: () => void;
  isRefreshing?: boolean;
  lastRefreshTime?: Date;
}

export const EnhancedTopPanel: React.FC<EnhancedTopPanelProps> = ({
  onRefreshAll,
  isRefreshing = false,
  lastRefreshTime,
}) => {
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<number>(0);

  const calculateTimeUntilRefresh = useCallback(() => {
    if (!lastRefreshTime) {
      setTimeUntilRefresh(REFRESH_INTERVALS.TILE_DATA);
      return;
    }
    const now = Date.now();
    const nextRefresh = lastRefreshTime.getTime() + REFRESH_INTERVALS.TILE_DATA;
    const timeLeft = Math.max(0, nextRefresh - now);
    setTimeUntilRefresh(timeLeft);
  }, [lastRefreshTime]);

  useEffect(() => {
    calculateTimeUntilRefresh();
    const interval = setInterval(calculateTimeUntilRefresh, 1000);
    return () => clearInterval(interval);
  }, [calculateTimeUntilRefresh]);

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRefreshClick = useCallback(() => {
    onRefreshAll();
  }, [onRefreshAll]);

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Nerdboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Icon name="clock" className="w-4 h-4" aria-hidden="true" />
          <span
            tabIndex={0}
            aria-label="Next refresh countdown"
            title="Time until the next automatic data refresh"
          >
            Next refresh in: {formatTime(timeUntilRefresh)}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="flex items-center space-x-2"
          aria-label="Refresh all data"
          title="Refresh all dashboard data immediately"
        >
          <Icon
            name={isRefreshing ? 'loading' : 'refresh'}
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh All'}</span>
        </Button>
      </div>
    </div>
  );
};
