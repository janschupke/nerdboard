import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboard } from './useDashboard';
import { DashboardProvider } from '../contexts/DashboardContext';
import { TileType } from '../types/dashboard';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('provides initial state', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: DashboardProvider,
    });

    expect(result.current.state.tiles).toEqual([]);
    expect(result.current.state.sidebarOpen).toBe(true);
    expect(result.current.state.loading).toBe(false);
  });

  it('adds tile correctly', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: DashboardProvider,
    });

    act(() => {
      result.current.addTile(TileType.CRYPTOCURRENCY);
    });

    expect(result.current.state.tiles).toHaveLength(1);
    expect(result.current.state.tiles[0].type).toBe('cryptocurrency');
    expect(result.current.state.tiles[0].id).toBeDefined();
  });

  it('removes tile correctly', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: DashboardProvider,
    });

    // Add a tile first
    act(() => {
      result.current.addTile(TileType.CRYPTOCURRENCY);
    });

    const tileId = result.current.state.tiles[0].id;

    // Remove the tile
    act(() => {
      result.current.removeTile(tileId);
    });

    expect(result.current.state.tiles).toHaveLength(0);
  });

  it('toggles sidebar correctly', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: DashboardProvider,
    });

    expect(result.current.state.sidebarOpen).toBe(true);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.state.sidebarOpen).toBe(false);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.state.sidebarOpen).toBe(true);
  });

  it('updates tile config correctly', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: DashboardProvider,
    });

    // Add a tile first
    act(() => {
      result.current.addTile(TileType.CRYPTOCURRENCY);
    });

    const tileId = result.current.state.tiles[0].id;

    // Update the tile config
    act(() => {
      result.current.updateTileConfig(tileId, { size: 'large' });
    });

    expect(result.current.state.tiles[0].size).toBe('large');
  });

  it('moves tiles correctly', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: DashboardProvider,
    });

    // Add two tiles
    act(() => {
      result.current.addTile(TileType.CRYPTOCURRENCY);
      result.current.addTile(TileType.PRECIOUS_METALS);
    });

    expect(result.current.state.tiles).toHaveLength(2);
    expect(result.current.state.tiles[0].type).toBe('cryptocurrency');
    expect(result.current.state.tiles[1].type).toBe('precious_metals');

    // Move first tile to second position
    act(() => {
      result.current.moveTile(0, 1);
    });

    expect(result.current.state.tiles[0].type).toBe('precious_metals');
    expect(result.current.state.tiles[1].type).toBe('cryptocurrency');
  });

  it('generates unique tile IDs', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: DashboardProvider,
    });

    act(() => {
      result.current.addTile(TileType.CRYPTOCURRENCY);
      result.current.addTile(TileType.CRYPTOCURRENCY);
    });

    const tileIds = result.current.state.tiles.map(tile => tile.id);
    expect(tileIds[0]).not.toBe(tileIds[1]);
  });

  it('creates tiles with correct default properties', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: DashboardProvider,
    });

    act(() => {
      result.current.addTile(TileType.CRYPTOCURRENCY);
    });

    const tile = result.current.state.tiles[0];
    expect(tile.type).toBe('cryptocurrency');
    expect(tile.size).toBe('medium');
    expect(tile.position).toBeDefined();
    expect(tile.config).toEqual({});
  });

  it('handles multiple tile types', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: DashboardProvider,
    });

    act(() => {
      result.current.addTile(TileType.CRYPTOCURRENCY);
      result.current.addTile(TileType.PRECIOUS_METALS);
    });

    expect(result.current.state.tiles).toHaveLength(2);
    expect(result.current.state.tiles[0].type).toBe('cryptocurrency');
    expect(result.current.state.tiles[1].type).toBe('precious_metals');
  });

  it('persists state to localStorage', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: DashboardProvider,
    });

    act(() => {
      result.current.addTile(TileType.CRYPTOCURRENCY);
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('loads state from localStorage on mount', () => {
    const savedState = {
      tiles: [
        {
          id: 'saved-tile-1',
          type: 'cryptocurrency',
          position: { x: 0, y: 0 },
          size: 'medium',
          config: {},
        },
      ],
      sidebarOpen: false,
      loading: false,
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

    const { result } = renderHook(() => useDashboard(), {
      wrapper: DashboardProvider,
    });

    expect(result.current.state.tiles).toHaveLength(1);
    expect(result.current.state.tiles[0].id).toBe('saved-tile-1');
    expect(result.current.state.sidebarOpen).toBe(false);
  });
}); 
