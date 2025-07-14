# Dragboard Framework

## Overview

Dragboard is a flexible, encapsulated framework for draggable and resizable dashboard layouts. It provides a unified API and context for managing tile arrangement, sizing, and user interactions. All drag and resize logic is implemented within this folder. The main app and tiles interact with Dragboard only through its defined interface.

## Usage

1. **Wrap your dashboard in `DragboardProvider` and pass a configuration object:**

```tsx
import { DragboardProvider, DragboardGrid, DragboardTile } from './dragboard';

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

<DragboardProvider config={dragboardConfig}>
  <DragboardGrid>
    {tiles.map(tile => (
      <DragboardTile key={tile.id} id={tile.id} position={tile.position} size={tile.size}>
        <MyTile {...tile} />
      </DragboardTile>
    ))}
  </DragboardGrid>
</DragboardProvider>
```

2. **All drag and resize logic must be implemented in this folder.**
   - The main app should not implement or duplicate drag/resize logic elsewhere.
   - Only interact with Dragboard through its context and exported API.

## API

- `DragboardProvider`: Context provider for drag/resize state and configuration.
- `DragboardGrid`: Renders the dashboard grid layout.
- `DragboardTile`: Wraps each tile, providing drag, drop, and resize handles.
- `useDragboard`: Access Dragboard config and state.
- `DragboardConfig`: Type for grid and sizing configuration.

## Configuration Example

```
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
```

## Notes
- All drag/resize logic must be encapsulated here.
- The app must interact with Dragboard only through the defined interface.
- Use Tailwind theme classes for all styling. 
