
import { TileType } from '../../types/dashboard';
import { Button } from '../ui/Button';
import { SidebarItem } from './SidebarItem';
import { useDashboard } from '../../hooks/useDashboard';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { sidebarStorage } from '../../utils/sidebarStorage';

interface SidebarProps {
  onToggle: () => void;
}

export function Sidebar({ onToggle }: SidebarProps) {
  const { isTileActive, addTile, removeTile, isInitialized } = useDashboard();
  const [storageError, setStorageError] = useState<string | null>(null);

  const availableTiles = useMemo(() => [
    {
      type: TileType.CRYPTOCURRENCY,
      name: 'Cryptocurrency',
      description: 'Real-time cryptocurrency market data',
      icon: 'crypto',
    },
    {
      type: TileType.PRECIOUS_METALS,
      name: 'Precious Metals',
      description: 'Gold and silver price data',
      icon: 'metals',
    },
    {
      type: TileType.FEDERAL_FUNDS_RATE,
      name: 'Federal Funds Rate',
      description: 'Federal Reserve interest rate monitoring',
      icon: 'chart',
    },
    {
      type: TileType.EURIBOR_RATE,
      name: 'Euribor Rate',
      description: 'European interbank lending rate monitoring',
      icon: 'chart',
    },
    {
      type: TileType.WEATHER_HELSINKI,
      name: 'Helsinki Weather',
      description: 'Current weather conditions in Helsinki, Finland',
      icon: 'weather',
    },
    {
      type: TileType.WEATHER_PRAGUE,
      name: 'Prague Weather',
      description: 'Current weather conditions in Prague, Czech Republic',
      icon: 'weather',
    },
    {
      type: TileType.WEATHER_TAIPEI,
      name: 'Taipei Weather',
      description: 'Current weather conditions in Taipei, Taiwan',
      icon: 'weather',
    },
    {
      type: TileType.GDX_ETF,
      name: 'GDX ETF',
      description: 'VanEck Vectors Gold Miners ETF tracking',
      icon: 'chart',
    },
    {
      type: TileType.TIME_HELSINKI,
      name: 'Helsinki Time',
      description: 'Current time and timezone for Helsinki, Finland',
      icon: 'clock',
    },
    {
      type: TileType.TIME_PRAGUE,
      name: 'Prague Time',
      description: 'Current time and timezone for Prague, Czech Republic',
      icon: 'clock',
    },
    {
      type: TileType.TIME_TAIPEI,
      name: 'Taipei Time',
      description: 'Current time and timezone for Taipei, Taiwan',
      icon: 'clock',
    },
    {
      type: TileType.URANIUM,
      name: 'Uranium Price',
      description: 'Real-time uranium price tracking and market data',
      icon: 'chart',
    },
  ], []);

  const itemIds = useMemo(() => availableTiles.map(tile => tile.type), [availableTiles]);

  // Persist collapse state in localStorage
  const getInitialCollapsed = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-collapsed');
      return stored === 'true' ? true : false;
    }
    return false;
  };

  const handleSidebarToggle = useCallback((collapse: boolean) => {
    localStorage.setItem('sidebar-collapsed', collapse ? 'true' : 'false');
    onToggle();
  }, [onToggle]);

  const handleTileToggle = useCallback(async (tileType: TileType) => {
    if (isTileActive(tileType)) {
      await removeTile(tileType);
    } else {
      await addTile(tileType);
    }
  }, [isTileActive, addTile, removeTile]);

  const {
    selectedIndex,
    isSidebarCollapsed,
  } = useKeyboardNavigation<TileType>(
    itemIds,
    handleTileToggle,
    handleSidebarToggle,
    getInitialCollapsed()
  );

  // Load sidebar collapse state on mount
  useEffect(() => {
    const loadCollapseState = async () => {
      if (!isInitialized) return;
      
      try {
        const savedState = await sidebarStorage.loadSidebarState();
        if (savedState && savedState.isCollapsed !== isSidebarCollapsed) {
          // Trigger sidebar toggle if state doesn't match
          handleSidebarToggle(savedState.isCollapsed);
        }
      } catch (error) {
        console.error('Failed to load sidebar collapse state:', error);
        setStorageError('Failed to load sidebar preferences');
      }
    };

    loadCollapseState();
  }, [isInitialized, isSidebarCollapsed, handleSidebarToggle]);

  // Save sidebar collapse state when it changes
  useEffect(() => {
    const saveCollapseState = async () => {
      if (!isInitialized) return;
      
      try {
        const currentState = await sidebarStorage.loadSidebarState();
        if (currentState) {
          await sidebarStorage.saveSidebarState({
            ...currentState,
            isCollapsed: isSidebarCollapsed,
            lastUpdated: Date.now(),
          });
        }
      } catch (error) {
        console.error('Failed to save sidebar collapse state:', error);
        setStorageError('Failed to save sidebar preferences');
      }
    };

    saveCollapseState();
  }, [isSidebarCollapsed, isInitialized]);

  // Announce selection changes to screen readers
  useEffect(() => {
    const selectedItem = availableTiles[selectedIndex];
    if (selectedItem) {
      const announcement = `Selected ${selectedItem.name} tile`;
      const liveRegion = document.getElementById('keyboard-announcements');
      if (liveRegion) {
        liveRegion.textContent = announcement;
      }
    }
  }, [selectedIndex, availableTiles]);

  return (
    <>
      <aside
        role="complementary"
        aria-label="Tile catalog sidebar"
        className={`h-full bg-surface-primary shadow-lg border-r border-theme-primary transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarCollapsed ? 'w-0' : 'w-64'}`}
      >
        <div className="flex flex-col h-full w-64">
          {/* Tile Catalog */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold text-theme-primary mb-4" id="tiles-heading">
              Available Tiles ({availableTiles.length})
            </h2>
            {storageError && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {storageError}
                <button
                  onClick={() => setStorageError(null)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}
            <div
              className="space-y-3"
              role="listbox"
              aria-labelledby="tiles-heading"
              aria-label="Available dashboard tiles"
            >
              {availableTiles.map((tile, idx) => (
                <SidebarItem
                  key={tile.type}
                  tileType={tile.type}
                  name={tile.name}
                  icon={tile.icon}
                  isActive={isTileActive(tile.type)}
                  isSelected={selectedIndex === idx}
                  onClick={() => handleTileToggle(tile.type)}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-theme-primary">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => handleSidebarToggle(!isSidebarCollapsed)}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? 'Expand' : 'Close'}
            </Button>
          </div>
        </div>
      </aside>
      {/* Live region for screen reader announcements */}
      <div id="keyboard-announcements" className="sr-only" aria-live="polite" aria-atomic="true" />
    </>
  );
}
