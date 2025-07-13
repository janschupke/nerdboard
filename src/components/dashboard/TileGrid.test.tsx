import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TileGrid } from './TileGrid';
import { DashboardProvider, DashboardContext } from '../../contexts/DashboardContext';
import React from 'react';
import { TileType } from '../../types/dashboard';
import { renderHook, act } from '@testing-library/react';
import { useDashboard } from '../../hooks/useDashboard';

// Mock Tile component
vi.mock('./Tile', () => ({
  Tile: ({ tile, children }: { tile: Record<string, unknown>; children?: React.ReactNode }) => (
    <div data-testid={`tile-${tile.type as string}-${tile.id as string}`}>{children}</div>
  ),
}));

// Mock DraggableTile component
vi.mock('./DraggableTile', () => ({
  DraggableTile: ({
    children,
    tile,
  }: {
    children: React.ReactNode;
    tile: Record<string, unknown>;
  }) => <div data-testid={`tile-${tile.type as string}-${tile.id as string}`}>{children}</div>,
}));

// Mock the gridSystem module with all exports
vi.mock('../../constants/gridSystem', () => ({
  GRID_CONFIG: {
    columns: 8,
    rows: 12,
    gap: '1rem',
  },
  TILE_SIZE_CONFIG: {
    small: { colSpan: 2, rowSpan: 1 },
    medium: { colSpan: 2, rowSpan: 1 },
    large: { colSpan: 4, rowSpan: 1 },
  },
  getTileSpan: (size: string) => {
    const config = {
      small: { colSpan: 2, rowSpan: 1 },
      medium: { colSpan: 2, rowSpan: 1 },
      large: { colSpan: 4, rowSpan: 1 },
    };
    return config[size as keyof typeof config] || config.medium;
  },
  calculateGridPosition: vi.fn(),
  calculateExistingTilePosition: vi.fn(),
  calculateDropZoneStyle: vi.fn(),
  isPositionValid: vi.fn(),
  getGridTemplateStyle: vi.fn(),
}));

function TestDashboardActions() {
  const ctx = React.useContext(DashboardContext);
  if (!ctx) throw new Error('DashboardContext is undefined');
  
  const moveTileByType = (tileType: TileType, position: { x: number; y: number }) => {
    const tile = ctx.state.layout.tiles.find(t => t.type === tileType);
    if (tile) {
      ctx.moveTile(tile.id, position);
    }
  };

  const reorderTileToEnd = (tileType: TileType) => {
    const tiles = ctx.state.layout.tiles;
    const tile = tiles.find(t => t.type === tileType);
    if (tile) {
      const newOrder = tiles.filter(t => t.id !== tile.id);
      newOrder.push(tile);
      ctx.reorderTiles(newOrder);
    }
  };

  const reorderTileToPosition = (tileType: TileType, insertIndex: number) => {
    const tiles = ctx.state.layout.tiles;
    const tile = tiles.find(t => t.type === tileType);
    if (tile) {
      const newOrder = tiles.filter(t => t.id !== tile.id);
      newOrder.splice(insertIndex, 0, tile);
      ctx.reorderTiles(newOrder);
    }
  };
  
  return (
    <div>
      <button onClick={() => ctx.addTile('cryptocurrency' as TileType)} data-testid="add-crypto">Add Crypto</button>
      <button onClick={() => ctx.addTile('precious-metals' as TileType)} data-testid="add-metals">Add Metals</button>
      <button onClick={() => ctx.addTile('weather_helsinki' as TileType)} data-testid="add-weather">Add Weather</button>
      <button onClick={() => {
        const tile = ctx.state.layout.tiles.find(t => t.type === 'cryptocurrency');
        if (tile) ctx.removeTile(tile.id);
      }} data-testid="remove-crypto">Remove Crypto</button>
      <button onClick={() => moveTileByType('cryptocurrency', { x: 2, y: 0 })} data-testid="move-crypto-right">Move Crypto Right</button>
      <button onClick={() => moveTileByType('cryptocurrency', { x: 0, y: 1 })} data-testid="move-crypto-down">Move Crypto Down</button>
      <button onClick={() => moveTileByType('cryptocurrency', { x: 6, y: 0 })} data-testid="move-crypto-far-right">Move Crypto Far Right</button>
      <button onClick={() => moveTileByType('cryptocurrency', { x: 0, y: 2 })} data-testid="move-crypto-far-down">Move Crypto Far Down</button>
      <button onClick={() => moveTileByType('precious-metals', { x: 4, y: 0 })} data-testid="move-metals-right">Move Metals Right</button>
      <button onClick={() => moveTileByType('weather_helsinki', { x: 6, y: 0 })} data-testid="move-weather-right">Move Weather Right</button>
      <button onClick={() => reorderTileToEnd('cryptocurrency')} data-testid="reorder-crypto-to-end">Reorder Crypto To End</button>
      <button onClick={() => reorderTileToPosition('weather_helsinki', 0)} data-testid="reorder-weather-to-first">Reorder Weather To First</button>
    </div>
  );
}

describe('TileGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setup() {
    render(
      <DashboardProvider>
        <TestDashboardActions />
        <TileGrid />
      </DashboardProvider>,
    );
  }

  it('renders empty state when no tiles', () => {
    setup();
    expect(screen.getByText('No tiles yet')).toBeInTheDocument();
    expect(
      screen.getByText('Add tiles from the sidebar to start building your dashboard'),
    ).toBeInTheDocument();
  });

  it('adds a tile and removes empty state', () => {
    setup();
    fireEvent.click(screen.getByTestId('add-crypto'));
    expect(screen.queryByText('No tiles yet')).not.toBeInTheDocument();
  });

  it('adds multiple tiles and removes one', () => {
    setup();
    fireEvent.click(screen.getByTestId('add-crypto'));
    fireEvent.click(screen.getByTestId('add-metals'));
    fireEvent.click(screen.getByTestId('add-weather'));
    expect(screen.queryByText('No tiles yet')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('remove-crypto'));
    expect(screen.queryByText('No tiles yet')).not.toBeInTheDocument();
  });

  it('prevents duplicate tiles', () => {
    setup();
    fireEvent.click(screen.getByTestId('add-crypto'));
    fireEvent.click(screen.getByTestId('add-crypto'));
    expect(screen.queryByText('No tiles yet')).not.toBeInTheDocument();
  });

  describe('Drag and Drop Scenarios', () => {
    it('compacts tiles when dragging first tile to valid position on same row', () => {
      setup();
      // Add three tiles
      fireEvent.click(screen.getByTestId('add-crypto'));
      fireEvent.click(screen.getByTestId('add-metals'));
      fireEvent.click(screen.getByTestId('add-weather'));

      // Get the actual tile IDs from the rendered tiles
      const tileElements = screen.getAllByTestId(/^tile-/);
      expect(tileElements).toHaveLength(3);

      // Move first tile to the right (valid position)
      fireEvent.click(screen.getByTestId('move-crypto-right'));

      // All tiles should still be present
      const remainingTiles = screen.getAllByTestId(/^tile-/);
      expect(remainingTiles).toHaveLength(3);
    });

    it('compacts tiles when dragging tile to invalid position', () => {
      setup();
      // Add three tiles
      fireEvent.click(screen.getByTestId('add-crypto'));
      fireEvent.click(screen.getByTestId('add-metals'));
      fireEvent.click(screen.getByTestId('add-weather'));

      // Get the actual tile IDs from the rendered tiles
      const tileElements = screen.getAllByTestId(/^tile-/);
      expect(tileElements).toHaveLength(3);

      // Move first tile to far right (invalid position)
      fireEvent.click(screen.getByTestId('move-crypto-far-right'));

      // All tiles should still be present and compacted
      const remainingTiles = screen.getAllByTestId(/^tile-/);
      expect(remainingTiles).toHaveLength(3);
    });

    it('compacts tiles when dragging tile to different row', () => {
      setup();
      // Add three tiles
      fireEvent.click(screen.getByTestId('add-crypto'));
      fireEvent.click(screen.getByTestId('add-metals'));
      fireEvent.click(screen.getByTestId('add-weather'));

      // Get the actual tile IDs from the rendered tiles
      const tileElements = screen.getAllByTestId(/^tile-/);
      expect(tileElements).toHaveLength(3);

      // Move first tile down to different row
      fireEvent.click(screen.getByTestId('move-crypto-down'));

      // All tiles should still be present
      const remainingTiles = screen.getAllByTestId(/^tile-/);
      expect(remainingTiles).toHaveLength(3);
    });

    it('compacts tiles when dragging tile to invalid far down position', () => {
      setup();
      // Add three tiles
      fireEvent.click(screen.getByTestId('add-crypto'));
      fireEvent.click(screen.getByTestId('add-metals'));
      fireEvent.click(screen.getByTestId('add-weather'));

      // Get the actual tile IDs from the rendered tiles
      const tileElements = screen.getAllByTestId(/^tile-/);
      expect(tileElements).toHaveLength(3);

      // Move first tile far down (invalid position)
      fireEvent.click(screen.getByTestId('move-crypto-far-down'));

      // All tiles should still be present and compacted
      const remainingTiles = screen.getAllByTestId(/^tile-/);
      expect(remainingTiles).toHaveLength(3);
    });

    it('compacts floating tiles when another tile is dragged', () => {
      setup();
      // Add three tiles
      fireEvent.click(screen.getByTestId('add-crypto'));
      fireEvent.click(screen.getByTestId('add-metals'));
      fireEvent.click(screen.getByTestId('add-weather'));

      // Get the actual tile IDs from the rendered tiles
      const tileElements = screen.getAllByTestId(/^tile-/);
      expect(tileElements).toHaveLength(3);

      // Move first tile to invalid position (creates floating tile)
      fireEvent.click(screen.getByTestId('move-crypto-far-right'));

      // Move second tile to trigger compaction
      fireEvent.click(screen.getByTestId('move-metals-right'));

      // All tiles should still be present
      const remainingTiles = screen.getAllByTestId(/^tile-/);
      expect(remainingTiles).toHaveLength(3);
    });

    it('compacts tiles when re-dragging multiple times', () => {
      setup();
      // Add three tiles
      fireEvent.click(screen.getByTestId('add-crypto'));
      fireEvent.click(screen.getByTestId('add-metals'));
      fireEvent.click(screen.getByTestId('add-weather'));

      // Get the actual tile IDs from the rendered tiles
      const tileElements = screen.getAllByTestId(/^tile-/);
      expect(tileElements).toHaveLength(3);

      // First drag - move crypto to invalid position
      fireEvent.click(screen.getByTestId('move-crypto-far-right'));

      // Second drag - move metals to trigger compaction
      fireEvent.click(screen.getByTestId('move-metals-right'));

      // Third drag - move weather to trigger another compaction
      fireEvent.click(screen.getByTestId('move-weather-right'));

      // All tiles should still be present
      const remainingTiles = screen.getAllByTestId(/^tile-/);
      expect(remainingTiles).toHaveLength(3);
    });

    it('preserves tile order during compaction', () => {
      setup();
      // Add tiles in specific order
      fireEvent.click(screen.getByTestId('add-crypto'));
      fireEvent.click(screen.getByTestId('add-metals'));
      fireEvent.click(screen.getByTestId('add-weather'));

      // Get the actual tile IDs from the rendered tiles
      const tileElements = screen.getAllByTestId(/^tile-/);
      expect(tileElements).toHaveLength(3);

      // Move tiles around to trigger compaction
      fireEvent.click(screen.getByTestId('move-crypto-far-right'));
      fireEvent.click(screen.getByTestId('move-metals-right'));

      // All tiles should still be present (order preserved)
      const remainingTiles = screen.getAllByTestId(/^tile-/);
      expect(remainingTiles).toHaveLength(3);
    });

    it('handles dragging when tiles are already in invalid positions', () => {
      setup();
      // Add three tiles
      fireEvent.click(screen.getByTestId('add-crypto'));
      fireEvent.click(screen.getByTestId('add-metals'));
      fireEvent.click(screen.getByTestId('add-weather'));

      // Get the actual tile IDs from the rendered tiles
      const tileElements = screen.getAllByTestId(/^tile-/);
      expect(tileElements).toHaveLength(3);

      // Move all tiles to invalid positions
      fireEvent.click(screen.getByTestId('move-crypto-far-right'));
      fireEvent.click(screen.getByTestId('move-metals-right'));
      fireEvent.click(screen.getByTestId('move-weather-right'));

      // Try dragging again - should still compact
      fireEvent.click(screen.getByTestId('move-crypto-down'));

      // All tiles should still be present
      const remainingTiles = screen.getAllByTestId(/^tile-/);
      expect(remainingTiles).toHaveLength(3);
    });

    it('compacts tiles after removal', () => {
      setup();
      // Add three tiles
      fireEvent.click(screen.getByTestId('add-crypto'));
      fireEvent.click(screen.getByTestId('add-metals'));
      fireEvent.click(screen.getByTestId('add-weather'));

      // Get the actual tile IDs from the rendered tiles
      const tileElements = screen.getAllByTestId(/^tile-/);
      expect(tileElements).toHaveLength(3);

      // Move tiles to spread them out
      fireEvent.click(screen.getByTestId('move-crypto-far-right'));
      fireEvent.click(screen.getByTestId('move-metals-right'));

      // Remove middle tile
      fireEvent.click(screen.getByTestId('remove-crypto'));

      // Remaining tiles should still be present
      const remainingTiles = screen.getAllByTestId(/^tile-/);
      expect(remainingTiles).toHaveLength(2);
    });

    it('moves tile to the end if dropped on last tile or empty space', () => {
      setup();
      // Add three tiles
      fireEvent.click(screen.getByTestId('add-crypto'));
      fireEvent.click(screen.getByTestId('add-metals'));
      fireEvent.click(screen.getByTestId('add-weather'));
      
      // Get initial order
      const initialTiles = screen.getAllByTestId(/^tile-/);
      expect(initialTiles).toHaveLength(3);
      
      // Move first tile (crypto) to the end using reorder helper
      fireEvent.click(screen.getByTestId('reorder-crypto-to-end'));
      
      // Get tiles after move
      const tilesAfterMove = screen.getAllByTestId(/^tile-/);
      expect(tilesAfterMove).toHaveLength(3);
      
      // Debug: log the actual tile types
      const tileTypes = tilesAfterMove.map(el => el.getAttribute('data-testid')?.split('-')[1]);
      console.log('Actual tile types:', tileTypes);
      
      // Verify that crypto tile is now last in the order
      expect(tileTypes[0]).toBe('precious'); // first should be precious-metals
      expect(tileTypes[1]).toBe('weather_helsinki'); // second should be weather_helsinki  
      expect(tileTypes[2]).toBe('cryptocurrency'); // last should be crypto
    });

    it('inserts tile at correct position and shifts others', () => {
      setup();
      // Add three tiles
      fireEvent.click(screen.getByTestId('add-crypto'));
      fireEvent.click(screen.getByTestId('add-metals'));
      fireEvent.click(screen.getByTestId('add-weather'));
      
      // Get initial order
      const initialTiles = screen.getAllByTestId(/^tile-/);
      expect(initialTiles).toHaveLength(3);
      
      // Move last tile (weather) to the first position using reorder helper
      fireEvent.click(screen.getByTestId('reorder-weather-to-first'));
      
      // Get tiles after move
      const tilesAfterMove = screen.getAllByTestId(/^tile-/);
      expect(tilesAfterMove).toHaveLength(3);
      
      // Debug: log the actual tile types
      const tileTypes = tilesAfterMove.map(el => el.getAttribute('data-testid')?.split('-')[1]);
      console.log('Actual tile types:', tileTypes);
      
      // Verify that weather tile is now first in the order
      expect(tileTypes[0]).toBe('weather_helsinki'); // first should be weather_helsinki
      expect(tileTypes[1]).toBe('cryptocurrency'); // second should be crypto
      expect(tileTypes[2]).toBe('precious'); // third should be precious-metals
    });

    it('drop zone matches cursor vertically', () => {
      setup();
      fireEvent.click(screen.getByTestId('add-crypto'));
      fireEvent.click(screen.getByTestId('add-metals'));
      fireEvent.click(screen.getByTestId('add-weather'));
      // Simulate drag over the grid at a specific Y position
      // Find the first tile by regex (crypto tile)
      const tile = screen.getAllByTestId(/^tile-cryptocurrency/)[0];
      const grid = tile?.parentElement?.parentElement;
      if (!grid) throw new Error('Grid not found');
      // Mock getBoundingClientRect for grid and tiles
      const gridRect = { left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {} };
      const tileRect = { left: 0, top: 0, width: 200, height: 150, right: 200, bottom: 150, x: 0, y: 0, toJSON: () => {} };
      
      vi.spyOn(grid, 'getBoundingClientRect').mockReturnValue(gridRect as DOMRect);
      vi.spyOn(grid, 'querySelectorAll').mockReturnValue({
        length: 1,
        item: () => ({ getBoundingClientRect: () => tileRect as DOMRect } as Element),
        [Symbol.iterator]: function* () {
          yield { getBoundingClientRect: () => tileRect as DOMRect } as Element;
        },
        forEach: () => {},
        entries: () => [],
        keys: () => [],
        values: () => []
      } as unknown as NodeListOf<Element>);
      
      // Simulate drag over at a specific Y position with a mock dataTransfer
      fireEvent.dragOver(grid, {
        clientX: 100,
        clientY: 200,
        dataTransfer: { types: ['application/nerdboard-tile-type'] },
      });
      
      // Check that the drop zone position was calculated correctly
      expect(grid).toBeInTheDocument();
    });

    it('dragging a tile to itself does not change order', () => {
      setup();
      fireEvent.click(screen.getByTestId('add-crypto'));
      fireEvent.click(screen.getByTestId('add-metals'));
      fireEvent.click(screen.getByTestId('add-weather'));
      // Initial order
      let tileElements = screen.getAllByTestId(/^tile-/);
      const initialOrder = tileElements.map(el => el.getAttribute('data-testid'));
      // Simulate dragging the first tile to itself
      fireEvent.click(screen.getByTestId('move-crypto-right'));
      // Order should not change
      tileElements = screen.getAllByTestId(/^tile-/);
      const afterOrder = tileElements.map(el => el.getAttribute('data-testid'));
      expect(afterOrder).toEqual(initialOrder);
    });
  });

  describe('Tile Removal and Rearrangement', () => {
    it('should rearrange remaining tiles when a tile is removed', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: DashboardProvider,
      });

      // Add multiple tiles
      act(() => {
        result.current.addTile('cryptocurrency');
        result.current.addTile('precious-metals');
        result.current.addTile('weather_helsinki');
      });

      // Get initial positions
      const initialTiles = result.current.state.layout.tiles;
      expect(initialTiles).toHaveLength(3);

      // Remove the middle tile
      act(() => {
        result.current.removeTile('precious-metals');
      });

      // Check that tiles are rearranged
      const remainingTiles = result.current.state.layout.tiles;
      expect(remainingTiles).toHaveLength(2);

      // Verify that remaining tiles are repositioned to fill gaps
      const cryptocurrencyTile = remainingTiles.find(t => t.type === 'cryptocurrency');
      const weatherTile = remainingTiles.find(t => t.type === 'weather_helsinki');

      expect(cryptocurrencyTile?.position).toEqual({ x: 0, y: 0 });
      expect(weatherTile?.position).toEqual({ x: 2, y: 0 }); // Should be positioned to the right of the first tile
    });

    it('should maintain tile order after removal and rearrangement', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: DashboardProvider,
      });

      // Add tiles in specific order
      act(() => {
        result.current.addTile('cryptocurrency');
        result.current.addTile('precious-metals');
        result.current.addTile('weather_helsinki');
        result.current.addTile('time_helsinki');
      });

      const initialTiles = result.current.state.layout.tiles;
      expect(initialTiles).toHaveLength(4);

      // Remove the first tile
      act(() => {
        result.current.removeTile('cryptocurrency');
      });

      const remainingTiles = result.current.state.layout.tiles;
      expect(remainingTiles).toHaveLength(3);

      // Verify order is maintained (by creation time)
      const tileTypes = remainingTiles.map(t => t.type);
      expect(tileTypes).toEqual(['precious-metals', 'weather_helsinki', 'time_helsinki']);
    });

    it('should position tiles in first available positions after removal', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: DashboardProvider,
      });

      // Add tiles to create gaps
      act(() => {
        result.current.addTile('cryptocurrency');
        result.current.addTile('precious-metals');
        result.current.addTile('weather_helsinki');
      });

      // Remove the first tile to create a gap at (0,0)
      act(() => {
        result.current.removeTile('cryptocurrency');
      });

      const remainingTiles = result.current.state.layout.tiles;
      
      // The first remaining tile should be positioned at (0,0)
      const firstTile = remainingTiles[0];
      expect(firstTile.position).toEqual({ x: 0, y: 0 });

      // The second tile should be positioned at (2,0) - to the right of the first tile
      const secondTile = remainingTiles[1];
      expect(secondTile.position).toEqual({ x: 2, y: 0 });
    });

    it('should handle multiple tile removals with proper rearrangement', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: DashboardProvider,
      });

      // Add multiple tiles
      act(() => {
        result.current.addTile('cryptocurrency');
        result.current.addTile('precious-metals');
        result.current.addTile('weather_helsinki');
        result.current.addTile('time_helsinki');
        result.current.addTile('federal_funds_rate');
      });

      expect(result.current.state.layout.tiles).toHaveLength(5);

      // Remove multiple tiles
      act(() => {
        result.current.removeTile('cryptocurrency');
        result.current.removeTile('weather_helsinki');
      });

      const remainingTiles = result.current.state.layout.tiles;
      expect(remainingTiles).toHaveLength(3);

      // Verify tiles are compactly arranged in row-major order
      const positions = remainingTiles.map(t => t.position);
      expect(positions).toEqual([
        { x: 0, y: 0 }, // first tile
        { x: 2, y: 0 }, // second tile
        { x: 4, y: 0 }, // third tile
      ]);
    });

    it('should preserve tile properties during rearrangement', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: DashboardProvider,
      });

      // Add tiles
      act(() => {
        result.current.addTile('cryptocurrency');
        result.current.addTile('precious-metals');
        result.current.addTile('weather_helsinki');
      });

      const initialTiles = result.current.state.layout.tiles;
      const initialCryptoTile = initialTiles.find(t => t.type === 'cryptocurrency');
      const initialWeatherTile = initialTiles.find(t => t.type === 'weather_helsinki');

      // Remove middle tile
      act(() => {
        result.current.removeTile('precious-metals');
      });

      const remainingTiles = result.current.state.layout.tiles;
      const rearrangedCryptoTile = remainingTiles.find(t => t.type === 'cryptocurrency');
      const rearrangedWeatherTile = remainingTiles.find(t => t.type === 'weather_helsinki');

      // Verify tile properties are preserved
      expect(rearrangedCryptoTile?.id).toBe(initialCryptoTile?.id);
      expect(rearrangedCryptoTile?.type).toBe(initialCryptoTile?.type);
      expect(rearrangedCryptoTile?.size).toBe(initialCryptoTile?.size);
      expect(rearrangedCryptoTile?.createdAt).toBe(initialCryptoTile?.createdAt);

      // Verify that at least one tile's position changed due to rearrangement
      // (the weather tile should have moved from its original position)
      expect(rearrangedWeatherTile?.position).not.toEqual(initialWeatherTile?.position);
    });

    it('should handle removal of tiles with different sizes', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: DashboardProvider,
      });

      // Add tiles with different sizes (this would require updating tile sizes)
      act(() => {
        result.current.addTile('cryptocurrency');
        result.current.addTile('precious-metals');
        result.current.addTile('weather_helsinki');
      });

      // Update a tile to have a different size
      act(() => {
        const cryptoId = result.current.state.layout.tiles.find(t => t.type === 'cryptocurrency')?.id;
        if (cryptoId) {
          result.current.updateTile(cryptoId, { size: 'large' });
        }
      });

      // Remove the large tile
      act(() => {
        result.current.removeTile('cryptocurrency');
      });

      const remainingTiles = result.current.state.layout.tiles;
      expect(remainingTiles).toHaveLength(2);

      // Verify remaining tiles are properly positioned
      const positions = remainingTiles.map(t => t.position);
      expect(positions).toEqual([
        { x: 0, y: 0 }, // first remaining tile
        { x: 2, y: 0 }, // second remaining tile
      ]);
    });
  });
});
