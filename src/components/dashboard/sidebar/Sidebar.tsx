import type { TileType } from '../../../types/dashboard';
import { SidebarItem } from './SidebarItem';
import { useDashboard } from '../useDashboard';
import { useKeyboardNavigation } from '../../../hooks/useKeyboardNavigation';
import { useEffect, useMemo, useCallback } from 'react';
import { TILE_CATALOG } from '../generic-tile/TileFactoryRegistry';

interface SidebarProps {
  onToggle: () => void;
}

export function Sidebar({ onToggle }: SidebarProps) {
  const { isTileActive, addTile, removeTile, state } = useDashboard();

  // Use TILE_CATALOG for available tiles
  const availableTiles = useMemo(
    () =>
      TILE_CATALOG.map((entry) => {
        // Prefer static meta, fallback to getMeta
        const meta = entry.meta || (entry.getMeta ? entry.getMeta() : { title: '', icon: '' });
        return {
          type: entry.type,
          name: meta.title,
          icon: meta.icon,
        };
      }),
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
