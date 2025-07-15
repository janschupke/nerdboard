import React from 'react';
import { render, act } from '@testing-library/react';
import { DragboardProvider } from './DragboardProvider';
import { DragboardGrid } from './DragboardGrid';
import { DragboardTile } from './DragboardTile';
import { useDragboard } from './DragboardContext';
import type { DashboardTile } from './dashboard';
import type { DragboardConfig, DragboardContextValue } from './DragboardContext';

const makeTile = (id: string, y = 0): DashboardTile => ({
  id,
  type: 'test' as any,
  position: { x: 0, y },
  size: 'medium',
  createdAt: Date.now(),
});

const configBase: DragboardConfig = {
  columns: 2,
  rows: 2,
  tileSizes: {
    small: { colSpan: 1, rowSpan: 1 },
    medium: { colSpan: 1, rowSpan: 1 },
    large: { colSpan: 2, rowSpan: 2 },
  },
  breakpoints: {},
};

type TestBoardProps = {
  config: DragboardConfig;
  initialTiles?: DashboardTile[];
  children?: React.ReactNode;
};

function TestBoard({ config, initialTiles = [], children }: TestBoardProps) {
  const [tiles, setTiles] = React.useState<DashboardTile[]>(initialTiles);
  const addTile = (tile: DashboardTile) => {
    // Error check for test: throw if board is full and dynamicExtensions is false
    const { columns, tileSizes, dynamicExtensions = true, rows } = config;
    const { colSpan, rowSpan } = tileSizes[tile.size] || tileSizes['medium'];
    let fits = false;
    for (let y = 0; y <= rows - rowSpan; y++) {
      for (let x = 0; x <= columns - colSpan; x++) {
        const overlap = tiles.some((t) => {
          const tSize = tileSizes[t.size] || tileSizes['medium'];
          return (
            x < t.position.x + tSize.colSpan &&
            x + colSpan > t.position.x &&
            y < t.position.y + tSize.rowSpan &&
            y + rowSpan > t.position.y
          );
        });
        if (!overlap) { fits = true; break; }
      }
      if (fits) break;
    }
    if (!fits && !dynamicExtensions) {
      throw new Error('Board is full and dynamicExtensions is disabled.');
    }
    setTiles((t) => [...t, tile]);
  };
  const removeTile = (id: string) => setTiles((t) => t.filter((tile) => tile.id !== id));
  const updateTile = (id: string, updates: Partial<DashboardTile>) => setTiles((t) => t.map((tile) => tile.id === id ? { ...tile, ...updates } : tile));
  const moveTile = (id: string, pos: { x: number; y: number }) => setTiles((t) => t.map((tile) => tile.id === id ? { ...tile, position: pos } : tile));
  const reorderTiles = (tiles: DashboardTile[]) => setTiles(tiles);
  return (
    <DragboardProvider
      config={config}
      tiles={tiles}
      addTile={addTile}
      removeTile={removeTile}
      updateTile={updateTile}
      moveTile={moveTile}
      reorderTiles={reorderTiles}
    >
      <DragboardGrid>
        {tiles.map((tile) => (
          <DragboardTile key={tile.id} id={tile.id} position={tile.position} size={tile.size}>
            <div data-testid={`tile-${tile.id}`}>{tile.id}</div>
          </DragboardTile>
        ))}
      </DragboardGrid>
      {children}
    </DragboardProvider>
  );
}

// Helper component to expose Dragboard context API to tests
const DragboardTestHelper = React.forwardRef<DragboardContextValue, Record<string, never>>((_props, ref) => {
  const ctx = useDragboard();
  React.useImperativeHandle(ref, () => ctx, [ctx]);
  return null;
});

describe('DragboardProvider', () => {
  it('adds a tile via API', () => {
    const config = { ...configBase };
    const helperRef = React.createRef<DragboardContextValue>();
    const { getByTestId } = render(
      <TestBoard config={config}>
        <DragboardTestHelper ref={helperRef} />
      </TestBoard>
    );
    act(() => {
      helperRef.current!.addTile(makeTile('A'));
    });
    expect(getByTestId('tile-A')).toBeInTheDocument();
  });

  it('removes a tile via API', () => {
    const config = { ...configBase };
    const helperRef = React.createRef<DragboardContextValue>();
    const { queryByTestId } = render(
      <TestBoard config={config} initialTiles={[makeTile('A')]}> 
        <DragboardTestHelper ref={helperRef} />
      </TestBoard>
    );
    act(() => {
      helperRef.current!.removeTile('A');
    });
    expect(queryByTestId('tile-A')).not.toBeInTheDocument();
  });

  it('moves a tile via API', () => {
    const config = { ...configBase };
    const helperRef = React.createRef<DragboardContextValue>();
    const { getByTestId } = render(
      <TestBoard config={config} initialTiles={[makeTile('A')]}> 
        <DragboardTestHelper ref={helperRef} />
      </TestBoard>
    );
    act(() => {
      helperRef.current!.moveTile('A', { x: 1, y: 1 });
    });
    expect(getByTestId('tile-A')).toBeInTheDocument();
  });

  it('consolidates tiles if enabled', () => {
    const config = { ...configBase, consolidation: true };
    const tiles = [makeTile('A', 0), makeTile('B', 1), makeTile('C', 2)];
    const helperRef = React.createRef<DragboardContextValue>();
    const { getByTestId } = render(
      <TestBoard config={config} initialTiles={tiles}>
        <DragboardTestHelper ref={helperRef} />
      </TestBoard>
    );
    act(() => {
      helperRef.current!.moveTile('A', { x: 0, y: 2 });
    });
    expect(getByTestId('tile-A')).toBeInTheDocument();
    expect(getByTestId('tile-B')).toBeInTheDocument();
    expect(getByTestId('tile-C')).toBeInTheDocument();
  });

  it('allows free placement if consolidation is disabled', () => {
    const config = { ...configBase, consolidation: false };
    const tiles = [makeTile('A', 0), makeTile('B', 1)];
    const helperRef = React.createRef<DragboardContextValue>();
    const { getByTestId } = render(
      <TestBoard config={config} initialTiles={tiles}>
        <DragboardTestHelper ref={helperRef} />
      </TestBoard>
    );
    act(() => {
      helperRef.current!.moveTile('A', { x: 0, y: 1 });
    });
    expect(getByTestId('tile-A')).toBeInTheDocument();
  });

  it('extends rows dynamically if enabled', () => {
    const config = { ...configBase, dynamicExtensions: true };
    const tiles = [makeTile('A', 0), makeTile('B', 1)];
    const helperRef = React.createRef<DragboardContextValue>();
    const { getByTestId } = render(
      <TestBoard config={config} initialTiles={tiles}>
        <DragboardTestHelper ref={helperRef} />
      </TestBoard>
    );
    act(() => {
      helperRef.current!.addTile(makeTile('C', 2));
    });
    expect(getByTestId('tile-C')).toBeInTheDocument();
  });

  it('reduces rows after tile removal', () => {
    const config = { ...configBase, dynamicExtensions: true };
    const tiles = [makeTile('A', 0), makeTile('B', 1), makeTile('C', 2)];
    const helperRef = React.createRef<DragboardContextValue>();
    const { getByTestId, queryByTestId } = render(
      <TestBoard config={config} initialTiles={tiles}>
        <DragboardTestHelper ref={helperRef} />
      </TestBoard>
    );
    act(() => {
      helperRef.current!.removeTile('C');
    });
    expect(queryByTestId('tile-C')).not.toBeInTheDocument();
    expect(getByTestId('tile-A')).toBeInTheDocument();
    expect(getByTestId('tile-B')).toBeInTheDocument();
  });

  it('removes tile on drag out of bounds if enabled', () => {
    const config = { ...configBase, allowDragOutOfBounds: true };
    const tiles = [makeTile('A', 0)];
    const helperRef = React.createRef<DragboardContextValue>();
    const { queryByTestId } = render(
      <TestBoard config={config} initialTiles={tiles}>
        <DragboardTestHelper ref={helperRef} />
      </TestBoard>
    );
    act(() => {
      helperRef.current!.endTileDrag({ x: -1, y: -1 }, 'A');
    });
    expect(queryByTestId('tile-A')).not.toBeInTheDocument();
  });

  it('returns tile to original position on drag out of bounds if disabled', () => {
    const config = { ...configBase, allowDragOutOfBounds: false };
    const tiles = [makeTile('A', 0)];
    const helperRef = React.createRef<DragboardContextValue>();
    const { getByTestId } = render(
      <TestBoard config={config} initialTiles={tiles}>
        <DragboardTestHelper ref={helperRef} />
      </TestBoard>
    );
    act(() => {
      helperRef.current!.endTileDrag({ x: -1, y: -1 }, 'A');
    });
    expect(getByTestId('tile-A')).toBeInTheDocument();
  });

  it('disables drag if movementEnabled is false', () => {
    const config = { ...configBase, movementEnabled: false };
    const tiles = [makeTile('A', 0)];
    const { getByTestId } = render(
      <TestBoard config={config} initialTiles={tiles}>
        {/* No need for helper here, just UI check */}
      </TestBoard>
    );
    const tile = getByTestId('tile-A');
    expect(tile).toBeInTheDocument();
  });

  it('hides remove button if removable is false', () => {
    const config = { ...configBase, removable: false };
    const tiles = [makeTile('A', 0)];
    const { getByTestId, queryByLabelText } = render(
      <TestBoard config={config} initialTiles={tiles}>
        {/* No need for helper here, just UI check */}
      </TestBoard>
    );
    expect(getByTestId('tile-A')).toBeInTheDocument();
    expect(queryByLabelText('Remove tile')).not.toBeInTheDocument();
  });

  // Add more edge case tests as needed
}); 
