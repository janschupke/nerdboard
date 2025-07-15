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
- **DragboardConfig**: Grid and sizing configuration.
- **DragboardContextValue**: Context value shape for useDragboard.

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
}
```

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

## Notes

- All drag/resize/tile logic must be encapsulated here.
- Consumers must interact with Dragboard only through the defined interface.
- Use Tailwind theme classes for all styling.
