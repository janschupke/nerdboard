# Dragboard Framework

## Overview

Dragboard is a flexible, encapsulated framework for draggable and resizable dashboard layouts. It provides a unified API and context for managing tile arrangement, sizing, and user interactions. All drag and resize logic is implemented within this folder. Consumers interact with Dragboard only through its defined interface.

## Usage

1. **Wrap your dashboard in `DragboardProvider` and pass a configuration object:**

```tsx
import { DragboardProvider, DragboardGrid, DragboardTile } from 'dragboard';

const dragboardConfig = {
  columns: 6,
  rows: 4,
  tileSizes: {
    small: { colSpan: 1, rowSpan: 1 },
    medium: { colSpan: 2, rowSpan: 2 },
    large: { colSpan: 3, rowSpan: 3 },
  },
  breakpoints: { sm: 640, md: 768, lg: 1024 },
  consolidation: true, // always fill from top-left, no gaps
  movementEnabled: true, // allow drag-and-drop
  removable: true, // show X button to remove tiles
  dynamicExtensions: true, // allow board to grow rows if needed
  allowDragOutOfBounds: false, // dragging out of bounds removes tile if true, else reverts
};

<DragboardProvider
  config={dragboardConfig}
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
        <MyTile {...tile} />
      </DragboardTile>
    ))}
  </DragboardGrid>
</DragboardProvider>;
```

2. **All drag, resize, and tile board logic is managed by DragboardProvider.**
   - The host application should not implement or duplicate drag/resize/tile logic elsewhere.
   - Only interact with Dragboard through its context and exported API.

---

## API

### Components

- **DragboardProvider**: Provides dragboard context and manages drag/resize state. Props:
  - `config: DragboardConfig`
  - `tiles: DashboardTile[]`
  - `addTile(tile: DashboardTile): void`
  - `removeTile(id: string): void`
  - `updateTile(id: string, updates: Partial<DashboardTile>): void`
  - `moveTile(tileId: string, newPosition: { x: number; y: number }): void`
  - `reorderTiles(tiles: DashboardTile[]): void`
  - `children: React.ReactNode`
- **DragboardGrid**: Renders the dashboard grid layout. Props:
  - `children: React.ReactNode`
- **DragboardTile**: Wraps each tile, providing drag, drop, and resize handles. Props:
  - `id: string`
  - `position: { x: number; y: number }`
  - `size: 'small' | 'medium' | 'large'`
  - `children: React.ReactNode`

### Hooks

- **useDragboard()**: Access the dragboard context, including config, drag state, and tile actions.

### Helpers

- **rearrangeTiles(tiles: DashboardTile[]): DashboardTile[]**: Rearranges tiles to fit the grid.
- **findNextFreePosition(tiles: DashboardTile[], config: DragboardConfig, size: 'small' | 'medium' | 'large'): { x: number; y: number } | null**: Finds the next available position for a tile.

### Types

- **DashboardTile**: Represents a tile on the dashboard.
- **TileType**: Union of allowed tile type strings.
- **TileSize**: Union of allowed tile size strings.
- **DraggableTileProps**: Props for draggable tile components.
- **DragboardConfig**: Grid and sizing configuration (see below for all options).
- **DragboardContextValue**: Context value shape for useDragboard (see below for all options).

---

## Types

### DashboardTile

```ts
interface DashboardTile {
  id: string;
  type: TileType;
  position: { x: number; y: number };
  size: TileSize;
  config?: Record<string, unknown>;
  createdAt?: number;
}
```

### TileType / TileSize

```ts
// TileType example
type TileType = 'custom-type-1' | 'custom-type-2' | ...;

type TileSize = 'small' | 'medium' | 'large';
```

### DraggableTileProps

```ts
interface DraggableTileProps {
  id: string;
  position: { x: number; y: number };
  size: 'small' | 'medium' | 'large';
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onRemove?: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
  'data-tile-id'?: string;
  'data-tile-type'?: string;
  role?: string;
  'aria-label'?: string;
}
```

### DragboardConfig

```ts
interface DragboardConfig {
  columns: number;
  rows: number;
  tileSizes: Record<'small' | 'medium' | 'large', { colSpan: number; rowSpan: number }>;
  breakpoints: Record<string, number>;
  /** If true, tiles are always consolidated (no gaps, always fill from top-left). Default: true */
  consolidation?: boolean;
  /** If true, tiles can be moved by drag. Default: true */
  movementEnabled?: boolean;
  /** If true, tiles can be removed (X button shown). Default: true */
  removable?: boolean;
  /** If true, board will dynamically add rows if a tile doesn't fit. Default: true */
  dynamicExtensions?: boolean;
  /** If true, dragging a tile out of bounds will remove it. If false, tile returns to original position. Default: false */
  allowDragOutOfBounds?: boolean;
}
```

### DragboardContextValue

```ts
interface DragboardContextValue {
  config: DragboardConfig;
  dragState: DragboardDragState;
  startTileDrag: (tileId: string, origin: { x: number; y: number }) => void;
  updateTileDrag: (offset: { x: number; y: number }) => void;
  endTileDrag: (dropTarget: { x: number; y: number } | null, tileId?: string) => void;
  startSidebarDrag: (tileType: string) => void;
  endSidebarDrag: (dropTarget: { x: number; y: number } | null, tileType?: string) => void;
  setDropTarget: (target: { x: number; y: number } | null) => void;
  tiles: DashboardTile[];
  addTile: (tile: DashboardTile) => void;
  removeTile: (id: string) => void;
  updateTile: (id: string, updates: Partial<DashboardTile>) => void;
  moveTile: (tileId: string, newPosition: { x: number; y: number }) => void;
  reorderTiles: (tiles: DashboardTile[]) => void;
  /** If false, disables drag-and-drop for tiles */
  movementEnabled?: boolean;
  /** If false, disables remove (X) button for tiles */
  removable?: boolean;
  /** Current row count (for dynamic extension/reduction) */
  rows: number;
}
```

---

## Feature Behaviors & Config Options

### Consolidation

- If `consolidation` is true (default), tiles are always packed from the top-left, with no gaps. Any add, move, or remove will trigger automatic consolidation.
- If false, tiles can be placed freely and will not be automatically rearranged.

### Dynamic Row Extension & Reduction

- If `dynamicExtensions` is true (default), the board will automatically add rows if a tile is added or moved and would not fit in the current grid.
- If false, adding or moving a tile that would not fit throws an error.
- Rows are only extended after a tile is actually added or moved (never during drag preview).
- After a tile is removed or moved, if there are empty rows at the bottom (above the default row count), the board will shrink to the highest occupied row, but never below the default.
- If consolidation is off and there are tiles on non-contiguous rows, rows are only reduced if there are no tiles in the highest row(s).

### Drag Out of Bounds

- If `allowDragOutOfBounds` is false (default), dragging a tile out of bounds will return it to its original position.
- If true, dragging a tile out of bounds will remove it from the board.

### Movement & Removability

- If `movementEnabled` is false, drag-and-drop is disabled for all tiles.
- If `removable` is false, the X (remove) button is hidden and tiles cannot be removed via UI.

---

## Example: Adding Tiles from an External Component

You can add tiles to the Dragboard from any external component using the `useDragboard` hook. For example:

```tsx
import { useDragboard, findNextFreePosition } from 'dragboard';

function TileCatalog() {
  const { tiles, addTile, removeTile } = useDragboard();

  const handleAddTile = (tileType) => {
    const position = findNextFreePosition(tiles, config, 'medium') || { x: 0, y: 0 };
    addTile({
      id: `tile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: tileType,
      position,
      size: 'medium',
      createdAt: Date.now(),
    });
  };

  // ... render UI, call handleAddTile on user action
}
```

---

## Example: Dragging to Add a Tile from an External Component

You can enable drag-and-drop from an external component (such as a tile catalog) onto the Dragboard. The following example shows how to set up a draggable tile source and how Dragboard handles the drop:

```tsx
// TileCatalogItem.tsx (draggable source)
function TileCatalogItem({ tileType }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/dragboard-tile-type', tileType);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      // ...other props
    >
      {tileType}
    </div>
  );
}

// DragboardGrid will handle the drop event and call the appropriate context actions.
// No additional drop logic is needed in the external component.
```

When a user drags a tile type from the external component and drops it onto the Dragboard, the Dragboard context will handle the drop and add the new tile at the drop position.

---

## Edge Cases & Error Handling

- **Full Board:** If `dynamicExtensions` is false and the board is full, adding or moving a tile that would not fit will throw an error.
- **Row Reduction:** After removing or moving a tile, if there are no tiles in the last row(s) above the default, the board will shrink to the highest occupied row.
- **Drag Preview:** The board will never extend rows just to preview a drag; rows are only extended after a tile is actually added or moved.
- **Drag Out of Bounds:** If `allowDragOutOfBounds` is false, dragging a tile out of bounds will return it to its original position. If true, the tile will be removed.
- **Non-Contiguous Rows:** If consolidation is off and there are tiles on non-contiguous rows, rows are only reduced if there are no tiles in the highest row(s).

---

## Notes

- All drag/resize/tile logic must be encapsulated here.
- Consumers must interact with Dragboard only through the defined interface.
- Use Tailwind theme classes for all styling.
