import React, { useMemo } from 'react';

interface EnhancedTopPanelProps {
  onRefreshAll: () => void;
  isRefreshing: boolean;
  lastRefreshTime?: Date;
}

export const EnhancedTopPanel = React.memo<EnhancedTopPanelProps>(({ 
  onRefreshAll, 
  isRefreshing, 
  lastRefreshTime 
}) => {
  // Memoize formatted time
  const formattedTime = useMemo(() => {
    if (!lastRefreshTime) return 'Never';
    return lastRefreshTime.toLocaleTimeString();
  }, [lastRefreshTime]);

  // Memoize panel classes
  const panelClasses = useMemo(() => {
    return 'bg-surface-primary border-b border-surface-tertiary p-4 flex items-center justify-between';
  }, []);

  return (
    <header className={panelClasses}>
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-theme-primary">Nerdboard</h1>
        <div className="text-sm text-theme-secondary">
          Last updated: {formattedTime}
        </div>
      </div>
      <button
        onClick={onRefreshAll}
        disabled={isRefreshing}
        className="px-4 py-2 bg-accent-primary text-accent-inverse rounded-md hover:bg-accent-hover disabled:opacity-50"
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh All'}
      </button>
    </header>
  );
});
