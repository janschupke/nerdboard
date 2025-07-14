import React from 'react';
import { Icon } from '../ui/Icon';
import { LogButton } from './log/LogButton';

interface HeaderProps {
  isLogViewOpen: boolean;
  toggleLogView: () => void;
  refreshAllTiles: () => void;
  isRefreshing: boolean;
  toggleTheme: () => void;
  theme: string;
  toggleCollapse: () => void;
  tilesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isLogViewOpen,
  toggleLogView,
  refreshAllTiles,
  isRefreshing,
  toggleTheme,
  theme,
  toggleCollapse,
  tilesCount,
}) => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-surface-primary border-b border-theme-primary px-4 py-3 flex items-center justify-between h-16">
    <div className="flex items-center space-x-3">
      <button
        onClick={toggleCollapse}
        className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        <Icon name="menu" size="md" />
      </button>
      <h1 className="text-xl font-semibold text-theme-primary">Dashboard</h1>
    </div>
    <div className="flex items-center space-x-2">
      <LogButton isOpen={isLogViewOpen} onToggle={toggleLogView} />
      <button
        onClick={refreshAllTiles}
        disabled={isRefreshing}
        className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors disabled:opacity-50"
        aria-label="Refresh all tiles"
      >
        <Icon name="refresh" size="md" className={isRefreshing ? 'animate-spin' : ''} />
      </button>
      <button
        onClick={toggleTheme}
        className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-tertiary rounded-lg transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Icon name="sun" size="md" /> : <Icon name="moon" size="md" />}
      </button>
      <span className="text-sm text-theme-secondary">{tilesCount} tiles</span>
    </div>
  </header>
); 
