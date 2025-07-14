import { TileType } from '../../types/dashboard';
import { SidebarItem } from './SidebarItem';
import { useDashboard } from '../../hooks/useDashboard';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useEffect, useMemo, useCallback } from 'react';

interface SidebarProps {
  onToggle: () => void;
}

export function Sidebar({ onToggle }: SidebarProps) {
  const { isTileActive, addTile, removeTile, state } = useDashboard();

  const availableTiles = useMemo(
    () => [
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
    ],
    [],
  );

  const itemIds = useMemo(() => availableTiles.map((tile) => tile.type), [availableTiles]);

  const handleTileToggle = useCallback(
    async (tileType: TileType) => {
      if (isTileActive(tileType)) {
        await removeTile(tileType);
      } else {
        await addTile(tileType);
      }
    },
    [isTileActive, addTile, removeTile],
  );

  const { selectedIndex } = useKeyboardNavigation<TileType>(
    itemIds,
    handleTileToggle,
    onToggle,
    state.layout.isCollapsed,
  );

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
        className={`h-full bg-surface-primary shadow-lg border-r border-theme-primary transition-all duration-300 ease-in-out flex-shrink-0 ${state.layout.isCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}
      >
        <div
          className={`flex flex-col h-full transition-all duration-300 ${state.layout.isCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}
        >
          {/* Fixed Header */}
          {!state.layout.isCollapsed && (
            <div className="flex-shrink-0 p-4 border-b border-theme-primary">
              <h2 className="text-lg font-semibold text-theme-primary" id="tiles-heading">
                Available Tiles ({availableTiles.length})
              </h2>
            </div>
          )}

          {/* Scrollable Content */}
          {!state.layout.isCollapsed && (
            <div className="relative flex-1 p-4 overflow-y-auto scrollbar-hide">
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
              {/* Fade-out effect at the bottom */}
              <div className="pointer-events-none absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-surface-primary to-transparent" />
            </div>
          )}
        </div>
      </aside>
      {/* Live region for screen reader announcements */}
      <div id="keyboard-announcements" className="sr-only" aria-live="polite" aria-atomic="true" />
    </>
  );
}
