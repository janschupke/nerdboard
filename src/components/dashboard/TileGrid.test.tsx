import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TileGrid } from './TileGrid';
import { DashboardProvider, DashboardContext } from '../../contexts/DashboardContext';
import React from 'react';
import { TileType } from '../../types/dashboard';

// Mock Tile component
vi.mock('./Tile', () => ({
  Tile: ({ tile, children }: { tile: Record<string, unknown>; children?: React.ReactNode }) => (
    <div data-testid={`draggable-tile-${tile.id as string}`}>{children}</div>
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
  }) => <div data-testid={`draggable-tile-${tile.id as string}`}>{children}</div>,
}));

// Mock the dimensions module with all exports
vi.mock('../../constants/dimensions', () => ({
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
  return (
    <div>
      <button onClick={() => ctx.addTile('cryptocurrency' as TileType)} data-testid="add-crypto">Add Crypto</button>
      <button onClick={() => ctx.addTile('precious-metals' as TileType)} data-testid="add-metals">Add Metals</button>
      <button onClick={() => ctx.addTile('weather-helsinki' as TileType)} data-testid="add-weather">Add Weather</button>
      <button onClick={() => ctx.removeTile('cryptocurrency')} data-testid="remove-crypto">Remove Crypto</button>
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
      </DashboardProvider>
    );
  }

  it('renders empty state when no tiles', () => {
    setup();
    expect(screen.getByText('No tiles yet')).toBeInTheDocument();
    expect(screen.getByText('Add tiles from the sidebar to start building your dashboard')).toBeInTheDocument();
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

  // You can add more tests for compaction, drop zone, etc., using the same pattern
});
